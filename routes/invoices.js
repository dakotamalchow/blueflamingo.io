const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,hasPlan,isAccountComplete,validateInvoiceReqBody} = require("../utils/middleware");
const invoices = require("../controllers/invoices");

router.get("/",isLoggedIn,hasPlan,isAccountComplete,catchAsync(invoices.index));

router.get("/new",isLoggedIn,hasPlan,isAccountComplete,catchAsync(invoices.newForm));

router.post("/",isLoggedIn,hasPlan,isAccountComplete,validateInvoiceReqBody,catchAsync(invoices.createInvoice));

router.get("/:id",isLoggedIn,hasPlan,isAccountComplete,catchAsync(invoices.invoiceDetails));

router.post("/:id/send",isLoggedIn,hasPlan,isAccountComplete,catchAsync(invoices.sendInvoiceEmail));

router.get("/:id/pay",catchAsync(invoices.customerInvoiceView));

router.post("/:id/pay",catchAsync(invoices.payInvoice));

module.exports = router;