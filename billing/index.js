const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

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
    const payment = new Payment({name,email,amount,notes});
    payment.save((err)=>{
        console.log(err);
    });
    res.redirect("/payments");
});

app.listen(3000,()=>{
    console.log("App is listening on Port 3000");
});