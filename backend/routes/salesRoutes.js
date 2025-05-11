const express = require('express');
const router = express.Router();
const controller = require('../controllers/salesController');

// Existing routes
router.post('/generate-bill', controller.generateBill);
router.post('/add-customer', controller.addCustomer);
router.get('/view-profile/:id', controller.viewProfile);
router.put('/edit-details', controller.editDetails);

// New billing routes
router.post('/bills', controller.createBill);
router.post('/bills/items', controller.addProductToBill);
router.post('/bills/checkout', controller.checkoutBill);

module.exports = router;