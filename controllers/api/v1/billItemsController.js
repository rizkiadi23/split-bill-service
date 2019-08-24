const billItemsController = require('express').Router();
const BillItem = require('../../../models/BillItem.js');
const lodash = require('lodash');

/**
 * @params no params
 * @desc Get all bill items
 */
billItemsController.get('/all', (req, res) => {
  BillItem.find()
    .then(bills => {
      res.json(bills);
    })
    .catch(err => res.status(500).json({ messages: 'Something went wrong' }));
});

/**
 * @params
 * get bill item by id
 */
billItemsController.get('/:id', (req, res) => {
  BillItem
    .findOne({ _id: req.params.id })
    .populate('payor.user')
    .populate('item.itemOwner.user')
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
 * @params billItem_id
 * @desc Get Summary of the bill item
 */
billItemsController.get('/:billItem_id/summary', async (req, res) => {
  
  try {
    let billData = await BillItem.findOne({ _id: req.params.billItem_id })
                                 .populate('payor.user')
                                 .populate('item.itemOwner.user');
    let finalResponse = {};

    // Count Total Amount Per User
    let attendeeFromItem = [];
    billData.item.forEach((el) => {
      if (el.itemOwner.length != 0) {
        el.itemOwner.forEach((own) => {
          if (attendeeFromItem.indexOf(own.user.username) == -1) {
            attendeeFromItem.push(own.user.username);
          }
        });
      }
    });

    if (attendeeFromItem.length < billData.attendee) {
      res.json({
        success: false,
        message: "Items haven't distributed properly"
      });
    }

    const obj = {};
    for (const key of attendeeFromItem) {
      obj[key] = {shouldPay: 0, havePaid: 0};
    }

    for (let name in obj) {
      billData.item.forEach((itm) => {
        if (itm.itemOwner.find(target => target.user.username === name)) {
          obj[name].shouldPay += itm.priceAfterTax;
        }
      });
    }

    for (let name in obj) {
      billData.payor.forEach((itm) => {
        if (itm.user.username == name) {
          obj[name].havePaid += itm.amount;
        }
      });
    }

    // Calculate Still Owe or Owed
    for (let name in obj) {
      let total = obj[name].shouldPay - obj[name].havePaid;
      if (total > 0) {
        obj[name].stillOweToFriend = total;
      } else if (total < 0) {
        obj[name].stillOwedByFriend = total;
      } else {
        obj[name].paidOff = true;
      }
    }
    
    res.json({
      data: obj
    });
  } catch(err) {
    console.log(err);
    res.json({success: false, message: "Internal Server Error"});
  }
});

/**
 * @params Summary of The Bill
 * @desc Allocate Payment Automatically
 */
billItemsController.post('/:billItem_id/allocate', (req, res) => {
  
  try {
    let terhutang = [];
    let penghutang = [];
  
    // Pecah menjadi 2 bagian, penghutang dan terhutang
    let dataSummary = req.body.dataSummary;
    for (key in dataSummary) {
      if (!dataSummary[key].paidOff) {
        if (dataSummary[key].stillOwedByFriend) {
          terhutang.push({
            name: key,
            hutang: dataSummary[key].stillOwedByFriend
          });
        } else {
          penghutang.push({
            name: key,
            hutang: dataSummary[key].stillOweToFriend})
        }
      }
    }
  
    terhutang = lodash.orderBy(terhutang, ['name', 'hutang'], ['asc', 'desc']);
    penghutang = lodash.orderBy(penghutang, ['name','hutang'], ['asc', 'desc']);
    
    let autoAllocate = [];
    
    for (let i = penghutang.length-1; i >= 0;) {
      for(let j = 0; j < terhutang.length;) {
        if (terhutang[j].hutang + penghutang[i].hutang == 0) {
          autoAllocate.push(`${penghutang[i].name} membayar penuh kepada ${terhutang[j].name} sebesar Rp.${penghutang[i].hutang}`);
          terhutang[j].hutang = terhutang[j].hutang + penghutang[i].hutang;
          penghutang[i].hutang -= penghutang[i].hutang;
          i--;
          j++;
        } else if (terhutang[j].hutang + penghutang[i].hutang < 0) {
          autoAllocate.push(`${penghutang[i].name} membayar penuh kepada ${terhutang[j].name} sebesar Rp.${penghutang[i].hutang}`);        
          terhutang[j].hutang = terhutang[j].hutang + penghutang[i].hutang;
          penghutang[i].hutang -= penghutang[i].hutang;
          i--;
        } else if (terhutang[j].hutang + penghutang[i].hutang > 0) {
          autoAllocate.push(`${penghutang[i].name} membayar sebagian kepada ${terhutang[j].name} sebesar Rp.${terhutang[j].hutang * -1}`);        
          penghutang[i].hutang = penghutang[i].hutang + terhutang[j].hutang;
          terhutang[j].hutang -= terhutang[j].hutang;
          j++;
        }
      }
    }
  
    res.json({
      success: true,
      message: autoAllocate
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: err
    });
  }
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
      attendee: req.body.attendee,
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