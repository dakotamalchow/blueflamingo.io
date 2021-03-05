const fs = require("fs");
const ejs = require("ejs");
const sgMail = require("@sendgrid/mail");
const plaid = require("plaid");

const plaidClient = new plaid.Client({
    clientID:"603820da02cf49000f162105",
    secret:"2ebd7bc07a8e3dc2347b42f9e5e2ed",
    env:plaid.environments.sandbox
});

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
    let amount = 0;
    //lineItems comes back as nested objects, so this returns an array
    for(let lineItem of Object.values(lineItems)){
        amount += parseFloat(lineItem.amount);
    };
    invoice.amount = {
        due: amount,
        paid: 0,
        remaining: amount
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
    let publicKey;
    if(process.env.ENV=="dev"){
        publicKey = process.env.STRIPE_PUB_KEY_DEV;
    }
    else if(process.env.ENV=="prod"){
        publicKey = process.env.STRIPE_PUB_KEY_PROD;
    };
    const invoice = await Invoice.findById(invoiceId).populate("customer").populate("user");
    const userName = invoice.user.businessName||invoice.user.name;
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
        client_name: "Blue Flamingo",
        products: ["auth"],
        country_codes: ["US"],
        language: "en"
    });
    res.render("billing/pay",{invoice,userName,publicKey,clientSecret:paymentIntent.client_secret,linkToken:linkToken.link_token});
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
        const processingFee = (invoice.amount.due*.0105).toFixed(2);
        await stripe.charges.create({
            amount: invoice.amount.due*100,
            currency: "usd",
            customer: stripeCustomerId,
            application_fee_amount: processingFee*100,
            transfer_data: {
                destination: invoice.user.stripeAccount,
            }
        });
        invoice.amount = {
            due: invoice.amount.due,
            paid: invoice.amount.due,
            remaining: 0
        };
        invoice.status = "paid";
        invoice.log.push({timeStamp:new Date(),description:"Invoice paid"});
        await invoice.save();
        await sendEmailInvoice(invoiceId,"receipt");
    }
    req.flash("success","Thank you for your payment! You will receive an email confirmation shortly.");
    res.redirect(`/invoices/${invoiceId}/pay`);    
};