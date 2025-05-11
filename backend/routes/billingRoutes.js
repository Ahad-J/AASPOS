const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

// Initialize new bill
router.post('/initialize', billingController.initializeBill);

// Get available products
router.get('/products', billingController.getAvailableProducts);

// Add product to bill
router.post('/add-product', billingController.addProductToBill);

// Update bill details
router.post('/update-bill', billingController.updateBill);

// Cancel bill
router.post('/cancel', billingController.cancelBill);

// Complete bill
router.post('/complete', billingController.completeBill);

// Get bill details
router.get('/details/:bill_id', billingController.getBillDetails);

module.exports = router;
