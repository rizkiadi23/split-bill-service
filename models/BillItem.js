const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const BillItemSchema = new Schema({
  billName: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  tax: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  payor: [
    {
      _id: false,
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
      amount: {
        type: Number
      }
    }
  ],
  item: [
    {
      itemName: {
        type: String
      },
      itemOwner: [
        {
          _id: false,
          user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
          }
        }
      ],
      priceBeforeTax: {
        type: Number
      },
      priceAfterTax: {
        type: Number
      },
      quantity: {
        type: Number
      }
    }
  ]
});

module.exports = User = mongoose.model('billItems', BillItemSchema);