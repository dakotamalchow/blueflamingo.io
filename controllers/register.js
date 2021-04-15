const fs = require("fs");
const ejs = require("ejs");
const sgMail = require("@sendgrid/mail");
const stripe = require('stripe')(process.env.STRIPE_SEC_KEY);

const User = require("../models/user");
const Plan = require("../models/plan");
const Tax = require("../models/tax");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async(email,subject,text,emailView)=>{
    const emailFile = fs.readFileSync(`views/email/${emailView}.ejs`,{encoding:"utf-8"});
    const msg = {
        to:email,
        from:"billing@blueflamingo.io",
        subject:subject,
        text:text,
        html:ejs.render(emailFile)
    };
    await sgMail.send(msg);
};

module.exports.registerForm = (req,res)=>{
    const data = req.query;
    res.render("register/register-form",{data});
};

const validatePassword = (password,confirmPassword)=>{
    let errorMessage = "";
    if(password.length<8){
        errorMessage+="Password must be at least 8 characters long. ";
    };
    if(!/[a-z]/.test(password)){
        errorMessage+="Password must contain at least one lowercase letter. ";
    };
    if(!/[A-Z]/.test(password)){
        errorMessage+="Password must contain at least one uppercase letter. ";
    };
    if(!/\d/.test(password)){
        errorMessage+="Password must contain at least one number. ";
    };
    if(password!=confirmPassword){
        errorMessage+="Password fields must match. ";
    };
    if(errorMessage){
        return errorMessage
    };
    return true;
};

const validateBusinessName = (businessName)=>{
    let errorMessage = "";
    if(businessName.length<5){
        errorMessage+="Business name must be at least 5 characters. ";
    };
    if(!/[a-zA-Z]/.test(businessName)){
        errorMessage+="Business name must contain at least one letter. ";
    };
    if(errorMessage){
        return "The business name will be shown on customer invoices and card/bank statements. " + errorMessage;
    };
    return true;
};

module.exports.registerUser = async(req,res,next)=>{
    const {firstName,lastName,businessName,email,password,confirmPassword} = req.body;
    const isBusinessNameValid = validateBusinessName(businessName);
    const isPasswordValid = validatePassword(password,confirmPassword);
    if(isBusinessNameValid!=true||isPasswordValid!=true){
        let queryString = `?firstName=${encodeURIComponent(firstName)}`;
        queryString+= `&lastName=${encodeURIComponent(lastName)}`;
        queryString+=`&businessName=${encodeURIComponent(businessName)}`;
        queryString+=`&email=${encodeURIComponent(email)}`;
        let errorMessage = "";
        if(isBusinessNameValid!=true){
            errorMessage+=`${isBusinessNameValid} `;
        };
        if(isPasswordValid!=true){
            errorMessage+=`${isPasswordValid} `;
        };
        req.flash("error",errorMessage);
        return res.redirect("/register"+queryString);
    };
    const user = new User({firstName,lastName,businessName,email});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser,err=>{
        if(err) {return next(err);}
    });
    await user.save();
    req.flash("success","Account successfully created");
    res.redirect("/register/account-info");
};

module.exports.accountInfoForm = (req,res)=>{
    const user = res.locals.currentUser;
    const data = req.query;
    const categories = JSON.parse(fs.readFileSync("merchant-categories.json"));
    res.render("register/account-info",{user,data,categories});
};

const validateDOB = (dob)=>{
    let parsedDob = Date.parse(dob);
    let date13 = new Date();
    date13.setFullYear(date13.getFullYear()-13);
    if(date13<parsedDob){
        return "User must be at least 13 years old.";
    };
    return true;
};

//should include validation for bank/tax id? (client or server side)

