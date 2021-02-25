const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isAccountComplete,hasPlan,validateInvoiceReqBody} = require("../utils/middleware");
const invoices = require("../controllers/invoices");

router.get("/",isLoggedIn,isAccountComplete,hasPlan,catchAsync(invoices.index));

router.get("/new",isLoggedIn,isAccountComplete,hasPlan,catchAsync(invoices.newForm));

router.post("/",isLoggedIn,isAccountComplete,hasPlan,validateInvoiceReqBody,catchAsync(invoices.createInvoice));

router.get("/:id",isLoggedIn,isAccountComplete,hasPlan,catchAsync(invoices.invoiceDetails));

router.post("/:id/send",isLoggedIn,isAccountComplete,hasPlan,catchAsync(invoices.sendInvoiceEmail));

router.get("/:id/pay",catchAsync(invoices.customerInvoiceView));

router.post("/:id/pay",catchAsync(invoices.payInvoice));

module.exports = router;