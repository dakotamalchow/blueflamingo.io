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
    }
});

//use email to login instead of a username (set in index.js as well)
userSchema.plugin(passportLocalMongoose,{usernameField:"email"});

module.exports = mongoose.model("User",userSchema);