module.exports.submitAccountInfo = async(req,res)=>{
    const user = res.locals.currentUser;
    const {dob,title,ssn,phoneNumber,address,businessType,mcc,description,
        taxId,ownerFirstName,ownerLastName,ownerEmail,
        bankAccount,confirmBankAccount,bankRouting,bankOwner,tos} = req.body;
    const isDOBValid = validateDOB(dob);
    if(isDOBValid!=true){
        let queryString = `?dob=${encodeURIComponent(dob)}`;
        queryString+= `&title=${encodeURIComponent(title)}`;
        queryString+= `&ssn=${encodeURIComponent(ssn)}`;
        queryString+=`&phoneNumber=${encodeURIComponent(phoneNumber)}`;
        queryString+=`&line1=${encodeURIComponent(address.line1)}`;
        queryString+=`&line2=${encodeURIComponent(address.line2)}`;
        queryString+=`&city=${encodeURIComponent(address.city)}`;
        queryString+=`&state=${encodeURIComponent(address.state)}`;
        queryString+=`&postalCode=${encodeURIComponent(address.postalCode)}`;
        queryString+=`&businessType=${encodeURIComponent(businessType)}`;
        queryString+=`&mcc=${encodeURIComponent(mcc)}`;
        queryString+=`&description=${encodeURIComponent(description)}`;
        if(businessType=="company"){
            queryString+=`&taxId=${encodeURIComponent(taxId)}`;
            //need to include multiple owners
            queryString+=`&ownerFirstName=${encodeURIComponent(ownerFirstName)}`;
            queryString+=`&ownerLastName=${encodeURIComponent(ownerLastName)}`;
            queryString+=`&ownerEmail=${encodeURIComponent(ownerEmail)}`;
        };
        queryString+=`&bankAccount=${encodeURIComponent(bankAccount)}`;
        queryString+=`&confirmBankAccount=${encodeURIComponent(confirmBankAccount)}`;
        queryString+=`&bankRouting=${encodeURIComponent(bankRouting)}`;
        queryString+=`&bankOwner=${encodeURIComponent(bankOwner)}`;
        queryString+=`&tos=${encodeURIComponent(tos)}`;
        let errorMessage = "";
        if(isDOBValid!=true){
            errorMessage+=`${isDOBValid} `;
        };
        req.flash("error",errorMessage);
        return res.redirect("/register"+queryString);
    };
    const stripeAccount = await stripe.accounts.create({
        type:"custom",
        country:"US",
        email:user.email,
        business_type:businessType,
        business_profile:{
            name:user.businessName,
            mcc:mcc,
            product_description:description
        },
        external_account:{
            object:"bank_account",
            country:"US",
            currency:"usd",
            account_holder_name:bankOwner,
            account_holder_type:businessType,
            account_number:bankAccount,
            routing_number:bankRouting
        },
        tos_acceptance:{
            date:Math.floor(Date.now()/1000),
            ip:req.connection.remoteAddress
        },
        capabilities:{
            card_payments:{requested:true},
            transfers:{requested:true}
        },
        // need to look into statement descriptors for custom accounts
        settings:{
            payments:{
                statement_descriptor: user.statementDescriptor
            }
        }
    });
    if(businessType=="individual"){
        await stripe.accounts.update(
            stripeAccount.id,
            {
                individual:{
                    first_name:user.firstName,
                    last_name:user.lastName,
                    email:user.email,
                    phone:phoneNumber.replace(/-/g,""),
                    dob:{
                        day:dob.split("-")[2],
                        month:dob.split("-")[1],
                        year:dob.split("-")[0]
                    },
                    address:{
                        line1:address.line1,
                        line2:address.line2,
                        city:address.city,
                        state:address.state,
                        postal_code:address.postalCode,
                        country:"US"
                    },
                    id_number:ssn.replace(/-/g,""),
                    ssn_last_4:ssn.substring(7,12)
                }
            }
        );
    }
    else if(businessType=="company"){
        await stripe.accounts.createPerson(
            stripeAccount.id,
            {
                first_name:user.firstName,
                last_name:user.lastName,
                email:user.email,
                phone:phoneNumber.replace(/-/g,""),
                dob:{
                    day:dob.split("-")[2],
                    month:dob.split("-")[1],
                    year:dob.split("-")[0]
                },
                address:{
                    line1:address.line1,
                    line2:address.line2,
                    city:address.city,
                    state:address.state,
                    postal_code:address.postalCode,
                    country:"US"
                },
                relationship:{
                    title:title,
                    representative:true,
                    executive:true
                },
                id_number:ssn.replace(/-/g,""),
                ssn_last_4:ssn.substring(7,12)
            }
        );
        await stripe.accounts.createPerson(
            stripeAccount.id,
            {
                first_name:user.firstName,
                last_name:user.lastName,
                email:user.email,
                relationship:{
                    title:title,
                    owner:true
                }
            }
        );
        await stripe.accounts.update(
            stripeAccount.id,
            {
                company:{
                    name:user.businessName,
                    phone:phoneNumber.replace(/-/g,""),
                    address:{
                        line1:address.line1,
                        line2:address.line2,
                        city:address.city,
                        state:address.state,
                        postal_code:address.postalCode,
                        country:"US"
                    },
                    tax_id:taxId.replace(/-/g,""),
                    owners_provided:true
                }
            }
        );
    }
    else{
        // some type of error? validate business type before?
    };
    user.phoneNumber = phoneNumber;
    user.stripeAccount = stripeAccount.id;
    //add address and phone?
    const stripeCustomer = await stripe.customers.create({
        name: user.name,
        email: user.email
    });
    user.stripeCustomer = stripeCustomer.id;
    await user.save();
    const tax = new Tax({user,description:"No Tax",amount:0});
    await tax.save();
    res.redirect("/register/verifying-account");
};

