const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const AppError = require("./AppError");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        return res.redirect("/login");
    };
    next();
};

module.exports.hasPlan = (req,res,next)=>{
    const user = res.locals.currentUser;
    if(!(user.plan=="Standard")){
        return res.redirect("/register/purchase-plan");
    };
    next();
};

module.exports.isStripeVerified = (req,res,next)=>{
    const user = res.locals.currentUser;
    if(!user.isStripeVerified){
        return res.redirect("/register/account-info");
    };
    next();
};

module.exports.isAdmin = (req,res,next)=>{
    const user = res.locals.currentUser;
    if(!user.isAdmin){
        return next(new AppError(401,"Unauthorized route"));
    };
    next();
};

const validateReqBody = (req,res,next,schema)=>{
    const {error} = schema.validate(req.body);
    if(error){
        const message = error.details.map(el=>el.message).join(",");
        throw new AppError(400,message);
    }else{
        next();
    };
};

module.exports.validateInvoiceReqBody = (req,res,next)=>{
    /*lineItems: {
        item1: { description: 'test item 1', amount: '1.00', quantity: '1', tax: '12345678abcdef1234578'},
        item2: { description: 'test item 2', amount: '2.00', quantity: '2', tax: '12345678abcdef1234579'},
        ...
    }*/
    /*paymentOptions: {
        card: "on",
        bank: "on"
    }*/
    const InvoiceReqBodySchema = Joi.object({
        customerId: Joi.objectId().required(),
        lineItems: Joi.object().pattern(
            Joi.string().required(),
            Joi.object({
                description: Joi.string().required(),
                amount: Joi.number().min(0).precision(2).required(),
                quantity: Joi.number().min(1).required(),
                tax:Joi.string().required()
            }).required()
        ).required(),
        paymentOptions: Joi.object().required(),
        notes: Joi.string().allow("")
    });
    validateReqBody(req,res,next,InvoiceReqBodySchema);
};

module.exports.validatePayInvoiceReqBody = (req,res,next)=>{
    const payInvoiceReqBodySchema = Joi.object({
        stripePaymentMethod: Joi.string().required()
    });    
    validateReqBody(req,res,next,payInvoiceReqBodySchema);
};

module.exports.validateCustomerReqBody = (req,res,next)=>{
    const customerReqBodySchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        returnToUrl: Joi.string()
    });
    validateReqBody(req,res,next,customerReqBodySchema);
};

module.exports.validateUserReqBody = (req,res,next)=>{
    const userReqBodySchema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        businessName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        confirmPassword: Joi.string().required()
    });
    validateReqBody(req,res,next,userReqBodySchema);
};