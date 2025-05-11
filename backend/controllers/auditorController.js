const auditorModel = require('../models/auditorModel');

exports.addProduct = async (req, res) => {
    try {
      const { name, type, desc, cp, sp, qty, supplier, available } = req.body;
      const result = await pool.request()
        .input('name', sql.VarChar(128), name)
        .input('type', sql.VarChar(128), type)
        .input('desc', sql.VarChar(512), desc)
        .input('cp', sql.SmallMoney, cp)
        .input('sp', sql.SmallMoney, sp)
        .input('qty', sql.Int, qty)
        .input('supplier', sql.VarChar(4), supplier)
        .input('available', sql.Char(1), available)
        .execute('AddProduct');
        
      res.status(201).json({ productId: result.recordset[0].product_id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

exports.removeProduct = async (req, res) => {
    try {
        const result = await auditorModel.removeProduct(req.params.id);
        res.json({ message: 'Product removed', result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const result = await auditorModel.updateProduct(req.body);
        res.json({ message: 'Product updated', result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addSupplier = async (req, res) => {
    try {
        const result = await auditorModel.addSupplier(req.body);
        res.status(201).json({ message: 'Supplier added', result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeSupplier = async (req, res) => {
    try {
        const result = await auditorModel.removeSupplier(req.params.id);
        res.json({ message: 'Supplier removed', result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeCustomer = async (req, res) => {
    try {
        const result = await auditorModel.removeCustomer(req.params.id);
        res.json({ message: 'Customer removed', result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
