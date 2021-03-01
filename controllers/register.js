const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');

const User = require("../models/user");
const Plan = require("../models/plan");

module.exports.registerForm = (req,res)=>{
    res.render("register/register-form");
};

const validatePassword = (password,confirmPassword)=>{
    let errorMessage = "";
    if(password.length<8){
        errorMessage+="Password must be at least 8 characters long. ";
    };
    if(!/[A-Za-z]/.test(password)){
        errorMessage+="Password must contain at least one letter. ";
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

module.exports.registerUser = async(req,res,next)=>{
    const {name,businessName,email,password,confirmPassword} = req.body;
    const isPasswordValid = validatePassword(password,confirmPassword);
    if(isPasswordValid!=true){
        req.flash("error",isPasswordValid);
        return res.redirect("/register");
    };
    const user = new User({name,businessName,email});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser,err=>{
        if(err) {return next(err);}
    });
    const stripeAccount = await stripe.accounts.create({
        type:"express",
        country:"US",
        email: user.email,
        business_profile:{
            name:businessName
        },
        capabilities:{
            card_payments:{requested:true},
            transfers:{requested:true}
        }
    });
    user.stripeAccount = stripeAccount.id;
    const stripeCustomer = await stripe.customers.create({
        name: user.name,
        email: user.email
    });
    user.stripeCustomer = stripeCustomer.id;
    await user.save();
    req.flash("success","Account successfully created");
    res.redirect("/register/add-account-info");
};

module.exports.addAccountInfoPage = async(req,res)=>{
    const user = res.locals.currentUser;
    const stripeAccount = await stripe.accounts.retrieve(user.stripeAccount);
    if(stripeAccount.charges_enabled && stripeAccount.details_submitted){
        console.log("verified");
        user.isStripeVerified = true;
        await user.save();
        req.flash("success","Accout info added successfully");
        return res.redirect("/register/purchase-plan");
    }
    else{
        console.log("not verified");
        const accountLinks = await stripe.accountLinks.create({
            account:stripeAccount.id,
            refresh_url:"https://blueflamingo.io/register/refresh-account-links",
            return_url:"https://blueflamingo.io/register/verifying-account",
            type:"account_onboarding"
        });
        const url = accountLinks.url;
        return res.render("register/add-account-info",{url});
    };
};

module.exports.refreshAccountLinks = async(req,res)=>{
    const user = res.locals.currentUser;
    const stripeAccount = await stripe.accounts.retrieve(user.stripeAccount);
    if(!stripeAccount.charges_enabled || !stripeAccount.details_submitted){
        const accountLinks = await stripe.accountLinks.create({
            account:stripeAccount.id,
            refresh_url:"https://blueflamingo.io/register/refresh-account-links",
            return_url:"https://blueflamingo.io/register/verifying-account",
            type:"account_onboarding"
        });
        const url = accountLinks.url;
        return res.redirect(url);
    };
    res.redirect("/");
};

module.exports.verifyingAccountPage = async(req,res)=>{
    const user = res.locals.currentUser;
    const stripeAccount = await stripe.accounts.retrieve(user.stripeAccount);
    if(stripeAccount.charges_enabled && stripeAccount.details_submitted){
        user.isStripeVerified = true;
        await user.save();
        req.flash("success","Accout info added successfully");
        return res.redirect("/register/purchase-plan");
    };
    res.render("register/verifying-account");
};

module.exports.purchasePlanForm = (req,res)=>{
    const user = res.locals.currentUser;
    if(user.plan){
        return res.redirect("/invoices");
    }
    res.render("register/purchase-plan");
};

module.exports.purchasePlan = async(req,res)=>{
    const user = res.locals.currentUser;
    const paymentMethodId = req.body.stripePaymentMethod;
    const {promoCode} = req.body;
    await stripe.paymentMethods.attach(paymentMethodId,{customer:user.stripeCustomer});
    await stripe.customers.update(user.stripeCustomer,{
        invoice_settings: {
            default_payment_method: paymentMethodId
          }
    });
    const plan = await Plan.findOne({name:"Standard"});
    let couponId = ""
    if(promoCode.toUpperCase()=="1FLAMINGO"){
        couponId = "1-free-month";
    }
    else if(promoCode.toUpperCase()=="2FLAMINGOS"){
        couponId = "2-free-months";
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