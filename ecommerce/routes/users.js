const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user");

router.get("/register",(req,res)=>{
    res.render("users/register");
});
router.post("/register",async(req,res)=>{
    const {email,username,password} = req.body;
    const user = new User({email,username});
    const registedUser = await User.register(user,password);
    res.redirect("/");
});

router.get("/login",(req,res)=>{
    res.render("users/login");
});
router.post("/login",passport.authenticate("local"),(req,res)=>{
    res.redirect("/");
});

router.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});

module.exports = router;