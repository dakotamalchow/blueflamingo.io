const express = require("express");
const router = express.Router();
const passport = require("passport");

const catchAsync = require("../utils/catchAsync");
const {validateUserReqBody} = require("../utils/middleware");
const users = require("../controllers/users");

router.get("/register",users.registerForm);

router.post("/register",validateUserReqBody,catchAsync(users.registerUser));

router.get("/login",users.loginForm);

router.post("/login",passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),users.loginUser);

router.get("/logout",users.logoutUser);

module.exports = router;