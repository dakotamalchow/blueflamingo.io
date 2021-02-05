const mongoose = require("mongoose");
const {Schema} = mongoose;

const customerSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    stripeCustomer: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("invoice",customerSchema);