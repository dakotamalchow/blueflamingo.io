const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,validateCustomerReqBody} = require("../utils/middleware");
const customers = require("../controllers/customers");

router.get("/",isLoggedIn,catchAsync(customers.index));

router.get("/new",isLoggedIn,customers.newForm);

router.post("/",isLoggedIn,validateCustomerReqBody,catchAsync(customers.createCustomer));

router.get("/:id",isLoggedIn,catchAsync(customers.customerDetails));

router.get("/:id/edit",isLoggedIn,catchAsync(customers.editForm));

router.post("/:id",isLoggedIn,validateCustomerReqBody,catchAsync(customers.editCustomer));

module.exports = router;