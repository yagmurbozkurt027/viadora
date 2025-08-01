const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/', transactionController.createTransaction);

router.get('/:id', transactionController.getTransaction);

router.get('/', transactionController.getAllTransactions);

module.exports = router; 