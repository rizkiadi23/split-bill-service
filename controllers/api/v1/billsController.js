const billsController = require('express').Router();
const Bill = require('../../../models/Bill.js');

/**
 * @params
 * get all users in the system
 */
billsController.get('/all', (req, res) => {
  Bill.find()
    .then(bills => {
      res.json(bills);
    })
    .catch(err => res.status(500).json({ messages: 'Something went wrong' }));
});

/**
 * @params
 * get bill group by id
 */
billsController.get('/:id', (req, res) => {
  Bill
    .findOne({_id: req.params.id})
    .populate('billItemList.billItem')
    .then((bill) => {
      res.json(bill);
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        message: "Something went wrong :("
      });
    });
});

/**
 * @params 
 * @desc Show Bill Summary
 */
billsController.get('/:id/summary', (req, res) => {
  Bill.findById(req.params.id)
    .then((data) => {
      res.json(data);
    });
});

/**
 * @params billGroupName, billItemList
 * @desc Create Bill Group
 */
billsController.post('/create', (req, res) => {
  Bill.findOne({ billGroupName: req.body.billGroupName }).then(bill => {
    if (bill) {
      return res.status(400).json({success: false, message: "The bill name is not unique"});
    }

    const newBill = new Bill({
      billGroupName: req.body.billGroupName,
      billItemList: req.body.billItemList
    });

    newBill
      .save()
      .then(() => {
        res.json({success: true, message: "New Bill Group Created"});
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({
          success: false,
          message: err
        });
      })
  });
});

/**
 * @params
 * @desc Update Bill Group
 */
billsController.patch('/:id/update', (req, res) => {
  Bill
    .findById(req.params.id)
    .then((bill) => {
      if (!bill) return res.status(404).json({success: false, message: 'Bill item not found'});
      bill
        .updateOne(req.body)
        .then(() => {
          res.status(200).json({
            success: true, 
            message: "Bill Item Updated", 
          });
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
 * @params billGroupId
 * @desc Delete Bill Group
 */
billsController.delete('/:id/delete', (req, res) => {
  Bill
    .findById(req.params.id)
    .then((bill) => {
      if (!bill) return res.status(404).json({success: false, message: 'Bill item not found'});

      bill
        .remove()
        .then(() => res.json({success: true, message: "Bill Group Removed"}))
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({success: false, message: "Internal Server Error"});
    });
});


/**
 * @params billGroupId, billItemList
 * @desc Add Bill Item to Bill Group
 */
billsController.patch('/addBillItem', (req, res) => {
  Bill
    .findOne({ _id: req.body.billGroupId })
    .then(bill => {
      if (!bill) return res.json(bill);

      bill.billItemList.push({billItem: req.body.billItemId});
      
      bill
        .save()
        .then(() => {
          res.status(200).json({
            success: true,
            message: "New Bill Item Added Into Group"
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            success: false,
            message: "Internal Server Error"
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        success: false,
        message: "Bad Request"
      });
    });
});

module.exports = billsController;