module.exports.verifyingAccountPage = async(req,res)=>{
    const user = res.locals.currentUser;
    const stripeAccount = await stripe.accounts.retrieve(user.stripeAccount);
    if(stripeAccount.charges_enabled && stripeAccount.details_submitted){
        user.isStripeVerified = true;
        await user.save();
        const emailSubject = "Welcome to Blue Flamingo!";
        const emailText = "Welcome to the simple way to invoice. Go to https://blueflamingo.io/invoices/new to create an invoice.";
        await sendEmail(user.email,emailSubject,emailText,"registered");
        req.flash("success","Accout info added successfully");
        return res.redirect("/register/purchase-plan");
    };
    res.render("register/verifying-account");
};

module.exports.purchasePlanForm = (req,res)=>{
    const user = res.locals.currentUser;
    const publicKey = process.env.STRIPE_PUB_KEY;
    res.render("register/purchase-plan",{user,publicKey});
};

module.exports.purchasePlan = async(req,res)=>{
    const user = res.locals.currentUser;
    const {promoCode,paymentMethodId} = req.body;
    await stripe.paymentMethods.attach(paymentMethodId,{customer:user.stripeCustomer});
    await stripe.customers.update(user.stripeCustomer,{
        invoice_settings: {
            default_payment_method: paymentMethodId
          }
    });
    const plan = await Plan.findOne({name:"Standard"});
    let couponId = "";
    if(promoCode){
        if(promoCode.toUpperCase()=="1FLAMINGO"){
            couponId = "1-free-month";
        }
        else if(promoCode.toUpperCase()=="2FLAMINGOS"){
            couponId = "2-free-months";
        }
        else if(promoCode.toUpperCase()=="3FLAMINGOS"){
            couponId = "3-free-months";
        };
    };
    const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomer,
        items: [{ price: plan.stripePrice }],
        coupon: couponId
    });
    user.stripePaymentMethod = paymentMethodId;
    user.plan = plan.name;
    user.stripeSubscription = subscription.id;
    await user.save();
    req.flash("success","Plan purchased successfully");
    res.redirect("/invoices");
};