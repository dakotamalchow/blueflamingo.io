const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isStripeVerified,hasPlan} = require("../utils/middleware");
const taxes = require("../controllers/taxes");

router.get("/",isLoggedIn,isStripeVerified,hasPlan,catchAsync(taxes.index));

router.get("/new",isLoggedIn,isStripeVerified,hasPlan,catchAsync(taxes.newForm));

router.post("/",isLoggedIn,isStripeVerified,hasPlan,catchAsync(taxes.saveTax));

router.get("/:id",isLoggedIn,isStripeVerified,hasPlan,catchAsync(taxes.taxDetails));

router.get("/:id/edit",isLoggedIn,isStripeVerified,hasPlan,catchAsync(taxes.editForm));

router.post("/:id",isLoggedIn,isStripeVerified,hasPlan,catchAsync(taxes.editTax));

module.exports = router;