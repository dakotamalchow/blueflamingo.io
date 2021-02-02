const express = require("express");
const router = express.Router();
const passport = require("passport");

const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const { nextTick } = require("process");

router.get("/register",(req,res)=>{
    res.render("users/register");
});

router.post("/register",catchAsync(async(req,res,next)=>{
    const {name,businessName,email,password} = req.body;
    const user = new User({name,businessName,email});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser,err=>{
        if(err) {return next(err);}
        res.redirect("/invoices");
    });
}));

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