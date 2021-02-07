const express = require("express");
const router = express.Router();
const passport = require("passport");
const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu')

const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

/*
router.get("/register",(req,res)=>{
    res.render("users/register");
});

router.post("/register",catchAsync(async(req,res,next)=>{
    const {name,businessName,email,password} = req.body;
    const account = await stripe.accounts.create({
        type:"express",
        country:"US",
        email,
        capabilities:{
            card_payments:{requested:true},
            transfers:{requested:true}
        }
    });
    const user = new User({name,businessName,email,stripeAccount:account.id});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser,err=>{
        if(err) {return next(err);}
    });
    const accountLinks = await stripe.accountLinks.create({
        account:account.id,
        refresh_url:"http://localhost:3000",
        return_url:"http://localhost:3000",
        type:"account_onboarding"
      });
      res.redirect(accountLinks.url);
}));
*/

router.get("/login",(req,res)=>{
    res.render("users/login");
});

router.post("/login",passport.authenticate("local"),(req,res)=>{
    const redirectUrl = req.session.returnTo || "/invoices";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get("/logout",(req,res)=>{
    req.logOut();
    res.redirect("/");
});

module.exports = router;