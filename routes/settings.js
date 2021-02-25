const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isStripeVerified,hasPlan} = require("../utils/middleware");
const settings = require("../controllers/settings");

router.get("/",isLoggedIn,isStripeVerified,hasPlan,catchAsync(settings.index));

router.get("/edit-user",isLoggedIn,isStripeVerified,hasPlan,settings.editUserForm);

router.post("/edit-user",isLoggedIn,isStripeVerified,hasPlan,catchAsync(settings.editUser));

router.post("/cancel-subscription",isLoggedIn,isStripeVerified,hasPlan,catchAsync(settings.cancelSubscrption));

router.get("/edit-payment-method",isLoggedIn,isStripeVerified,hasPlan,settings.editPaymentMethodForm);

router.post("/edit-payment-method",isLoggedIn,isStripeVerified,hasPlan,catchAsync(settings.editPaymentMethod));

module.exports = router;