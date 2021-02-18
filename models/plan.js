const mongoose = require("mongoose");
const {Schema} = mongoose;

const planSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    stripePrice:{
        type: String,
    }
});

module.exports = mongoose.model("Plan",planSchema);