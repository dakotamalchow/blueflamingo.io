require("dotenv").config();
const invoices = require("./index");

test("getStatusColor is a function",()=>{
    expect(typeof invoices.getStatusColor).toEqual("function");
});

test("'draft' is grey",()=>{
    expect(invoices.getStatusColor("draft")).toEqual("#6c757d");
});

test("'open' and 'pending' is green",()=>{
    expect(invoices.getStatusColor("open")).toEqual("#28a745");
    expect(invoices.getStatusColor("pending")).toEqual("#28a745");
});

test("'paid' is blue",()=>{
    expect(invoices.getStatusColor("paid")).toEqual("#0040F0");
});

test("Any other status is red",()=>{
    expect(invoices.getStatusColor("")).toEqual("#dc3545");
    expect(invoices.getStatusColor("canceled")).toEqual("#dc3545");
});