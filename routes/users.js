const express = require("express");
const router = express.Router();
const passport = require("passport");

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isAccountComplete,validateUserReqBody} = require("../utils/middleware");
const users = require("../controllers/users");

router.get("/register",users.registerForm);

router.post("/register",validateUserReqBody,catchAsync(users.registerUser));

router.get("/register/complete-account",isLoggedIn,users.completeAccountPage);

router.get("/register/refresh-account-links",isLoggedIn,users.refreshAccountLinks);

router.get("/register/verifying-account",isLoggedIn,users.verifyingAccountPage);

router.get("/register/purchase-plan",isLoggedIn,isAccountComplete,users.purchasePlanForm);

router.post("/register/purchase-plan",isLoggedIn,isAccountComplete,catchAsync(users.purchasePlan));

router.get("/login",users.loginForm);

router.post("/login",passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),users.loginUser);

router.get("/logout",users.logoutUser);

module.exports = router;