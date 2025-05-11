// controllers/managerController.js 
const managerModel = require('../models/managerModel');

exports.addEmployee = async (req, res) => {
    try {
      const result = await managerModel.addEmployee(req.body);
      res.status(201).json({
        message: 'Employee added successfully',
        employeeId: result.employee_id,
        details: result
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
        receivedData: req.body,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  };
  exports.addSupplier = async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['supplier_name', 'supplier_contact_no', 'supplier_email', 'supplier_address'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const newSupplier = await managerModel.addSupplier(req.body);
        res.status(201).json({
            message: 'Supplier added successfully',
            supplier: newSupplier
        });
    } catch (err) {
        console.error('Supplier add error:', err);
        res.status(500).json({
            error: err.message,
            receivedData: req.body,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
exports.viewEmployees = async (req, res) => {
    try {
      const employees = await managerModel.viewEmployees();
      res.status(200).json({
        message: 'Employees retrieved successfully',
        data: employees
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  };

exports.viewInventory = async (req, res) => {
    try {
        const inventory = await managerModel.viewInventory();
        res.status(200).json({
            message: 'Inventory retrieved successfully',
            data: inventory.map(item => ({
                id: item.product_id,
                name: item.product_name,
                type: item.product_type,
                quantity: item.product_quantity,
                price: item.selling_price,
                description: item.product_description,
                available: item.product_available === '1'
            }))
        });
    } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.viewCustomers = async (req, res) => {
    try {
        console.log('Controller: Fetching customers...');
        const result = await managerModel.viewCustomers();
        console.log('Controller: Got result:', result);
        
        if (!result || !result.recordset) {
            return res.status(500).json({ 
                error: 'Invalid response format from database' 
            });
        }
        
        if (result.recordset.length === 0) {
            return res.status(200).json([]);
        }
        
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Controller error:', err);
        res.status(500).json({ 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};


exports.viewExpenses = async (req, res) => {
    try {
        const expenses = await managerModel.viewExpenses();
        res.status(200).json({
            message: 'Expenses retrieved successfully',
            data: expenses.map(expense => ({
                description: expense.expense_description,
                time: new Date(expense.expense_date).toLocaleString(),
                amount: `${expense.amount.toFixed(2)}`,
                id: expense.expense_id
            }))
        });
    } catch (err) {
        console.error('Error in viewExpenses:', err);
        res.status(500).json({ 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
exports.viewBills = async (req, res) => {
    try {
        const bills = await managerModel.viewBills();
        res.status(200).json({
            message: 'Bills retrieved successfully',
            data: bills.map(bill => ({
                billId: bill.bill_id,
                cashierId: bill.cashierId,
                customerId: bill.customerId,
                date: bill.date,
                total: bill.total,
                products: bill.products.map(p => ({
                    productId: p.productId,
                    name: p.name,
                    quantity: p.quantity,
                    price: p.price
                }))
            }))
        });
    } catch (err) {
        console.error('Error in viewBills:', err);
        res.status(500).json({ 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
exports.getProfit = async (req, res) => {
    try {
        const profit = await managerModel.getProfit();
        
        if (!profit || profit.length === 0) {
            return res.status(404).json({ 
                error: 'No profit data available' 
            });
        }

        res.status(200).json({
            message: 'Profit data retrieved successfully',
            data: {
                totalSales: profit[0].total_sales || 0,
                totalExpenses: profit[0].total_expenses || 0,
                netProfit: profit[0].net_profit || 0
            }
        });
    } catch (err) {
        console.error('Profit calculation error:', err);
        res.status(500).json({ 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.viewSuppliers = async (req, res) => {
    try {
        const result = await managerModel.viewSuppliers();
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTopSellingProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const products = await managerModel.getTopSellingProducts(limit);
        res.status(200).json({
            message: 'Top selling products retrieved successfully',
            data: products
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.getLowStockProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const products = await managerModel.getLowStockProducts(limit);
        res.status(200).json({
            message: 'Low stock products retrieved successfully',
            data: products
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        // Get employee_id from query parameters
        const employeeId = req.query.employee_id;
        console.log('Received profile request for employee_id:', employeeId);
        
        if (!employeeId) {
            console.log('No employee_id provided in request');
            return res.status(400).json({
                error: 'Employee ID is required'
            });
        }

        const profile = await managerModel.getUserProfile(employeeId);
        console.log('Profile data from database:', profile);
        
        if (!profile) {
            console.log('No profile found for employee_id:', employeeId);
            return res.status(404).json({
                error: 'Profile not found'
            });
        }

        res.status(200).json({
            message: 'Profile retrieved successfully',
            data: profile
        });
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.updateProductAvailability = async (req, res) => {
    try {
        const { productId } = req.params;
        const { available } = req.body;

        if (productId === undefined || available === undefined) {
            return res.status(400).json({
                error: 'Product ID and availability status are required'
            });
        }

        await managerModel.updateProductAvailability(productId, available);
        res.status(200).json({
            message: `Product ${available ? 'activated' : 'deactivated'} successfully`
        });
    } catch (err) {
        console.error('Error updating product availability:', err);
        res.status(500).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.updateCustomerStatus = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { available } = req.body;

        if (customerId === undefined || available === undefined) {
            return res.status(400).json({
                error: 'Customer ID and availability status are required'
            });
        }

        await managerModel.updateCustomerStatus(customerId, available);
        res.status(200).json({
            message: `Customer ${available === '1' ? 'activated' : 'deactivated'} successfully`
        });
    } catch (err) {
        console.error('Error updating customer status:', err);
        res.status(500).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.updateEmployeeStatus = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { available } = req.body;

        if (employeeId === undefined || available === undefined) {
            return res.status(400).json({
                error: 'Employee ID and availability status are required'
            });
        }

        await managerModel.updateEmployeeStatus(employeeId, available);
        res.status(200).json({
            message: `Employee ${available === '1' ? 'activated' : 'deactivated'} successfully`
        });
    } catch (err) {
        console.error('Error updating employee status:', err);
        res.status(500).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const result = await managerModel.addProduct(req.body);
        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            data: result
        });
    } catch (err) {
        console.error('Error in addProduct:', err);
        res.status(400).json({ 
            success: false,
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.addCustomer = async (req, res) => {
    try {
        const {
            costumer_name,
            costumer_email,
            costumer_contact_no,
            costumer_address,
            costumer_available
        } = req.body;

        // Validate required fields
        if (!costumer_name || !costumer_contact_no || !costumer_address) {
            return res.status(400).json({
                error: 'Name, contact number, and address are required'
            });
        }

        // Validate phone number format (11 digits)
        if (!/^\d{11}$/.test(costumer_contact_no)) {
            return res.status(400).json({
                error: 'Phone number must be exactly 11 digits'
            });
        }

        // Validate email format if provided
        if (costumer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(costumer_email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        const result = await managerModel.addCustomer({
            costumer_name,
            costumer_email,
            costumer_contact_no,
            costumer_address,
            costumer_available: costumer_available || '1'
        });

        res.status(201).json({
            message: 'Customer added successfully',
            data: result
        });
    } catch (err) {
        console.error('Error adding customer:', err);
        if (err.message.includes('Violation of UNIQUE KEY constraint')) {
            if (err.message.includes('costumer_email')) {
                return res.status(400).json({
                    error: 'Email address is already registered'
                });
            }
            if (err.message.includes('costumer_contact_no')) {
                return res.status(400).json({
                    error: 'Phone number is already registered'
                });
            }
        }
        res.status(500).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};