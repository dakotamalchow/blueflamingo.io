const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    businessName:{
        type: String
    },
    invoices:[
        {
            type: Schema.Types.ObjectId,
            ref: "Invoice"
        }
    ],
    customers:[
        {
            type: Schema.Types.ObjectId,
            ref: "Customer"
        }
    ]
});

//use email to login instead of a username (set in index.js as well)
userSchema.plugin(passportLocalMongoose,{usernameField:"email"});

module.exports = mongoose.model("User",userSchema);