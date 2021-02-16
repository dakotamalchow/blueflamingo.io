const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,hasPlan,isAccountComplete,validateCustomerReqBody} = require("../utils/middleware");
const customers = require("../controllers/customers");

router.get("/",isLoggedIn,hasPlan,isAccountComplete,catchAsync(customers.index));

router.get("/new",isLoggedIn,hasPlan,isAccountComplete,customers.newForm);

router.post("/",isLoggedIn,hasPlan,isAccountComplete,validateCustomerReqBody,catchAsync(customers.createCustomer));

router.get("/:id",isLoggedIn,hasPlan,isAccountComplete,catchAsync(customers.customerDetails));

router.get("/:id/edit",isLoggedIn,hasPlan,isAccountComplete,catchAsync(customers.editForm));

router.post("/:id",isLoggedIn,hasPlan,isAccountComplete,validateCustomerReqBody,catchAsync(customers.editCustomer));

module.exports = router;