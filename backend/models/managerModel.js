// models/managerModel.js 
const { sql, poolConnect, pool } = require('../models/db');


async function addEmployee(data) {
    await poolConnect;
    const request = pool.request();
    
    // Add OUTPUT parameter to get the inserted ID
    request.input('name', sql.VarChar(64), data.employee_name);
    request.input('cnic', sql.BigInt, data.employee_cnic);
    request.input('salary', sql.SmallMoney, data.employee_salary);
    request.input('contact', sql.Char(11), data.employee_contact_no);
    request.input('email', sql.VarChar(128), data.employee_email);
    request.input('designation', sql.VarChar(64), data.employee_designation);
    request.input('address', sql.VarChar(256), data.employee_address);
    request.input('available', sql.Char(1), data.employee_available);
    
    // Add output parameter for the new employee ID
    request.output('newEmployeeId', sql.Int);
  
    const result = await request.execute('AddEmployee');
    
    return {
      employee_id: result.output.newEmployeeId,
      ...data
    };
  }
  async function addSupplier(data) {
    await poolConnect;
    const request = pool.request();
    
    // Add input parameters
    request.input('name', sql.VarChar(64), data.supplier_name);
    request.input('contact', sql.Char(11), data.supplier_contact_no);
    request.input('email', sql.VarChar(128), data.supplier_email);
    request.input('address', sql.VarChar(256), data.supplier_address);
    request.input('available', sql.Char(1), data.supplier_available || '1'); // Default to available

    // Add OUTPUT parameter to get the inserted ID
    request.output('newSupplierId', sql.Int);

    // Use execute instead of query to call a stored procedure
    const result = await request.execute('AddSupplier');
    
    // Return the complete supplier data
    return {
        supplier_id: result.output.newSupplierId,
        supplier_name: data.supplier_name,
        supplier_contact_no: data.supplier_contact_no,
        supplier_email: data.supplier_email,
        supplier_address: data.supplier_address,
        supplier_available: data.supplier_available || '1'
    };
}
async function viewEmployees() {
    await poolConnect;
    const result = await pool.request().execute('ViewEmployees');
    return result.recordset;
}

async function viewCustomers() {
    await poolConnect;
    try {
        console.log('Attempting to fetch customers...');
        const request = pool.request();
        const query = `
            SELECT 
                c.costumer_id,
                c.costumer_name,
                c.costumer_contact_no,
                c.costumer_email,
                c.costumer_address,
                c.costumer_joined_at,
                c.costumer_available,
                COUNT(DISTINCT b.bill_id) as total_bills,
                ISNULL(SUM(bl.quantity * bl.unit_price), 0) as total_spent
            FROM costumer c
            LEFT JOIN bill b ON c.costumer_id = b.bill_costumer AND b.is_completed = 1
            LEFT JOIN bill_log bl ON b.bill_id = bl.bill_id
            GROUP BY 
                c.costumer_id,
                c.costumer_name,
                c.costumer_contact_no,
                c.costumer_email,
                c.costumer_address,
                c.costumer_joined_at,
                c.costumer_available
            ORDER BY total_bills DESC;
        `;
        console.log('Executing query:', query);
        const result = await request.query(query);
        console.log('Query result:', result);
        return result;
    } catch (err) {
        console.error('Error details:', err);
        throw new Error('Failed to fetch customers: ' + err.message);
    }
}

async function viewInventory() {
    await poolConnect;
    try {
        const request = pool.request();
        const query = `
            SELECT 
                product_id,
                product_name,
                product_type,
                product_quantity,
                product_sale_price as selling_price,
                product_description,
                product_available
            FROM product
            ORDER BY product_name;
        `;
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error fetching inventory:', err);
        throw new Error('Failed to fetch inventory: ' + err.message);
    }
}

