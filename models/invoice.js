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
        // required: true
    },
    invoiceNumber:{
        type: String,
        required: true
    },
    lineItems:[{
        description:{
            type: String,
            required: true
        },
        amount:{
            type: Number,
            required: true
        },
        quantity:{
            type: Number,
            required: true
        },
        tax:{
            type: Number,
            required: true
        }
    }],
    subtotal:{
        type: Number,
        required: true
    },
    taxTotal:{
        type: Number,
        requiried: true
    },
    total:{
        type: Number,
        required: true
    },
    amount:{
        due:{
            type: Number,
            required: true
        },
        paid:{
            type: Number,
            required: true
        },
        remaining:{
            type: Number,
            required: true
        }
    },
    notes:{
        type: String
    },
    status:{
        type: String,
        required: true
    },
    paymentOptions:{
        type: Object,
        required: true
    },
    paymentType:{
        type: String
    },
    log:[{
        timeStamp:{
            type: Date,
            required: true
        },
        description:{
            type:String,
            required:true
        }
    }]
});

module.exports = mongoose.model("Invoice",invoiceSchema);