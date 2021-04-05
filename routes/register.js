const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isStripeVerified,validateUserReqBody} = require("../utils/middleware");
const register = require("../controllers/register");

router.get("/",register.registerForm);

router.post("/",validateUserReqBody,catchAsync(register.registerUser));

router.get("/account-info",isLoggedIn,register.accountInfoForm);

router.post("/account-info",isLoggedIn,register.submitAccountInfo);

/*
router.get("/add-account-info",isLoggedIn,register.addAccountInfoPage);

router.get("/refresh-account-links",isLoggedIn,register.refreshAccountLinks);
*/

router.get("/verifying-account",isLoggedIn,register.verifyingAccountPage);

router.get("/purchase-plan",isLoggedIn,isStripeVerified,register.purchasePlanForm);

router.post("/purchase-plan",isLoggedIn,isStripeVerified,catchAsync(register.purchasePlan));

module.exports = router;