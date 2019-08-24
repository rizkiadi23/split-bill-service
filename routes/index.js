const indexController = require('../controllers');
const pingController = require('../controllers');
const usersController = require('../controllers/api/v1/usersController');
const billsController = require('../controllers/api/v1/billsController');
const billItemsController = require('../controllers/api/v1/billItemsController');

module.exports = app => {
  app.use('/ping', pingController);
  app.use('/api/v1/users', usersController);
  app.use('/api/v1/bills', billsController);
  app.use('/api/v1/billitems', billItemsController);
  app.use('*', indexController);
};