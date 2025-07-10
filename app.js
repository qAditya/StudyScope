const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const indexRoutes = require('./routes/index');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'client/dist/index.html'));
    }
  });
}

app.use('/', indexRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
