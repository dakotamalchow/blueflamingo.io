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

/*
lineItems: {
    item1: { description: 'test item 1', amount: '1.00' },
    item2: { description: 'test item 2', amount: '2.00' },
    ...
}
*/

const invoiceReqBodySchema = Joi.object({
    customerId: Joi.objectId().required(),
    lineItems: Joi.object().pattern(
        Joi.string().required(),
        Joi.object({
            description: Joi.string().required(),
            amount: Joi.number().min(0).precision(2).required()
        }).required()
    ).required(),
    notes: Joi.string().allow("")
});

module.exports.validateInvoiceReqBody = (req,res,next)=>{
    const {error} = invoiceReqBodySchema.validate(req.body);
    if(error){
        const message = error.details.map(el=>el.message).join(",");
        throw new AppError(400,message);
    }else{
        next();
    };
};

const customerReqBodySchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required()
});

module.exports.validateCustomerReqBody = (req,res,next)=>{
    const {error} = customerReqBodySchema.validate(req.body);
    if(error){
        const message = error.details.map(el=>el.message).join(",");
        throw new AppError(400,message);
    }else{
        next();
    };
};

const userReqBodySchema = Joi.object({
    name: Joi.string().required(),
    businessName: Joi.string().allow(""),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
});

module.exports.validateUserReqBody = (req,res,next)=>{
    const {error} = userReqBodySchema.validate(req.body);
    if(error){
        const message = error.details.map(el=>el.message).join(",");
        throw new AppError(400,message);
    }else{
        next();
    };
};