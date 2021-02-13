const express = require("express");
const router = express.Router({mergeParams:true});
const path = require("path");
const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');
const aws = require("aws-sdk");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const catchAsync = require("../utils/catchAsync");
const Invoice = require("../models/invoice");
const Customer = require("../models/customer");
const {isLoggedIn,validateInvoiceReqBody} = require("../utils/middleware");
const {createInvoiceDraft,sendEmailInvoice} = require("../controllers/invoices");

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
    const invoice = await createInvoiceDraft(customerId,lineItems,notes,user);
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice)
    await stripe.invoices.finalizeInvoice(stripeInvoice.id);
    await sendEmailInvoice(invoice._id);
    req.flash("success","Successfully created and sent invoice");
    res.redirect("/invoices");
}));

router.get("/:id",isLoggedIn,catchAsync(async(req,res)=>{
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId);
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice);
    res.render("billing/details",{stripeInvoice});
}));

router.post("/:id/send",isLoggedIn,catchAsync(async(req,res)=>{
    sendEmailInvoice(req.params.id);
    res.send("Email sent");
}));

router.get("/:id/pay",catchAsync(async(req,res)=>{
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId);
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice);
    const userName = stripeInvoice.metadata.userName;
    res.render("billing/pay",{stripeInvoice,userName});
}));

router.post("/:id/pay",catchAsync(async(req,res)=>{
    const invoiceId = req.params.id;
    const paymentMethodId = req.body.stripePaymentMethod;
    const invoice = await Invoice.findById(invoiceId);
    const customer = await Customer.findById(invoice.customer);
    const stripeCustomerId = customer.stripeCustomer;
    await stripe.paymentMethods.attach(paymentMethodId,{customer:stripeCustomerId});
    await stripe.invoices.pay(invoice.stripeInvoice,{payment_method:paymentMethodId});
    req.flash("success","Thank you for your payment!");
    res.redirect(`/invoices/${invoiceId}/pay`);
}));

module.exports = router;