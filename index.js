const express = require('express');
const app = express();
const router = require('./routes');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// Load Configurations
dotenv.config();

// Register Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(er));

// Register Router
router(app);

// Listeners
app.listen(process.env.PORT, () => {
  console.log(`Server up and running on PORT ${process.env.PORT}`);
});