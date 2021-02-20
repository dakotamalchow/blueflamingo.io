const fs = require("fs");
const ejs = require("ejs");
const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const Invoice = require("../models/invoice");
const Customer = require("../models/customer");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailInvoice = async(invoiceId,emailType)=>{
    const invoice = await Invoice.findById(invoiceId);
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice);
    const invoiceTemplate = fs.readFileSync("views/email/invoice.ejs",{encoding:"utf-8"});
    let statusColor = "";
    switch(stripeInvoice.status){
        case "draft":
            //secondary - grey
            statusColor += "#6c757d";
            break;
        case "open":
            //success - green
            statusColor += "#28a745";
            break;
        case "paid":
            //primary - blue
            statusColor += "#0040F0";
            break;
        default:
            //danger - red
            statusColor += "#dc3545"
    };
    let subject = "";
    let text = "";
    if(emailType=="invoice"){
        subject = `New Invoice from ${stripeInvoice.metadata.userName} #${stripeInvoice.metadata.invoiceNumber}`;
        text = `${stripeInvoice.metadata.userName} sent you a new invoice for $${(stripeInvoice.amount_due/100).toFixed(2)}. Please visit https://blueflamingo.io/invoices/${stripeInvoice.metadata.invoiceId}/pay to pay your invoice.`;
    }
    else if(emailType=="receipt"){
        subject = `Receipt from ${stripeInvoice.metadata.userName} #${stripeInvoice.metadata.invoiceNumber}`;
        text = `This is a confirmation that invoice #${stripeInvoice.metadata.invoiceNumber} from ${stripeInvoice.metadata.userName} has been paid.`;
    };
    const msg = {
        to:"dakotamalchow@gmail.com",
        from:"billing@blueflamingo.io",
        subject:subject,
        text:text,
        html:ejs.render(invoiceTemplate,{stripeInvoice,statusColor})
    };
    await sgMail.send(msg);
};

module.exports.index = async(req,res)=>{
    const user = res.locals.currentUser;
    const invoiceStatus = req.query.status;
    let invoices;
    if(invoiceStatus){
        invoices = await Invoice.find({user,status:invoiceStatus}).populate("customer");
    }
    else{
        invoices = await Invoice.find({user}).populate("customer");
    };
    res.render("billing/index",{invoices,invoiceStatus});
};

module.exports.newForm = async(req,res)=>{
    const customers = await Customer.find({});
    req.session.returnTo = req.originalUrl;
    res.render("billing/new",{customers});
};

module.exports.createInvoice = async(req,res)=>{
    const {customerId,lineItems,notes} = req.body;
    const user = res.locals.currentUser;
    const customer = await Customer.findById(customerId);
    const invoiceCount = user.increaseInvoiceCount();
    const invoiceNumber = String(invoiceCount).padStart(4,"0");
    const invoice = new Invoice({user,customer,invoiceNumber,notes});
    //lineItems comes back as nested objects, so this returns an array
    for(let item of Object.values(lineItems)){
        const stripeAmount = parseFloat(item.amount)*100;
        await stripe.invoiceItems.create({
            customer: customer.stripeCustomer,
            amount: stripeAmount,
            currency: "usd",
            description: item.description
        });
    };
    let stripeInvoice = await stripe.invoices.create({
        customer: customer.stripeCustomer,
        transfer_data:{
            destination:user.stripeAccount
        },
        description: notes,
        collection_method: "send_invoice",
        days_until_due: 30,
        metadata:{
            invoiceId: invoice.id,
            invoiceNumber: invoiceNumber,
            userName: user.businessName||user.name
        }
    });
    //this stripeInvoice object has a status of 'open'
    stripeInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
    invoice.stripeInvoice = stripeInvoice.id;
    invoice.amount = {
        due: stripeInvoice.amount_due,
        paid: stripeInvoice.amount_paid,
        remaining: stripeInvoice.amount_remaining
    };
    invoice.status = stripeInvoice.status;
    await invoice.save();
    await sendEmailInvoice(invoice._id,"invoice");
    req.flash("success","Successfully created and sent invoice");
    res.redirect("/invoices");
};

module.exports.invoiceDetails = async(req,res)=>{
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId).populate("customer");
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice);
    res.render("billing/details",{invoice,stripeInvoice});
};

module.exports.sendInvoiceEmail = async(req,res)=>{
    await sendEmailInvoice(req.params.id,"invoice");
    res.send("Email sent");
};

module.exports.customerInvoiceView = async(req,res)=>{
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId).populate("customer");
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice);
    const userName = stripeInvoice.metadata.userName;
    res.render("billing/pay",{invoice,stripeInvoice,userName});
};

module.exports.payInvoice = async(req,res)=>{
    const invoiceId = req.params.id;
    const paymentMethodId = req.body.stripePaymentMethod;
    const invoice = await Invoice.findById(invoiceId);
    const customer = await Customer.findById(invoice.customer);
    const stripeCustomerId = customer.stripeCustomer;
    await stripe.paymentMethods.attach(paymentMethodId,{customer:stripeCustomerId});
    await stripe.invoices.pay(invoice.stripeInvoice,{payment_method:paymentMethodId});
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoice);
    invoice.amount = {
        due: stripeInvoice.amount_due,
        paid: stripeInvoice.amount_paid,
        remaining: stripeInvoice.amount_remaining
    };
    invoice.status = stripeInvoice.status;
    await invoice.save();
    await sendEmailInvoice(invoiceId,"receipt");
    req.flash("success","Thank you for your payment! You will receive an email confirmation shortly.");
    res.redirect(`/invoices/${invoiceId}/pay`);
};