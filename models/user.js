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
        type: String
    },
    stripeAccount:{
        type: String,
        required: true
    },
    invoiceCount:{
        type: Number,
        default: 0
    }
});

userSchema.methods.increaseInvoiceCount = function(){
    return this.invoiceCount+=1;
};

//use email to login instead of a username (set in index.js as well)
userSchema.plugin(passportLocalMongoose,{usernameField:"email"});

module.exports = mongoose.model("User",userSchema);