const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');

const User = require("../models/user");

module.exports.registerForm = (req,res)=>{
    res.render("users/register");
};

module.exports.registerUser = async(req,res,next)=>{
    const {name,businessName,email,password} = req.body;
    const account = await stripe.accounts.create({
        type:"express",
        country:"US",
        email,
        capabilities:{
            card_payments:{requested:true},
            transfers:{requested:true}
        }
    });
    const user = new User({name,businessName,email,stripeAccount:account.id});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser,err=>{
        if(err) {return next(err);}
    });
    const accountLinks = await stripe.accountLinks.create({
        account:account.id,
        refresh_url:"http://localhost:3000",
        return_url:"http://localhost:3000",
        type:"account_onboarding"
      });
      req.flash("success","Welcome, account successfully created");
      res.redirect(accountLinks.url);
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