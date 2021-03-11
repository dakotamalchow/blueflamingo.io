const express = require("express");
const router = express.Router();
const multer = require("multer");
const {storage} = require("../cloudinary");
const upload = multer({storage});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isStripeVerified,hasPlan} = require("../utils/middleware");
const settings = require("../controllers/settings");

router.get("/",isLoggedIn,isStripeVerified,hasPlan,catchAsync(settings.index));

router.get("/edit-user",isLoggedIn,isStripeVerified,hasPlan,settings.editUserForm);

router.post("/edit-user",isLoggedIn,isStripeVerified,hasPlan,upload.single("logo"),catchAsync(settings.editUser));

router.post("/cancel-subscription",isLoggedIn,isStripeVerified,hasPlan,catchAsync(settings.cancelSubscrption));

router.get("/edit-payment-method",isLoggedIn,isStripeVerified,hasPlan,settings.editPaymentMethodForm);

router.post("/edit-payment-method",isLoggedIn,isStripeVerified,hasPlan,catchAsync(settings.editPaymentMethod));

module.exports = router;