async function viewExpenses() {
    await poolConnect;
    try {
        const request = pool.request();
        const query = `
            SELECT 
                expense_id,
                expense_description,
                expense_price as amount,
                CONVERT(varchar, expense_date, 120) as expense_date
            FROM expense
            ORDER BY expense_date DESC;
        `;
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error fetching expenses:', err);
        throw new Error('Failed to fetch expenses: ' + err.message);
    }
}
async function viewBills() {
    await poolConnect;
    try {
        const request = pool.request();
        const query = `
            SELECT 
            b.bill_id,
            b.bill_cashier as cashierId,
            b.bill_costumer as customerId,
            b.created_at as date,
            (
                SELECT SUM(bl1.quantity * bl1.unit_price)
                FROM bill_log bl1
                WHERE bl1.bill_id = b.bill_id
            ) as total,
            (
                SELECT 
                    bl2.product_id as productId,
                    p.product_name as name,
                    bl2.quantity,
                    bl2.unit_price as price
                FROM bill_log bl2
                JOIN product p ON bl2.product_id = p.product_id
                WHERE bl2.bill_id = b.bill_id
                FOR JSON PATH
            ) as products
                FROM bill b
                WHERE b.is_completed = 1
                ORDER BY b.created_at DESC;
`;
        const result = await request.query(query);
        
        return result.recordset.map(bill => ({
            ...bill,
            products: bill.products ? JSON.parse(bill.products) : [],
            date: bill.date.toISOString()
        }));
    } catch (err) {
        console.error('Error fetching bills:', err);
        throw new Error('Failed to fetch bills: ' + err.message);
    }
}

async function getProfit(startDate, endDate) {
    await poolConnect;
    try {
        const request = pool.request();
        request.input('startDate', sql.DateTime, startDate);
        request.input('endDate', sql.DateTime, endDate);
        
        const query = `
            SELECT 
                ISNULL(SUM(bl.quantity * bl.unit_price), 0) as total_sales,
                ISNULL((SELECT SUM(expense_price) FROM expense 
                        WHERE expense_date BETWEEN @startDate AND @endDate), 0) as total_expenses,
                ISNULL(SUM(bl.quantity * bl.unit_price), 0) - 
                ISNULL((SELECT SUM(expense_price) FROM expense 
                        WHERE expense_date BETWEEN @startDate AND @endDate), 0) as net_profit
            FROM bill b
            LEFT JOIN bill_log bl ON b.bill_id = bl.bill_id
            WHERE b.created_at BETWEEN @startDate AND @endDate
            AND b.is_completed = 1;
        `;
        
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error calculating profit:', err);
        throw new Error('Failed to calculate profit: ' + err.message);
    }
}

async function viewSuppliers() {
    await poolConnect;
    return pool.request().execute('ViewSuppliers');
}

async function getDailySales(startDate, endDate) {
    await poolConnect;
    try {
        const request = pool.request();
        request.input('startDate', sql.DateTime, startDate);
        request.input('endDate', sql.DateTime, endDate);
        
        const query = `
            SELECT 
                CAST(b.created_at AS DATE) as sale_date,
                ISNULL(SUM(bl.quantity * bl.unit_price), 0) as daily_sales
            FROM bill b
            LEFT JOIN bill_log bl ON b.bill_id = bl.bill_id
            WHERE b.created_at BETWEEN @startDate AND @endDate
            AND b.is_completed = 1
            GROUP BY CAST(b.created_at AS DATE)
            ORDER BY sale_date;
        `;
        
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error getting daily sales:', err);
        throw new Error('Failed to get daily sales: ' + err.message);
    }
}

async function getTopSellingProducts(limit = 3) {
    await poolConnect;
    try {
        const request = pool.request();
        request.input('limit', sql.Int, limit);
        const result = await request.execute('GetTopSellingProducts');
        return result.recordset;
    } catch (err) {
        console.error('Top selling products error:', err);
        throw new Error('Failed to get top selling products: ' + err.message);
    }
}

async function getLowStockProducts(limit = 3) {
    await poolConnect;
    try {
        const request = pool.request();
        request.input('limit', sql.Int, limit);
        const result = await request.execute('GetLowStockProducts');
        return result.recordset;
    } catch (err) {
        console.error('Low stock products error:', err);
        throw new Error('Failed to get low stock products: ' + err.message);
    }
}

async function getUserProfile(employeeId) {
    await poolConnect;
    try {
        const request = pool.request();
        request.input('employee_id', sql.VarChar(4), employeeId);
        
        // First check if employee exists
        const checkQuery = `
            SELECT e.employee_id 
            FROM employee e 
            WHERE e.employee_id = @employee_id;
        `;
        
        const checkResult = await request.query(checkQuery);
        if (checkResult.recordset.length === 0) {
            return null;
        }
        
        const query = `
            SELECT 
                e.employee_id,
                e.employee_name,
                e.employee_address,
                e.employee_designation,
                ISNULL(u.username, 'N/A') as username,
                ISNULL(u.role, 'Employee') as role,
                (
                    SELECT COUNT(DISTINCT b.bill_id)
                    FROM bill b
                    WHERE b.bill_cashier = @employee_id
                    AND b.is_completed = 1
                ) as total_sales
            FROM employee e
            LEFT JOIN USERS u ON e.employee_id = u.employee_id
            WHERE e.employee_id = @employee_id;
        `;
        
        const result = await request.query(query);
        return result.recordset[0];
    } catch (err) {
        console.error('Profile fetch error:', err);
        throw new Error('Failed to get user profile: ' + err.message);
    }
}

