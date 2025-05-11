const { sql, poolConnect, pool } = require('../models/db');

// Create new bill
async function createBill(cashierId, customerId = null) {
    await poolConnect;
    const request = pool.request();
    request.input('cashier_id', sql.VarChar(4), cashierId);
    if (customerId) {
        request.input('customer_id', sql.VarChar(4), customerId);
    }
    const result = await request.execute('CreateBill');
    return result.recordset[0].bill_id;
}

// Add product to bill
async function addProductToBill(billId, productId, quantity) {
    await poolConnect;
    const request = pool.request();
    request.input('bill_id', sql.VarChar(9), billId);
    request.input('product_id', sql.VarChar(9), productId);
    request.input('quantity', sql.Int, quantity);
    await request.execute('AddProductToBill');
  }

// Checkout bill
async function checkoutBill(billId, cashierId) {
    await poolConnect;
    const request = pool.request();
    request.input('bill_id', sql.VarChar(9), billId); // Updated to VarChar(9)
    request.input('cashier_id', sql.VarChar(4), cashierId);
    const result = await request.execute('CheckoutBill');
    
    return {
        header: result.recordsets[0][0],
        items: result.recordsets[1]
    };
}




async function generateBill(data) {
    await poolConnect;
    const request = pool.request();

    request.input('billID', sql.Int, data.billID);
    request.input('productID', sql.Int, data.productID);
    request.input('quantity', sql.Int, data.quantity);

    return request.execute('GenerateBill');
}

async function addCustomer(data) {
    await poolConnect;
    const request = pool.request();

    request.input('name', sql.VarChar(64), data.name);
    request.input('contact', sql.Char(11), data.contact);
    request.input('email', sql.VarChar(128), data.email);
    request.input('address', sql.VarChar(256), data.address);
    request.input('available', sql.Char(1), data.available || '1');

    return request.execute('AddCustomer');
}

async function viewProfile(id) {
    await poolConnect;
    return pool.request()
        .input('customerID', sql.Int, id)
        .execute('ViewCustomerProfile');
}

async function editDetails(data) {
    await poolConnect;
    const request = pool.request();

    request.input('customerID', sql.Int, data.customerID);
    request.input('name', sql.VarChar(64), data.name);
    request.input('contact', sql.Char(11), data.contact);
    request.input('email', sql.VarChar(128), data.email);
    request.input('address', sql.VarChar(128), data.address);

    return request.execute('EditCustomer');
}

// Optional


module.exports = {
    createBill,
    addProductToBill,
    checkoutBill,
    generateBill,
    addCustomer,
    viewProfile,
    editDetails
};
