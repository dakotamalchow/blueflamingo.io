const { Schemas } = require("aws-sdk");
const mongoose = require("mongoose");
const {Schema} = mongoose;

const invoiceSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    // customer:{
    //     type: Schema.Types.ObjectId,
    //     ref: "Customer",
    // },
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    amount:{
        type: Number,
    },
    notes:{
        type: String
    },
    status:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Invoice",invoiceSchema);