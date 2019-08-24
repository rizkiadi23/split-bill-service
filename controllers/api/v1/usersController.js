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

module.exports = usersController;