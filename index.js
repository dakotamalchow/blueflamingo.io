const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

const Product = require("./models/product");

mongoose.connect("mongodb://localhost:27017/blueflamingo",{useNewUrlParser:true,useUnifiedTopology:true})
    .then(() => {
        console.log("Mongo connection open");
    })
    .catch(error => {
        console.log("Error connecting to Mongo: " + error);
    });

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static("_seedData"));

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/products",async (req,res)=>{
    const products = await Product.find({});
    res.render("products",{products});
});

app.listen(3000,()=>{
    console.log("App is listening on Port 3000");
});