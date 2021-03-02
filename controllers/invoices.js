const fs = require("fs");
const ejs = require("ejs");
const sgMail = require("@sendgrid/mail");

let stripe;
if(process.env.ENV=="dev"){ stripe = require('stripe')(process.env.STRIPE_SEC_KEY_DEV); }
else if(process.env.ENV=="prod"){ stripe = require('stripe')(process.env.STRIPE_SEC_KEY_PROD); };

const Invoice = require("../models/invoice");
const Item = require("../models/item");
const Customer = require("../models/customer");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailInvoice = async(invoiceId,emailType)=>{
    const invoice = await Invoice.findById(invoiceId).populate("customer").populate("user");
    const userName = invoice.user.businessName||invoice.user.name;
    const invoiceTemplate = fs.readFileSync("views/email/invoice.ejs",{encoding:"utf-8"});
    let statusColor = "";
    switch(invoice.status){
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
        subject = `New Invoice from ${userName} #${invoice.invoiceNumber}`;
        text = `${userName} sent you a new invoice for $${invoice.amount.due.toFixed(2)}. Please visit https://blueflamingo.io/invoices/${invoice._id}/pay to pay your invoice.`;
    }
    else if(emailType=="receipt"){
        subject = `Receipt from ${userName} #${invoice.invoiceNumber}`;
        text = `This is a confirmation that invoice #${invoice.invoiceNumber} from ${userName} has been paid.`;
    };
    const msg = {
        to:invoice.customer.email,
        from:"billing@blueflamingo.io",
        subject:subject,
        text:text,
        html:ejs.render(invoiceTemplate,{invoice,userName,statusColor})
    };
    await sgMail.send(msg);
    invoice.log.push({timeStamp:new Date(),description:`Email ${emailType} sent to customer`});
    await invoice.save();
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
    const user = res.locals.currentUser;
    const customers = await Customer.find({user});
    const items = await Item.find({user});
    req.session.returnTo = req.originalUrl;
    res.render("billing/new",{customers,items});
};

module.exports.createInvoice = async(req,res)=>{
    const {customerId,lineItems,notes} = req.body;
    const user = res.locals.currentUser;
    const customer = await Customer.findById(customerId);
    const invoiceCount = user.increaseInvoiceCount();
    const invoiceNumber = String(invoiceCount).padStart(4,"0");
    const invoice = new Invoice({user,customer,invoiceNumber,lineItems:Object.values(lineItems),notes});
    //lineItems comes back as nested objects, so this returns an array
    for(let lineItem of Object.values(lineItems)){
        const stripeAmount = parseFloat(lineItem.amount)*100;
        await stripe.invoiceItems.create({
            customer: customer.stripeCustomer,
            amount: stripeAmount,
            currency: "usd",
            description: lineItem.description
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
        due: stripeInvoice.amount_due/100,
        paid: stripeInvoice.amount_paid/100,
        remaining: stripeInvoice.amount_remaining/100
    };
    invoice.status = stripeInvoice.status;
    invoice.log.push({timeStamp:new Date(),description:"Invoice created"});
    await invoice.save();
    await sendEmailInvoice(invoice._id,"invoice");
    req.flash("success","Successfully created and sent invoice");
    res.redirect("/invoices");
};

module.exports.invoiceDetails = async(req,res)=>{
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId).populate("customer");
    res.render("billing/details",{invoice});
};

module.exports.sendInvoiceEmail = async(req,res)=>{
    await sendEmailInvoice(req.params.id,"invoice");
    res.send("Email sent");
};

module.exports.customerInvoiceView = async(req,res)=>{
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId).populate("customer").populate("user");
    const userName = invoice.user.businessName||invoice.user.name;
    res.render("billing/pay",{invoice,userName});
};

module.exports.payInvoice = async(req,res)=>{
    const invoiceId = req.params.id;
    const paymentMethodId = req.body.stripePaymentMethod;
    const invoice = await Invoice.findById(invoiceId);
    const customer = await Customer.findById(invoice.customer);
    const stripeCustomerId = customer.stripeCustomer;
    await stripe.paymentMethods.attach(paymentMethodId,{customer:stripeCustomerId});
    const stripeInvoice = await stripe.invoices.pay(invoice.stripeInvoice,{payment_method:paymentMethodId});
    invoice.amount = {
        due: stripeInvoice.amount_due/100,
        paid: stripeInvoice.amount_paid/100,
        remaining: stripeInvoice.amount_remaining/100
    };
    invoice.status = stripeInvoice.status;
    invoice.log.push({timeStamp:new Date(),description:"Invoice paid"});
    await invoice.save();
    await sendEmailInvoice(invoiceId,"receipt");
    req.flash("success","Thank you for your payment! You will receive an email confirmation shortly.");
    res.redirect(`/invoices/${invoiceId}/pay`);
};