async function updateProductAvailability(productId, isAvailable) {
    await poolConnect;
    try {
        const request = pool.request();
        request.input('product_id', sql.VarChar(9), productId);
        request.input('available', sql.Char(1), isAvailable ? '1' : '0');
        
        const query = `
            UPDATE product 
            SET product_available = @available
            WHERE product_id = @product_id;
        `;
        
        await request.query(query);
        return { success: true };
    } catch (err) {
        console.error('Error updating product availability:', err);
        throw new Error('Failed to update product availability: ' + err.message);
    }
}

async function updateCustomerStatus(customerId, isAvailable) {
    await poolConnect;
    try {
        const request = pool.request();
        request.input('customer_id', sql.VarChar(9), customerId);
        request.input('available', sql.Char(1), isAvailable);
        
        const query = `
            UPDATE costumer 
            SET costumer_available = @available
            WHERE costumer_id = @customer_id;
        `;
        
        await request.query(query);
        return { success: true };
    } catch (err) {
        console.error('Error updating customer status:', err);
        throw new Error('Failed to update customer status: ' + err.message);
    }
}

async function updateEmployeeStatus(employeeId, isAvailable) {
    await poolConnect;
    try {
        const request = pool.request();
        request.input('employee_id', sql.VarChar(4), employeeId);
        request.input('available', sql.Char(1), isAvailable);
        
        const query = `
            UPDATE employee 
            SET employee_available = @available
            WHERE employee_id = @employee_id;
        `;
        
        await request.query(query);
        return { success: true };
    } catch (err) {
        console.error('Error updating employee status:', err);
        throw new Error('Failed to update employee status: ' + err.message);
    }
}

async function addProduct(data) {
    await poolConnect;
    try {
        const request = pool.request();
        
        // Validate required fields
        if (!data.product_name || !data.product_type || !data.product_cost_price || !data.product_sale_price) {
            throw new Error('Missing required fields');
        }

        // Add input parameters
        request.input('name', sql.VarChar(128), data.product_name);
        request.input('type', sql.VarChar(128), data.product_type);
        request.input('description', sql.VarChar(512), data.product_description);
        request.input('costPrice', sql.SmallMoney, data.product_cost_price);
        request.input('salePrice', sql.SmallMoney, data.product_sale_price);
        request.input('quantity', sql.Int, data.product_quantity || 0);
        request.input('supplier', sql.VarChar(4), data.product_supplier);
        request.input('minStock', sql.Int, data.min_stock);
        request.input('maxStock', sql.Int, data.max_stock);
        request.input('available', sql.Char(1), '1'); // New products are active by default

        const query = `
            INSERT INTO product (
                product_name,
                product_type,
                product_description,
                product_cost_price,
                product_sale_price,
                product_quantity,
                product_supplier,
                min_stock,
                max_stock,
                product_available
            )
            VALUES (
                @name,
                @type,
                @description,
                @costPrice,
                @salePrice,
                @quantity,
                @supplier,
                @minStock,
                @maxStock,
                @available
            );
            
            SELECT SCOPE_IDENTITY() AS product_id;
        `;

        const result = await request.query(query);
        const productId = result.recordset[0].product_id;

        return {
            success: true,
            product_id: 'P' + productId.toString().padStart(8, '0'),
            message: 'Product added successfully'
        };
    } catch (err) {
        console.error('Error adding product:', err);
        throw new Error('Failed to add product: ' + err.message);
    }
}

async function addCustomer(data) {
    await poolConnect;
    const request = pool.request();

    request.input('name', sql.VarChar(64), data.costumer_name);
    request.input('contact', sql.Char(11), data.costumer_contact_no);
    request.input('email', sql.VarChar(128), data.costumer_email);
    request.input('address', sql.VarChar(256), data.costumer_address);
    request.input('available', sql.Char(1), data.costumer_available || '1');

    return request.execute('AddCustomer');
}

module.exports = {
    addEmployee,
    viewEmployees,
    viewCustomers,
    viewInventory,
    viewExpenses,
    getProfit,
    viewSuppliers,
    getDailySales,
    getTopSellingProducts,
    getLowStockProducts,
    getUserProfile,
    updateProductAvailability,
    updateCustomerStatus,
    updateEmployeeStatus,
    addSupplier,
    viewBills,
    addProduct,
    addCustomer
};