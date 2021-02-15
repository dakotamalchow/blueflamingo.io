const mongoose = require("mongoose");
const {Schema} = mongoose;

const planSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    stripePrice:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Plan",planSchema);