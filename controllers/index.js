const ping_controller = require('express').Router();

ping_controller.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Pong"
  });
});

module.exports = ping_controller;