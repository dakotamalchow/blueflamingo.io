const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const stripe = require("stripe")("sk_test_F7a54OYuDnabmUT6HN2pLiDu");
const nodemailer = require("nodemailer");
const aws = require("aws-sdk");
const catchAsync = require("./utils/catchAsync");

const Payment = require("./models/payment");
const AppError = require("./utils/AppError");

mongoose.connect("mongodb://localhost:27017/blueflamingo",{useNewUrlParser:true,useUnifiedTopology:true})
    .then(() => {
        console.log("Mongo connection open");
    })
    .catch(error => {
        console.log("Error connecting to Mongo: " + error);
    });

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.engine("ejs",ejsMate);

app.use("/css",express.static(path.join(__dirname,"/public/css")));
app.use("/js",express.static(path.join(__dirname,"/public/js")));
app.use("/bootstrap-css", express.static(path.join(__dirname,"node_modules/bootstrap/dist/css")));
app.use("/bootstrap-js", express.static(path.join(__dirname,"node_modules/bootstrap/dist/js")));
app.use("/jquery-js", express.static(path.join(__dirname,"node_modules/jquery/dist")));

app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(methodOverride("_method"));

aws.config.loadFromPath(path.join(__dirname,"aws-config.json"));

const transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: "2010-12-01"
    })
});

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/payments",catchAsync(async(req,res)=>{
    const payments = await Payment.find({})
    res.render("billing/index",{payments});
}));

app.get("/payments/new",(req,res)=>{
    res.render("billing/new");
});

app.post("/payments",catchAsync(async(req,res)=>{
    const {name,email,amount,notes} = req.body;
    const status = "SENT";
    const payment = new Payment({name,email,amount,notes,status});
    payment.save((err)=>{
        if(err){
            console.log("error:",err);
        }
    });

    const mailOptions = {
        from: "billing@blueflamingo.io",
        to: "dakotamalchow@blueflamingo.io",
        subject: "Payment Requested",
        text: "This is a request for payment. Follow the link to pay your invoice: http://localhost:3000/make-payment/"+payment._id,
        html: "This is a request for payment. <br><a href='http://localhost:3000/make-payment/"+payment._id+"'>Pay your invoice.</a>"
    }
    transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
            console.log("Error: ",err);
        } else {
            console.log("Email sent: ",info.response);
        }
    });
    res.redirect("/payments");
}));

app.get("/payments/:id/pay",catchAsync(async(req,res)=>{
    const paymentId = req.params.id;
    const payment = await Payment.findById(paymentId);
    res.render("billing/pay",{payment});
}));

app.post("/payments/:id/pay",catchAsync(async(req,res)=>{
    const {amount} = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount*100,
        currency: "usd"
    });
    res.send({
        clientSecret: paymentIntent.client_secret
    });
}));

app.put("/payments/:id/update",catchAsync(async(req,res)=>{
    const paymentId = req.params.id;
    const payment = await Payment.findById(paymentId);
    payment.status = "PAID";
    payment.save((err)=>{
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
    // res.redirect(303,"/payments");
}));

app.delete("/payments",catchAsync(async(req,res)=>{
    const deleted = await Payment.deleteMany({});
    res.redirect("/payments");
}));

app.all("*",(req,res,next)=>{
    next(new AppError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
    const {status=500} = err;
    if(!err.message) err.message = "Error encountered";
    res.status(status).render("error",{err});
});

app.listen(3000,()=>{
    console.log("App is listening on Port 3000");
});