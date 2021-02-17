const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');

const User = require("../models/user");
const Plan = require("../models/plan");

module.exports.registerForm = (req,res)=>{
    res.render("users/register");
};

const validatePassword = (password)=>{
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
    if(errorMessage){
        return errorMessage
    };
    return true;
};

module.exports.registerUser = async(req,res,next)=>{
    const {name,businessName,email,password} = req.body;
    const isPasswordValid = validatePassword(password);
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
    res.redirect("/register/purchase-plan");
};

module.exports.purchasePlanForm = (req,res)=>{
    res.render("users/purchase-plan");
};

module.exports.purchasePlan = async(req,res)=>{
    const user = res.locals.currentUser;
    const paymentMethodId = req.body.stripePaymentMethod;
    await stripe.paymentMethods.attach(paymentMethodId,{customer:user.stripeCustomer});
    await stripe.customers.update(user.stripeCustomer,{
        invoice_settings: {
            default_payment_method: paymentMethodId
          }
    });
    const plan = await Plan.findOne({name:"Standard"});
    const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomer,
        items: [{ price: plan.stripePrice }]
    });
    user.stripePaymentMethod = paymentMethodId;
    user.plan = plan;
    user.stripeSubscription = subscription.id;
    await user.save();
    req.flash("success","Plan purchased successfully");
    res.redirect("/register/complete-account");
};

module.exports.completeAccount = (req,res)=>{
    res.rend("users/complete-account");
};

module.exports.completeAccount = async(req,res)=>{
    const user = res.locals.currentUser;
    const stripeAccount = await stripe.accounts.retrieve(user.stripeAccount);
    if(stripeAccount.charges_enabled && stripeAccount.details_submitted){
        user.isAccountComplete = true;
        await user.save();
        req.flash("success","Registration process complete");
        return res.redirect("/invoices");
    }
    else{
        const accountLinks = await stripe.accountLinks.create({
            account:stripeAccount.id,
            refresh_url:"http://localhost:3000/register/complete-account",
            return_url:"http://localhost:3000/register/complete-account",
            type:"account_onboarding"
        });
        const url = accountLinks.url;
        return res.render("users/complete-account",{url});
    };
};

module.exports.loginForm = (req,res)=>{
    res.render("users/login");
};

module.exports.loginUser = (req,res)=>{
    const redirectUrl = req.session.returnTo || "/invoices";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req,res)=>{
    req.logOut();
    req.flash("success","User logged out");
    res.redirect("/");
};