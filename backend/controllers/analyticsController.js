const managerModel = require('../models/managerModel');

exports.getAnalytics = async (req, res) => {
    try {
        // Get date range for the last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        // Get all required data using existing functions
        const [employees, customers, inventory, profit, dailySales] = await Promise.all([
            managerModel.viewEmployees(),
            managerModel.viewCustomers(),
            managerModel.viewInventory(),
            managerModel.getProfit(startDate, endDate),
            managerModel.getDailySales(startDate, endDate)
        ]);

        // Extract counts and profit data
        const analytics = {
            productCount: inventory.length,
            employeeCount: employees.length,
            customerCount: customers.recordset.length,
            profit: profit[0]?.net_profit || 0,
            dailySales: dailySales.map(sale => ({
                date: new Date(sale.sale_date).toISOString().split('T')[0],
                amount: parseFloat(sale.daily_sales)
            }))
        };

        res.status(200).json({
            message: 'Analytics data retrieved successfully',
            data: analytics
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
}; 