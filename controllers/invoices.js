const fs = require("fs");
const ejs = require("ejs");
const sgMail = require("@sendgrid/mail");
const stripe = require('stripe')(process.env.STRIPE_SEC_KEY);
const plaid = require("plaid");

const plaidClient = new plaid.Client({
    clientID:process.env.PLAID_CLIENT_ID,
    secret:process.env.PLAID_SECRET,
    env:plaid.environments[process.env.PLAID_ENV]
});

const Invoice = require("../models/invoice");
const Item = require("../models/item");
const Customer = require("../models/customer");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailInvoice = async(invoiceId,emailType,errorMessage="")=>{
    const invoice = await Invoice.findById(invoiceId).populate("customer").populate("user");
    const invoiceTemplate = fs.readFileSync("views/email/invoice.ejs",{encoding:"utf-8"});
    let statusColor = "";
    switch(invoice.status){
        case "draft":
            //secondary - grey
            statusColor += "#6c757d";
            break;
        case "open":
        case "pending":
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
    let customerSubject,customerText,userSubject,userText = "";
    let sendUserEmail = false;
    if(emailType=="invoice"){
        customerSubject = `New Invoice from ${invoice.user.businessName} #${invoice.invoiceNumber}`;
        customerText = `${invoice.user.businessName} sent you a new invoice for $${invoice.amount.due.toFixed(2)}. Please visit https://blueflamingo.io/invoices/${invoice._id}/pay to pay your invoice.`;
    }
    else if(emailType=="receipt"){
        customerSubject = `Receipt from ${invoice.user.businessName} #${invoice.invoiceNumber}`;
        customerText = `This is a confirmation that invoice #${invoice.invoiceNumber} from ${invoice.user.businessName} is ${invoice.status}.`;
        userSubject = `${invoice.customer.name} has paid invoice #${invoice.invoiceNumber}`;
        userText = `This is a confirmation that ${invoice.customer.name} has paid invoice #${invoice.invoiceNumber}.`;
        sendUserEmail = true;
    }
    else if(emailType=="payment failure"){
        customerSubject = `Payment failure - ${invoice.user.businessName} #${invoice.invoiceNumber}`;
        customerText = `Your payment failed on invoice #${invoice.invoiceNumber} from ${invoice.user.businessName}. Please visit https://blueflamingo.io/invoices/${invoice._id}/pay to pay your invoice.`;
        userSubject = `Payment failed on Invoice #${invoice.invoiceNumber}`;
        customerText = `Attempted payment has failed for invoice #${invoice.invoiceNumber}.`;
        sendUserEmail = true;
    };
    const customerMessage = {
        to:invoice.customer.email,
        from:"billing@blueflamingo.io",
        subject:customerSubject,
        text:customerText,
        html:ejs.render(invoiceTemplate,{invoice,statusColor,errorMessage})
    };
    await sgMail.send(customerMessage);
    invoice.log.push({timeStamp:new Date(),description:`Email ${emailType} sent to customer`});
    if(sendUserEmail){
        const userMessage = {
            to:user.email,
            from:"billing@blueflamingo.io",
            subject:userSubject,
            text:userText,
            html:ejs.render(invoiceTemplate,{invoice,statusColor,errorMessage})
        };
        await sgMail.send(userMessage);
    };
    await invoice.save();
};

module.exports.index = async(req,res)=>{
    const user = res.locals.currentUser;
    const {status,sortBy,sortOrder} = req.query;
    let statusArray = [];
    let invoiceStatus = "";
    if(status){
        statusArray.push(status);
        invoiceStatus = status;
    }
    else{
        statusArray.push("draft","open","pending","paid");
    };
    sortQuery = {};
    sortQuery[sortBy] = sortOrder;
    const invoices = await Invoice.find({user,status:{$in:statusArray}}).populate("customer").sort(sortQuery);
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
    const {customerId,lineItems,paymentOptions,notes} = req.body;
    const user = res.locals.currentUser;
    const customer = await Customer.findById(customerId);
    const invoiceCount = user.increaseInvoiceCount();
    const invoiceNumber = String(invoiceCount).padStart(4,"0");
    const invoice = new Invoice({user,customer,invoiceNumber,lineItems:Object.values(lineItems),paymentOptions,notes});
    let subtotal = 0;
    let taxTotal = 0;
    //lineItems comes back as nested objects, so this returns an array
    for(let lineItem of Object.values(lineItems)){
        const amountValue = parseFloat(lineItem.amount);
        subtotal += amountValue;
        const taxValue = parseFloat(lineItem.tax);
        taxTotal += amountValue*taxValue;
    };
    const total = subtotal+taxTotal;
    invoice.subtotal = subtotal;
    invoice.taxTotal = taxTotal;
    invoice.total = total;
    invoice.amount = {
        due: total,
        paid: 0,
        remaining: total
    };
    invoice.status = "open";
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
    const publicKey = process.env.STRIPE_PUB_KEY;
    const invoice = await Invoice.findById(invoiceId).populate("customer").populate("user");
    const processingFee = ((invoice.amount.due*.0315)+0.30).toFixed(2);
    const paymentIntent = await stripe.paymentIntents.create({
        payment_method_types: ["card"],
        amount: invoice.amount.due*100,
        currency: "usd",
        application_fee_amount: processingFee*100,
        transfer_data: {
            destination: invoice.user.stripeAccount,
        }
    });
    const linkToken = await plaidClient.createLinkToken({
        user:{
            client_user_id: invoice.customer._id
        },
        client_name: invoice.user.businessName,
        products: ["auth"],
        country_codes: ["US"],
        language: "en"
    });
    res.render("billing/pay",{
        invoice,
        publicKey,
        clientSecret:paymentIntent.client_secret,
        linkToken:linkToken.link_token,
        plaidEnv:process.env.PLAID_ENV
    });
};

module.exports.payInvoice = async(req,res)=>{
    const invoiceId = req.params.id;
    const {paymentType} = req.body;
    const invoice = await Invoice.findById(invoiceId).populate("user");
    const customer = await Customer.findById(invoice.customer);
    const stripeCustomerId = customer.stripeCustomer;
    if(paymentType=="card"){
        invoice.amount = {
            due: invoice.amount.due,
            paid: invoice.amount.due,
            remaining: 0
        };
        invoice.status = "paid";
        invoice.paymentType = paymentType;
        invoice.log.push({timeStamp:new Date(),description:"Invoice paid"});
        await invoice.save();
        await sendEmailInvoice(invoiceId,"receipt");
    }
    else if(paymentType=="bank"){
        const {plaidLinkPublicToken,plaidAccountId} = req.body;
        let accessResponse = await plaidClient.exchangePublicToken(plaidLinkPublicToken);
        const bankAccountResponse = await plaidClient.createStripeToken(accessResponse.access_token,plaidAccountId);
        const bankAccountToken = bankAccountResponse.stripe_bank_account_token;
        await stripe.customers.update(stripeCustomerId,{source:bankAccountToken});
        const processingFee = (invoice.amount.due*.0125).toFixed(2);
        await stripe.charges.create({
            amount: invoice.amount.due*100,
            currency: "usd",
            customer: stripeCustomerId,
            application_fee_amount: processingFee*100,
            transfer_data: {
                destination: invoice.user.stripeAccount,
            },
            statement_descriptor: invoice.user.statementDescriptor,
            metadata:{
                invoiceId: String(invoice._id)
            }
        });
        invoice.amount = {
            due: invoice.amount.due,
            paid: invoice.amount.due,
            remaining: 0
        };
        invoice.status = "pending";
        invoice.paymentType = paymentType;
        invoice.log.push({timeStamp:new Date(),description:"Payment pending"});
        await invoice.save();
        await sendEmailInvoice(invoiceId,"receipt");
    }
    req.flash("success","Thank you for your payment! You will receive an email confirmation shortly.");
    res.redirect(`/invoices/${invoiceId}/pay`);    
};

module.exports.webhook = async(req,res)=>{
    const event = req.body;
    if(event.type=="charge.failed"){
        const invoice = await Invoice.findById(event.data.object.metadata.invoiceId);
        invoice.amount = {
            due: invoice.amount.due,
            paid: 0,
            remaining: invoice.amount.due
        };
        invoice.status = "open";
        invoice.log.push({timeStamp:new Date(),description:`Payment failed - ${event.data.object.failure_message}`});
        await invoice.save();
        await sendEmailInvoice(invoiceId,"payment failure",event.data.object.failure_message);
    }
    else if(event.type=="charge.succeeded"){
        const invoice = await Invoice.findById(event.data.object.metadata.invoiceId);
        invoice.status = "paid";
        invoice.log.push({timeStamp:new Date(),description:"Invoice paid"});
        await invoice.save();
        await sendEmailInvoice(invoiceId,"receipt");
    };
    res.json({received:true});
};