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
    plan:{
        type: Schema.Types.ObjectId,
        ref: "Plan"
    },
    stripeAccount:{
        type: String,
    },
    stripeCustomer:{
        type: String
    },
    invoiceCount:{
        type: Number,
        default: 0,
        required: true
    }
});

userSchema.methods.increaseInvoiceCount = function(){
    this.invoiceCount+=1;
    this.save();
    return this.invoiceCount;
};

//use email to login instead of a username (set in index.js as well)
userSchema.plugin(passportLocalMongoose,{usernameField:"email"});

module.exports = mongoose.model("User",userSchema);