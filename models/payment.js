const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
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
        required: true
    },
    notes:{
        type: String
    },
    status:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model("payment",paymentSchema);