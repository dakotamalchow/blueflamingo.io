const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_F7a54OYuDnabmUT6HN2pLiDu");

const Payment = require("./models/payment");

mongoose.connect("mongodb://localhost:27017/blueflamingo",{useNewUrlParser:true,useUnifiedTopology:true})
    .then(() => {
        console.log("Mongo connection open");
    })
    .catch(error => {
        console.log("Error connecting to Mongo: " + error);
    });

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}))
app.use(express.static("."));
app.use(express.json());
app.use(methodOverride("_method"));

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/payments",async(req,res)=>{
    const payments = await Payment.find({})
    res.render("payments",{payments});
});

app.get("/request-payment",(req,res)=>{
    res.render("request-payment");
});

app.post("/request-payment",async(req,res)=>{
    const {name,email,amount,notes} = req.body;
    const status = "SENT";
    const payment = new Payment({name,email,amount,notes,status});
    payment.save((err)=>{
        if(err){
            console.log("error:",err);
        }
    });
    res.redirect("/payments");
});

app.get("/make-payment/:id",async(req,res)=>{
    const paymentId = req.params.id;
    const payment = await Payment.findById(paymentId);
    res.render("make-payment",{payment});
});

app.post("/make-payment/:id",async(req,res)=>{
    const paymentId = req.params.id;
    const payment = await Payment.findById(paymentId);
    const paymentIntent = await stripe.paymentIntents.create({
        amount: payment.amount*100,
        currency: "usd"
    });
    res.send({
        clientSecret: paymentIntent.client_secret
    });
});

app.put("/update-status/:id",async(req,res)=>{
    const paymentId = req.params.id;
    const payment = await Payment.findById(paymentId);
    payment.status = "PAID";
    payment.save((err)=>{
        if(err){
            console.log("error:",err);
        }
    });
    // res.redirect(303,"/payments");
})

app.delete("/delete-all",async(req,res)=>{
    const deleted = await Payment.deleteMany({});
    res.redirect("/payments");
})

app.listen(3000,()=>{
    console.log("App is listening on Port 3000");
});