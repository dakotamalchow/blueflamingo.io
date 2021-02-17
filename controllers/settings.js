const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');

module.exports.index = async(req,res)=>{
    const user = res.locals.currentUser;
    const stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscription);
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(user.stripePaymentMethod);
    res.render("settings/index",{user,stripeSubscription,stripePaymentMethod});
};

module.exports.editUserForm = (req,res)=>{
    const user = res.locals.currentUser;
    res.render("settings/edit-user",{user});
};

module.exports.editUser = async(req,res)=>{
    const user = res.locals.currentUser;
    const {name,email,businessName} = req.body;
    user.name = name;
    user.email = email;
    user.businessName = businessName;
    await user.save();
    await stripe.accounts.update(user.stripeAccount,
        //can't update the email field, could have wrong email in stripe account
        {business_profile:{name:businessName}}
    );
    req.flash("success","User successfully saved");
    res.redirect("/settings");
};

module.exports.cancelSubscrption = async(req,res)=>{
    const user = res.locals.currentUser;
    user.plan = "";
    user.save();
    await stripe.subscriptions.del(user.stripeSubscription);
    req.flash("success","Subscription was successfully canceled");
    res.redirect("/settings");
};

module.exports.editPaymentMethodForm = (req,res)=>{
    res.render("settings/edit-payment-method");
};

module.exports.editPaymentMethod = async(req,res)=>{
    const user = res.locals.currentUser;
    const paymentMethodId = req.body.stripePaymentMethod;
    await stripe.paymentMethods.attach(paymentMethodId,{customer:user.stripeCustomer});
    await stripe.customers.update(user.stripeCustomer,{
        invoice_settings: {
            default_payment_method: paymentMethodId
          }
    });
    user.stripePaymentMethod = paymentMethodId;
    await user.save();
    req.flash("success","Payment method successfully saved");
    res.redirect("/settings");
};