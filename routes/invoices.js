const express = require("express");
const router = express.Router({mergeParams:true});
const path = require("path");
const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');
const nodemailer = require("nodemailer");
const aws = require("aws-sdk");

const catchAsync = require("../utils/catchAsync");
const Invoice = require("../models/invoice");
const Customer = require("../models/customer");
const {isLoggedIn} = require("../utils/middleware");

aws.config.loadFromPath(path.join(__dirname,"../aws-config.json"));

const transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: "2010-12-01"
    })
});

router.get("/",isLoggedIn,catchAsync(async(req,res)=>{
    const invoices = await Invoice.find({user:res.locals.currentUser});
    let stripeInvoices = [];
    for (let invoice of invoices){
        let stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice);
        if(stripeInvoice.transfer_data.destination===res.locals.currentUser.stripeAccount){
            stripeInvoices.push(stripeInvoice);
        };
    };
    res.render("billing/index",{stripeInvoices});
}));

router.get("/new",isLoggedIn,catchAsync(async(req,res)=>{
    const customers = await Customer.find({});
    res.render("billing/new",{customers});
}));

router.post("/",isLoggedIn,catchAsync(async(req,res)=>{
    const {amount,notes,customerId} = req.body;
    const user = res.locals.currentUser;
    const customer = await Customer.findById(customerId);
    
    const invoiceNumber = user.increaseInvoiceCount();
    const invoice = new Invoice({user,customer,invoiceNumber});
    await stripe.invoiceItems.create({
        customer: customer.stripeCustomer,
        amount: amount*100,
        currency: "usd",
        description: notes
    });
    const stripeInvoice = await stripe.invoices.create({
        customer: customer.stripeCustomer,
        transfer_data:{
            destination:user.stripeAccount
        },
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
    res.redirect("/invoices");
}));

router.get("/:id",isLoggedIn,catchAsync(async(req,res)=>{
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId);
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice);
    res.render("billing/details",{stripeInvoice});
}));

module.exports = router;