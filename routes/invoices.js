const express = require("express");
const router = express.Router({mergeParams:true});
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');
const aws = require("aws-sdk");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const catchAsync = require("../utils/catchAsync");
const Invoice = require("../models/invoice");
const Customer = require("../models/customer");
const {isLoggedIn,validateInvoiceReqBody} = require("../utils/middleware");

aws.config.loadFromPath(path.join(__dirname,"../aws-config.json"));
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get("/",isLoggedIn,catchAsync(async(req,res)=>{
    const user = res.locals.currentUser;
    const invoices = await Invoice.find({user});
    let stripeInvoices = [];
    const invoiceStatus = req.query.status;
    for (let invoice of invoices){
        let stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice);
        if(!invoiceStatus || (invoiceStatus===stripeInvoice.status)){
            stripeInvoices.push(stripeInvoice);
        }
    };
    res.render("billing/index",{stripeInvoices,invoiceStatus});
}));

router.get("/new",isLoggedIn,catchAsync(async(req,res)=>{
    const customers = await Customer.find({});
    req.session.returnTo = req.originalUrl;
    res.render("billing/new",{customers});
}));

router.post("/",isLoggedIn,validateInvoiceReqBody,catchAsync(async(req,res)=>{
    const {customerId,lineItems,notes} = req.body;
    const user = res.locals.currentUser;
    const customer = await Customer.findById(customerId);
    
    const invoiceCount = user.increaseInvoiceCount();
    const invoiceNumber = String(invoiceCount).padStart(4,"0");
    const invoice = new Invoice({user,customer,invoiceNumber});
    //lineItems comes back as nested objects, so this returns an array
    for(let item of Object.values(lineItems)){
        const stripeAmount = parseFloat(item.amount)*100;
        await stripe.invoiceItems.create({
            customer: customer.stripeCustomer,
            amount: stripeAmount,
            currency: "usd",
            description: item.description
        });
    };
    const stripeInvoice = await stripe.invoices.create({
        customer: customer.stripeCustomer,
        transfer_data:{
            destination:user.stripeAccount
        },
        description: notes,
        collection_method: "send_invoice",
        days_until_due: 30,
        metadata:{
            invoiceId: invoice.id,
            invoiceNumber: invoiceNumber
        }
    });
    invoice.stripeInvoice = stripeInvoice.id;
    await invoice.save();

    await stripe.invoices.sendInvoice(invoice.stripeInvoice);
    req.flash("success","Successfully created and sent invoice");
    res.redirect("/invoices");
}));

router.get("/:id",isLoggedIn,catchAsync(async(req,res)=>{
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId);
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice);
    res.render("billing/details",{stripeInvoice});
}));

router.post("/:id/send",async(req,res)=>{
    const invoiceId = req.params.id;
    // const user = res.locals.currentUser;
    // const userName = user.businessName || user.name;
    const userName = "Richard's Construction";
    const invoice = await Invoice.findById(invoiceId);
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice);
    const invoiceTemplate = fs.readFileSync("views/email/invoice.ejs",{encoding:"utf-8"});
    let statusColor = "";
    switch(stripeInvoice.status){
        case "draft":
            //secondary - grey
            statusColor += "#6c757d";
            break;
        case "open":
            //success - green
            statusColor += "#28a745";
            break;
        case "paid":
            //primary - blue
            statusColor += "#0040F0";
            break;
        default:
            //danger - red
            statusColor += "#dc3545"
    };
    const msg = {
        to:"dakotamalchow@gmail.com",
        from:"billing@blueflamingo.io",
        subject:`New Invoice from ${userName}`,
        text:`${userName} sent you a new invoice for $${(stripeInvoice.amount_due/100).toFixed(2)}. Please visit blueflamingo.io/invoices/${stripeInvoice.metadata.invoiceId}/pay to pay your invoice.`,
        html:ejs.render(invoiceTemplate,{stripeInvoice,userName,statusColor})
    };
    await sgMail.send(msg);
    res.send("Email sent");
});

router.get("/:id/test",async(req,res)=>{
    const invoiceId = req.params.id;
    // const user = res.locals.currentUser;
    // const userName = user.businessName || user.name;
    const userName = "Richard's Construction";
    const invoice = await Invoice.findById(invoiceId);
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice);
    const invoiceTemplate = fs.readFileSync("views/email/invoice.ejs",{encoding:"utf-8"});
    let statusColor = "";
    switch(stripeInvoice.status){
        case "draft":
            //secondary - grey
            statusColor += "#6c757d";
            break;
        case "open":
            //success - green
            statusColor += "#28a745";
            break;
        case "paid":
            //primary - blue
            statusColor += "#0040F0";
            break;
        default:
            //danger - red
            statusColor += "#dc3545"
    };
    res.send(ejs.render(invoiceTemplate,{stripeInvoice,userName,statusColor}));
});

module.exports = router;