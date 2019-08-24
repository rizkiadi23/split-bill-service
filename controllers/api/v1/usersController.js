const usersController = require('express').Router();
const User = require('../../../models/User.js');

/**
 * @params
 * get all users in the system
 */
usersController.get('/all', (req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(404).json({ messages: 'No Users found' }));
});

/**
 * @params user_id
 * Get user by id
 */
usersController.get('/:user_id', (req, res) => {
  User.findById(req.params.user_id)
    .then(user => res.json(user))
    .catch(err => { 
      console.log(err);
      res.status(404).json({ messages: 'No Users found' });
    });
});

/**
 * @params payloads
 * Create user
 */
usersController.post('/create', (req, res) => {
  User.findOne({ username: req.body.username }).then(user => {
    if (user) {
      return res.status(400).json({success: false, message: "user already exits"});
    }

    const newUser = new User({
      username: req.body.username
    });

    newUser
      .save()
      .then(() => {
        res.json({success: true, message: "New User Created"});
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
 * @params user_id, paylaods
 * @desc Update user
 */
usersController.patch('/:user_id/update', (req, res) => {
  User
    .findOne({ _id: req.params.user_id }).then(user => {
      if (!user) return res.json({ success: false, message: "User not found!" });

      user.updateOne(req.body)
      .then(() => {
        res.json({success: true, message: "User successfully updated"});
      })
      .catch((err) => {
        console.log(err);
        res.json({success: false, message: err });
      });
    });
});

/**
 * @params user_id
 * @desc Delete Bill Item
 */
usersController.delete('/:user_id/delete', (req, res) => {
  User
    .findById(req.params.user_id)
    .then((user) => {
      if (!user) return res.status(404).json({success: false, message: 'User not found'});

      user
        .remove()
        .then(() => res.json({success: true, message: "User Removed"}))
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({success: false, message: "Internal Server Error"});
    });
});

module.exports = usersController;