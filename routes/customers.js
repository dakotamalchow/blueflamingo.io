const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isAccountComplete,hasPlan,validateCustomerReqBody} = require("../utils/middleware");
const customers = require("../controllers/customers");

router.get("/",isLoggedIn,isAccountComplete,hasPlan,catchAsync(customers.index));

router.get("/new",isLoggedIn,isAccountComplete,hasPlan,customers.newForm);

router.post("/",isLoggedIn,isAccountComplete,hasPlan,validateCustomerReqBody,catchAsync(customers.createCustomer));

router.get("/:id",isLoggedIn,isAccountComplete,hasPlan,catchAsync(customers.customerDetails));

router.get("/:id/edit",isLoggedIn,isAccountComplete,hasPlan,catchAsync(customers.editForm));

router.post("/:id",isLoggedIn,isAccountComplete,hasPlan,validateCustomerReqBody,catchAsync(customers.editCustomer));

module.exports = router;