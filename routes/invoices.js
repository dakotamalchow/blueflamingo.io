const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,validateInvoiceReqBody} = require("../utils/middleware");
const invoices = require("../controllers/invoices");

router.get("/",isLoggedIn,catchAsync(invoices.index));

router.get("/new",isLoggedIn,catchAsync(invoices.newForm));

router.post("/",isLoggedIn,validateInvoiceReqBody,catchAsync(invoices.createInvoice));

router.get("/:id",isLoggedIn,catchAsync(invoices.invoiceDetails));

router.post("/:id/send",isLoggedIn,catchAsync(invoices.sendInvoiceEmail));

router.get("/:id/pay",catchAsync(invoices.customerInvoiceView));

router.post("/:id/pay",catchAsync(invoices.payInvoice));

module.exports = router;