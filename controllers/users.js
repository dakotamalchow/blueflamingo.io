module.exports.loginForm = (req,res)=>{
    res.render("users/login");
};

module.exports.loginUser = (req,res)=>{
    const user = req.user;
    let redirectUrl = req.session.returnTo || "/invoices";
    delete req.session.returnTo;
    if(user.isAdmin){
        redirectUrl = "/admin";
    };
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req,res)=>{
    req.logOut();
    req.flash("success","User logged out");
    res.redirect("/");
};