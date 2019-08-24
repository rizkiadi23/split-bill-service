const billItemsController = require('express').Router();
const BillItem = require('../../../models/BillItem.js');

/**
 * @params
 * get all users in the system
 */
billItemsController.get('/:id', (req, res) => {
  BillItem
    .findOne({ _id: req.params.id })
    .populate('payor.user')
    .then(billItem => { 
      res.json(billItem);
    })
    .catch(err => {
      console.log(err);
      res.json({ 
        success: false, 
        messages: 'No Bill Item found :(' 
      });
    });
});

/**
 * @params billGroupName, billItemList
 * @desc Create Bill Item
 */
billItemsController.post('/create', (req, res) => {
  BillItem.findOne({ billName: req.body.billName }).then(billItem => {
    if (billItem) {
      return res.status(400).json({success: false, message: "The bill name is not unique"});
    }

    const newBillItem = new BillItem({
      billName: req.body.billName,
      tax: req.body.tax,
      totalAmount: req.body.totalAmount,
      payor: req.body.payor,
      item: req.body.item
    });

    newBillItem
      .save()
      .then((billItem) => {
        res.json({success: true, message: "New Bill Item Created", data: billItem });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({
          success: false,
          message: err
        });
      });
  });
});

/**
 * @params billItemId, newPaylods
 * @desc Update Bill Item
 */
billItemsController.patch('/:id/update', (req, res) => {
  BillItem
    .findById(req.params.id)
    .then((updatedBillItem) => {
      if (!updatedBillItem) return res.status(404).json({success: false, message: 'Bill item not found'});
      updatedBillItem
        .updateOne(req.body)
        .then((updateData) => {
          res.status(200).json({success: true, message: "Bill Item Updated", data: updateData });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({success: false, message: err})
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({success: false, message: "Internal Server Error"});
    });
});

/**
 * @params billItemId
 * @desc Delete Bill Item
 */
billItemsController.delete('/:id/delete', (req, res) => {
  BillItem
    .findById(req.params.id)
    .then((billItem) => {
      if (!billItem) return res.status(404).json({success: false, message: 'Bill item not found'});

      billItem
        .remove()
        .then(() => res.json({success: true, message: "Bill Item Removed"}))
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({success: false, message: "Internal Server Error"});
    });
});

module.exports = billItemsController;