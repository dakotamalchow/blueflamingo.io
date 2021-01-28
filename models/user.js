const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
    name:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true
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

module.exports = mongoose.model("User",userSchema);