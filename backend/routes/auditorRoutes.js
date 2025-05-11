const express = require('express');
const router = express.Router();
const controller = require('../controllers/auditorController');

router.post('/add-product', controller.addProduct);
router.delete('/remove-product/:id', controller.removeProduct);
router.put('/update-product', controller.updateProduct);
router.post('/add-supplier', controller.addSupplier);
router.delete('/remove-supplier/:id', controller.removeSupplier);
router.delete('/remove-customer/:id', controller.removeCustomer);

module.exports = router;
