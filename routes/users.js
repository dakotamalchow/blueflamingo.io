const express = require("express");
const router = express.Router();
const passport = require("passport");

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isStripeVerified,validateUserReqBody} = require("../utils/middleware");
const users = require("../controllers/users");

router.get("/register",users.registerForm);

router.post("/register",validateUserReqBody,catchAsync(users.registerUser));

router.get("/register/add-account-info",isLoggedIn,users.addAccountInfoPage);

router.get("/register/refresh-account-links",isLoggedIn,users.refreshAccountLinks);

router.get("/register/verifying-account",isLoggedIn,users.verifyingAccountPage);

router.get("/register/purchase-plan",isLoggedIn,isStripeVerified,users.purchasePlanForm);

router.post("/register/purchase-plan",isLoggedIn,isStripeVerified,catchAsync(users.purchasePlan));

router.get("/login",users.loginForm);

router.post("/login",passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),users.loginUser);

router.get("/logout",users.logoutUser);

module.exports = router;