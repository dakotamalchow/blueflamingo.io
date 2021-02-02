const express = require("express");
const router = express.Router();
const passport = require("passport");

const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

router.get("/register",(req,res)=>{
    res.render("users/register");
});

router.post("/register",catchAsync(async(req,res)=>{
    const {name,businessName,email,password} = req.body;
    const user = new User({name,businessName,email});
    const regUser = await User.register(user,password);
    res.redirect("/invoices");
}));

router.get("/login",(req,res)=>{
    res.render("users/login");
});

router.post("/login",passport.authenticate("local"),(req,res)=>{
    res.redirect("/invoices");
});

module.exports = router;