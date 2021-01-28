const mongoose = require("mongoose");
const {Schema} = mongoose;

const invoiceSchema = new Schema({
    customer:{
        type: Schema.Types.ObjectId,
        ref: "Customer",
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