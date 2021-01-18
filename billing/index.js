const express = require("express");
const app = express();
const path = require("path");

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/request-payment",(req,res)=>{
    res.render("request-payment");
});

app.post("/request-payment",(req,res)=>{
    const {name,email,amount,notes} = req.body;
    res.redirect("/");
});

app.listen(3000,()=>{
    console.log("App is listening on Port 3000");
});