// models/auditorModel.js 
const { sql, poolConnect, pool } = require('../models/db');


async function addProduct(data) {
    await poolConnect;
    const request = pool.request();
    
    // Map all parameters explicitly
    request.input('name', sql.VarChar(128), data.name);
    request.input('type', sql.VarChar(128), data.type);  // ← Must include this
    request.input('desc', sql.VarChar(512), data.desc || null);
    request.input('cp', sql.SmallMoney, data.cp);
    request.input('sp', sql.SmallMoney, data.sp);
    request.input('qty', sql.Int, data.qty);
    request.input('supplier', sql.VarChar(4), data.supplier || null);
    request.input('available', sql.Char(1), data.available || '1');
    
    return request.execute('AddProduct');
}

async function removeProduct(id) {
    await poolConnect;
    return pool.request().input('productID', sql.Int, id).execute('RemoveProduct');
}

async function updateProduct(data) {
    await poolConnect;
    const request = pool.request();
    
    // Map all parameters
    request.input('productId', sql.VarChar(9), data.productId);
    request.input('qty', sql.Int, data.qty);
    request.input('cp', sql.SmallMoney, data.cp);
    request.input('sp', sql.SmallMoney, data.sp);
    // models/auditorModel.js - Add these to updateProduct
    request.input('min_stock', sql.Int, data.min_stock || 10);
    request.input('max_stock', sql.Int, data.max_stock || 100);
    
    return request.execute('UpdateProduct');
}

async function addSupplier(data) {
    await poolConnect;
    const request = pool.request();
    request.input('name', sql.VarChar(64), data.name);
    request.input('contact', sql.Char(11), data.contact);
    request.input('email', sql.VarChar(128), data.email);
    request.input('address', sql.VarChar(128), data.address);
    return request.execute('AddSupplier');
}

async function removeSupplier(id) {
    await poolConnect;
    return pool.request().input('supplierID', sql.Int, id).execute('RemoveSupplier');
}

async function removeCustomer(id) {
    await poolConnect;
    return pool.request().input('customerID', sql.Int, id).execute('RemoveCustomer');
}

module.exports = {
    addProduct,
    removeProduct,
    updateProduct,
    addSupplier,
    removeSupplier,
    removeCustomer
};