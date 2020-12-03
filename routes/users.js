const express = require("express");
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

module.exports = router;