const salesModel = require('../models/salesModel');

// Create new bill
exports.createBill = async (req, res) => {
    try {
        const { cashierId, customerId } = req.body;
        const billId = await salesModel.createBill(cashierId, customerId);
        res.json({ billId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add product to bill
exports.addProductToBill = async (req, res) => {
    try {
        const { billId, productId, quantity } = req.body;
        
        if (!billId || !productId || !quantity) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        await salesModel.addProductToBill(billId, productId, quantity);
        res.json({ message: "Product added to bill" });
    } catch (err) {
        if (err.message.includes('Insufficient stock') || 
            err.message.includes('Product not available')) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

// In salesController.js - keep only this version:
exports.checkoutBill = async (req, res) => {
    try {
        const { billId, cashierId } = req.body;
        
        if (!billId || !cashierId) {
            return res.status(400).json({ 
                error: "Both billId and cashierId are required",
                example: {
                    billId: "BIL12345",  // Example format
                    cashierId: "EMP1"
                }
            });
        }

        const receipt = await salesModel.checkoutBill(billId, cashierId);
        res.json({ 
            message: "Bill completed successfully",
            receipt 
        });
    } catch (err) {
        if (err.message.includes('No active bill')) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};
exports.generateBill = async (req, res) => {
    try {
        const billID = req.session.billID;

        if (!billID) {
            return res.status(400).json({ error: 'No active bill found. Start a bill first.' });
        }

        const result = await salesModel.generateBill({
            billID: billID,
            productID: req.body.productID,
            quantity: req.body.quantity
        });

        res.status(201).json({ message: 'Product added to bill', result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addCustomer = async (req, res) => {
    try {
        const result = await salesModel.addCustomer(req.body);
        res.status(201).json({ message: 'Customer added', result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.viewProfile = async (req, res) => {
    try {
        const result = await salesModel.viewProfile(req.params.id);
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.editDetails = async (req, res) => {
    try {
        const result = await salesModel.editDetails(req.body);
        res.json({ message: 'Customer updated', result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Optional: clear session after checkout

