const mongoose = require("mongoose");
const {Schema} = mongoose;

const invoiceSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    customer:{
        type: Schema.Types.ObjectId,
        ref: "Customer",
    },
    stripeInvoice:{
        type: String,
        required: true
    },
    invoiceNumber:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Invoice",invoiceSchema);