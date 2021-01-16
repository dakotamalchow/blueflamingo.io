const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const stripe = require("stripe")('sk_test_F7a54OYuDnabmUT6HN2pLiDu');
const session = require("express-session");
const mongoStore = require("connect-mongo")(session);
const passport = require("passport");
const passportLocal = require("passport-local");

const userRoutes = require("./routes/users");

const Cart = require("./models/cart");
const Product = require("./models/product");
const User = require("./models/user");

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
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: "testSecret",
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({mongooseConnection:mongoose.connection}),
    cookie: {maxAge:180*60*1000}
}));
app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use("/",userRoutes);
passport.use(new passportLocal(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/products",async (req,res)=>{
    const products = await Product.find({});
    res.render("products",{products});
});

app.get("/add-to-cart/:id",function(req,res){
    const productId = req.params.id;
    const cart = new Cart(req.session.cart?req.session.cart:{});
    Product.findById(productId,function(error,product){
        if(error){
            return res.redirect("/products");
        };
        cart.add(product,productId);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect("/products");
    });
});

app.get("/cart",function(req,res){
    if(!req.session.cart){
        return res.render("cart",{products:null});
    }
    const cart = new Cart(req.session.cart);
    res.render("cart",{products:cart.generateArray(),totalPrice:cart.totalPrice});
});

app.post('/create-session', async (req, res) => {
    const cart = new Cart(req.session.cart);
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
          unit_amount: cart.totalPrice*100,
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