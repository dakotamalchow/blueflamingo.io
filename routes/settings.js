const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isAccountComplete,hasPlan} = require("../utils/middleware");
const settings = require("../controllers/settings");

router.get("/",isLoggedIn,isAccountComplete,hasPlan,catchAsync(settings.index));

router.get("/edit-user",isLoggedIn,isAccountComplete,hasPlan,settings.editUserForm);

router.post("/edit-user",isLoggedIn,isAccountComplete,hasPlan,catchAsync(settings.editUser));

router.post("/cancel-subscription",isLoggedIn,isAccountComplete,hasPlan,catchAsync(settings.cancelSubscrption));

router.get("/edit-payment-method",isLoggedIn,isAccountComplete,hasPlan,settings.editPaymentMethodForm);

router.post("/edit-payment-method",isLoggedIn,isAccountComplete,hasPlan,catchAsync(settings.editPaymentMethod));

module.exports = router;