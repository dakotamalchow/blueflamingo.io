const express = require("express");
const router = express.Router();
const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu')

const catchAsync = require("../utils/catchAsync");
const Customer = require("../models/customer");

router.get("/new",(req,res)=>{
    res.render("customers/new");
});

router.post("/",catchAsync(async(req,res,next)=>{
    const {name,email} = req.body;
    const user = res.locals.currentUser;
    const customer = new Customer({user,name,email});
    const stripeCustomer = await stripe.customers.create({
        name,
        email,
        metadata:{
            customerId: customer.id
        }
    });
    customer.stripeCustomer = stripeCustomer.id;
    await customer.save();
    res.redirect("/invoices/new");
}));

module.exports = router;