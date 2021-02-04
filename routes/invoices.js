const express = require("express");
const router = express.Router({mergeParams:true});
const path = require("path");
const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');
const nodemailer = require("nodemailer");
const aws = require("aws-sdk");

const catchAsync = require("../utils/catchAsync");
const Invoice = require("../models/invoice");
const {isLoggedIn} = require("../utils/middleware");

aws.config.loadFromPath(path.join(__dirname,"../aws-config.json"));

const transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: "2010-12-01"
    })
});

router.get("/",isLoggedIn,catchAsync(async(req,res)=>{
    const invoices = await Invoice.find({user:res.locals.currentUser})
    res.render("billing/index",{invoices});
}));

router.get("/new",isLoggedIn,(req,res)=>{
    res.render("billing/new");
});

router.post("/",isLoggedIn,catchAsync(async(req,res)=>{
    console.log(req.body);
    const {name,email,amount,notes} = req.body;
    const user = res.locals.currentUser;
    const status = "SENT";
    const invoice = new Invoice({user,name,email,amount,notes,status});
    invoice.save((err)=>{
        if(err){
            console.log("error:",err);
        }
    });

    const mailOptions = {
        from: "billing@blueflamingo.io",
        to: "dakotamalchow@blueflamingo.io",
        subject: "Invoice",
        text: "This is your invoice. Follow the link to pay now: http://localhost:3000/invoices/"+invoice._id+"/pay",
        html: "This is your invoice. <br><a href='http://localhost:3000/invoices/"+invoice._id+"/pay'>Pay now.</a>"
    }
    transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
            console.log("Error: ",err);
        } else {
            console.log("Email sent: ",info.response);
        }
    });
    res.redirect("/invoices");
}));

router.get("/:id/pay",catchAsync(async(req,res)=>{
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId);
    const intent = await stripe.paymentIntents.create({
        amount: invoice.amount*100,
        currency: "usd",
    });
    res.render("billing/pay",{invoice,client_secret:intent.client_secret});
}));

router.post("/:id/update",isLoggedIn,catchAsync(async(req,res)=>{
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId);
    invoice.status = "PAID";
    invoice.save((err)=>{
        if(err){
            console.log("error:",err);
        }
    });
    const mailOptions = {
        from: "billing@blueflamingo.io",
        to: "dakotamalchow@blueflamingo.io",
        subject: "Invoice Paid",
        text: "Your invoice has been paid. This is a receipt for your records.",
        html: "Your invoice has been paid. This is a receipt for your records."
    }
    transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
            console.log("Error: ",err);
        } else {
            console.log("Email sent: ",info.response);
        }
    });
    // res.redirect(303,"/invoices");
}));

module.exports = router;