const billingModel = require('../models/billingModel');

// Initialize a new bill
exports.initializeBill = async (req, res) => {
    const { cashier_id } = req.body;
    try {
        console.log('Attempting to initialize bill with cashier:', cashier_id);
        
        if (!cashier_id) {
            return res.status(400).json({ 
                success: false,
                error: 'Cashier ID is required' 
            });
        }

        const result = await billingModel.initializeBill(cashier_id);
        
        if (!result.recordset?.[0]?.bill_id) {
            console.error('Invalid result structure:', result);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to create bill: Invalid response structure' 
            });
        }

        console.log('Bill initialization successful:', result.recordset[0]);
        res.status(200).json({
            success: true,
            bill_id: result.recordset[0].bill_id
        });
    } catch (error) {
        console.error('Bill initialization failed:', {
            error: error.message,
            stack: error.stack,
            cashierId: cashier_id
        });
        
        // Determine if this is a client error or server error
        const statusCode = error.message.includes('Invalid employee') || 
                          error.message.includes('not authorized') || 
                          error.message.includes('not found') || 
                          error.message.includes('not available')
            ? 400  // Client error
            : 500; // Server error

        res.status(statusCode).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get all available products for the grid
exports.getAvailableProducts = async (req, res) => {
    try {
        const result = await billingModel.getAvailableProducts();
        res.status(200).json({
            success: true,
            products: result.recordset
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add product to bill
exports.addProductToBill = async (req, res) => {
    const { bill_id, product_id, quantity, unit_price } = req.body;
    try {
        const result = await billingModel.addProductToBill(bill_id, product_id, quantity, unit_price);
        res.status(200).json({
            success: true,
            message: 'Product added to bill'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Cancel bill
exports.cancelBill = async (req, res) => {
    const { bill_id } = req.body;
    try {
        await billingModel.cancelBill(bill_id);
        res.status(200).json({
            success: true,
            message: 'Bill cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Complete bill
exports.completeBill = async (req, res) => {
    const { bill_id, tax_percentage = 0, discount_percentage = 0 } = req.body;
    try {
        if (!bill_id) {
            return res.status(400).json({
                success: false,
                error: 'Bill ID is required'
            });
        }

        const result = await billingModel.completeBill(bill_id, tax_percentage, discount_percentage);
        res.status(200).json({
            success: true,
            message: 'Bill completed successfully',
            ...result
        });
    } catch (error) {
        console.error('Error completing bill:', {
            error: error.message,
            stack: error.stack,
            billId: bill_id
        });
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get bill details
exports.getBillDetails = async (req, res) => {
    const { bill_id } = req.params;
    try {
        const result = await billingModel.getBillDetails(bill_id);
        res.status(200).json({
            success: true,
            bill_details: result.recordset
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update bill details
exports.updateBill = async (req, res) => {
    const { bill_id, bill_costumer, tax_percentage, discount_percentage, subtotal, total } = req.body;
    try {
        if (!bill_id) {
            return res.status(400).json({
                success: false,
                error: 'Bill ID is required'
            });
        }

        const result = await billingModel.updateBill(bill_id, {
            bill_costumer,
            tax_percentage,
            discount_percentage,
            subtotal,
            total
        });

        res.status(200).json({
            success: true,
            message: 'Bill updated successfully'
        });
    } catch (error) {
        console.error('Error updating bill:', {
            error: error.message,
            stack: error.stack,
            billId: bill_id
        });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
