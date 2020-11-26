const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const stripe = require("stripe")('sk_test_F7a54OYuDnabmUT6HN2pLiDu');
const session = require("express-session");
const mongoStore = require("connect-mongo")(session);

const Product = require("./models/product");

const domain = 'http://localhost:3030';

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

app.post('/create-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Test Item',
            //images: ['https://i.imgur.com/EHyR2nP.png'],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${domain}/success.html`,
    cancel_url: `${domain}/cancel.html`,
  });
  res.json({ id: session.id });
});

app.listen(3000,()=>{
    console.log("App is listening on Port 3000");
});