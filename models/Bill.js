const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const BillSchema = new Schema({
  billGroupName: {
    type: String,
    required: true
  },
  billItemList: [
    {
      _id: false,
      billItem: {
        type: Schema.Types.ObjectId,
        ref: 'billItems'
      }
    }
  ],
  createdDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: "open"
  }
});

module.exports = Bill = mongoose.model('bills', BillSchema);