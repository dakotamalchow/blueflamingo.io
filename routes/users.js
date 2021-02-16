const express = require("express");
const router = express.Router();
const passport = require("passport");
const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,hasPlan,validateUserReqBody} = require("../utils/middleware");
const users = require("../controllers/users");

router.get("/register",users.registerForm);

router.post("/register",validateUserReqBody,catchAsync(users.registerUser));

router.get("/register/purchase-plan",isLoggedIn,users.purchasePlanForm);

router.post("/register/purchase-plan",isLoggedIn,catchAsync(users.purchasePlan));

router.get("/register/complete-account",isLoggedIn,hasPlan,users.completeAccount);

router.get("/login",users.loginForm);

router.post("/login",passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),users.loginUser);

router.get("/logout",users.logoutUser);

module.exports = router;