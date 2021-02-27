const express = require("express");
const router = express.Router();
const passport = require("passport");

const users = require("../controllers/users");

router.get("/login",users.loginForm);

router.post("/login",passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),users.loginUser);

router.get("/logout",users.logoutUser);

module.exports = router;