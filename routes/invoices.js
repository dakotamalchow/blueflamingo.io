const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isStripeVerified,hasPlan,validateInvoiceReqBody} = require("../utils/middleware");
const invoices = require("../controllers/invoices");

router.get("/",isLoggedIn,isStripeVerified,hasPlan,catchAsync(invoices.index));

router.get("/new",isLoggedIn,isStripeVerified,hasPlan,catchAsync(invoices.newForm));

router.post("/",isLoggedIn,isStripeVerified,hasPlan,validateInvoiceReqBody,catchAsync(invoices.createInvoice));

router.get("/:id",isLoggedIn,isStripeVerified,hasPlan,catchAsync(invoices.invoiceDetails));

router.post("/:id/send",isLoggedIn,isStripeVerified,hasPlan,catchAsync(invoices.sendInvoiceEmail));

router.get("/:id/pay",catchAsync(invoices.customerInvoiceView));

router.post("/:id/pay",catchAsync(invoices.payInvoice));

module.exports = router;