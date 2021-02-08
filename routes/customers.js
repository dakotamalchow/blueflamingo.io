const express = require("express");
const router = express.Router({mergeParams:true});
const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu')

const catchAsync = require("../utils/catchAsync");
const Customer = require("../models/customer");
const {isLoggedIn,validateCustomerReqBody} = require("../utils/middleware");

router.get("/",isLoggedIn,catchAsync(async(req,res)=>{
    const user = res.locals.currentUser;
    req.session.returnTo = req.originalUrl;
    const customers = await Customer.find({user});
    let stripeCustomers = [];
    for (let customer of customers){
        let stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomer);
        stripeCustomers.push(stripeCustomer);
    };
    res.render("customers/index",{stripeCustomers});
}));

router.get("/new",isLoggedIn,(req,res)=>{
    const returnToUrl = req.session.returnTo || "/customers";
    delete req.session.returnTo;
    res.render("customers/new",{returnToUrl});
});

router.post("/",isLoggedIn,validateCustomerReqBody,catchAsync(async(req,res,next)=>{
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

router.get("/:id",isLoggedIn,catchAsync(async(req,res)=>{
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);
    const stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomer);
    res.render("customers/details",{stripeCustomer});
}));

router.get("/:id/edit",isLoggedIn,catchAsync(async(req,res)=>{
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);
    const stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomer);
    res.render("customers/edit",{stripeCustomer});
}));

router.post("/:id",isLoggedIn,validateCustomerReqBody,catchAsync(async(req,res)=>{
    const customerId = req.params.id;
    const {name,email} = req.body;
    const customer = await Customer.findByIdAndUpdate(customerId,{name,email},{new:true});
    await stripe.customers.update(customer.stripeCustomer,
        {name,email}
    );
    res.redirect(`/customers/${customer._id}`);
}));

module.exports = router;