const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    businessName:{
        type: String,
        required: true
    },
    plan:{
        type: String
    },
    stripeSubscription:{
        type: String
    },
    stripeAccount:{
        type: String,
    },
    stripeCustomer:{
        type: String
    },
    stripePaymentMethod:{
        type: String
    },
    invoiceCount:{
        type: Number,
        default: 0,
        required: true
    },
    logo:{
        url: String,
        fileName: String,
        originalName: String
    },
    isStripeVerified:{
        type: Boolean,
        default: false,
        requred: true
    },
    isAdmin:{
        type: Boolean,
        default: false,
        required: true
    }
});

userSchema.methods.increaseInvoiceCount = function(){
    this.invoiceCount+=1;
    this.save();
    return this.invoiceCount;
};

userSchema.virtual("thumbnail").get(function(){
    return this.logo.url.replace("/upload","/upload/w_200,c_thumb");
});

//use email to login instead of a username (set in index.js as well)
userSchema.plugin(passportLocalMongoose,{usernameField:"email"});

module.exports = mongoose.model("User",userSchema);