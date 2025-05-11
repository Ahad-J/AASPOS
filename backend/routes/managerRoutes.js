const express = require('express');
const router = express.Router();
const controller = require('../controllers/managerController');

// Proper controller reference
router.post('/add-employee', controller.addEmployee);
router.post('/add-supplier',controller.addSupplier);
router.post('/add-product', controller.addProduct);
router.get('/view-employees', controller.viewEmployees);
router.get('/view-customers', controller.viewCustomers);
router.post('/add-customer', controller.addCustomer);
router.get('/view-inventory', controller.viewInventory);
router.get('/view-expenses', controller.viewExpenses);
router.get('/get-profit', controller.getProfit);
router.get('/view-suppliers', controller.viewSuppliers);
router.get('/top-selling', controller.getTopSellingProducts);
router.get('/low-stock', controller.getLowStockProducts);
router.get('/profile', controller.getUserProfile);
router.get('/view-bills', controller.viewBills);
router.patch('/product/:productId/availability', controller.updateProductAvailability);
router.patch('/customer/:customerId/status', controller.updateCustomerStatus);
router.patch('/employee/:employeeId/status', controller.updateEmployeeStatus);


module.exports = router;