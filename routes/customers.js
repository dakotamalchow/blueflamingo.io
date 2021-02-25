const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isStripeVerified,hasPlan,validateCustomerReqBody} = require("../utils/middleware");
const customers = require("../controllers/customers");

router.get("/",isLoggedIn,isStripeVerified,hasPlan,catchAsync(customers.index));

router.get("/new",isLoggedIn,isStripeVerified,hasPlan,customers.newForm);

router.post("/",isLoggedIn,isStripeVerified,hasPlan,validateCustomerReqBody,catchAsync(customers.createCustomer));

router.get("/:id",isLoggedIn,isStripeVerified,hasPlan,catchAsync(customers.customerDetails));

router.get("/:id/edit",isLoggedIn,isStripeVerified,hasPlan,catchAsync(customers.editForm));

router.post("/:id",isLoggedIn,isStripeVerified,hasPlan,validateCustomerReqBody,catchAsync(customers.editCustomer));

module.exports = router;