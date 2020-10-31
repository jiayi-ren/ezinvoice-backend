const express = require('express');
const authRequired = require('../middleware/authRequired');
const router = express.Router();
const Users = require('./userModel');

router.get('/', authRequired, (req, res) => {

  Users.findAll()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: err.message });
    });
});

module.exports = router;