// Validation utility functions

const validateEmployee = (data) => {
    const errors = [];
    const {
        employee_name,
        employee_cnic,
        employee_salary,
        employee_contact_no,
        employee_email,
        employee_designation,
        employee_address
    } = data;

    // Required fields check
    const requiredFields = [
        'employee_name',
        'employee_cnic',
        'employee_salary',
        'employee_contact_no',
        'employee_email',
        'employee_designation',
        'employee_address'
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
        return errors;
    }

    // Name validation
    if (employee_name.length < 3 || employee_name.length > 64) {
        errors.push('Employee name must be between 3 and 64 characters');
    }

    // CNIC validation (13 digits)
    if (!/^\d{13}$/.test(employee_cnic)) {
        errors.push('CNIC must be exactly 13 digits');
    }

    // Salary validation
    if (isNaN(employee_salary) || employee_salary <= 0) {
        errors.push('Salary must be a positive number');
    }

    // Contact number validation (11 digits)
    if (!/^\d{11}$/.test(employee_contact_no)) {
        errors.push('Contact number must be exactly 11 digits');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employee_email)) {
        errors.push('Invalid email format');
    }

    // Designation validation
    if (employee_designation.length < 2 || employee_designation.length > 64) {
        errors.push('Designation must be between 2 and 64 characters');
    }

    // Address validation
    if (employee_address.length < 5 || employee_address.length > 256) {
        errors.push('Address must be between 5 and 256 characters');
    }

    return errors;
};

const validateSupplier = (data) => {
    const errors = [];
    const {
        supplier_name,
        supplier_contact_no,
        supplier_email,
        supplier_address
    } = data;

    // Required fields check
    const requiredFields = [
        'supplier_name',
        'supplier_contact_no',
        'supplier_email',
        'supplier_address'
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
        return errors;
    }

    // Name validation
    if (supplier_name.length < 3 || supplier_name.length > 64) {
        errors.push('Supplier name must be between 3 and 64 characters');
    }

    // Contact number validation (11 digits)
    if (!/^\d{11}$/.test(supplier_contact_no)) {
        errors.push('Contact number must be exactly 11 digits');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supplier_email)) {
        errors.push('Invalid email format');
    }

    // Address validation
    if (supplier_address.length < 5 || supplier_address.length > 256) {
        errors.push('Address must be between 5 and 256 characters');
    }

    return errors;
};

const validateProduct = (data) => {
    const errors = [];
    const {
        product_name,
        product_type,
        product_description,
        product_cost_price,
        product_sale_price,
        product_quantity,
        product_supplier,
        min_stock,
        max_stock
    } = data;

    // Required fields check
    const requiredFields = [
        'product_name',
        'product_type',
        'product_cost_price',
        'product_sale_price',
        'product_quantity',
        'min_stock',
        'max_stock'
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
        return errors;
    }

    // Name validation
    if (product_name.length < 3 || product_name.length > 128) {
        errors.push('Product name must be between 3 and 128 characters');
    }

    // Type validation
    if (product_type.length < 2 || product_type.length > 128) {
        errors.push('Product type must be between 2 and 128 characters');
    }

    // Description validation (optional)
    if (product_description && product_description.length > 512) {
        errors.push('Product description cannot exceed 512 characters');
    }

    // Price validations
    if (isNaN(product_cost_price) || product_cost_price <= 0) {
        errors.push('Cost price must be a positive number');
    }

    if (isNaN(product_sale_price) || product_sale_price <= 0) {
        errors.push('Sale price must be a positive number');
    }

    if (parseFloat(product_sale_price) <= parseFloat(product_cost_price)) {
        errors.push('Sale price must be greater than cost price');
    }

    // Quantity validation
    if (!Number.isInteger(Number(product_quantity)) || Number(product_quantity) < 0) {
        errors.push('Quantity must be a non-negative integer');
    }

    // Stock limits validation
    if (!Number.isInteger(Number(min_stock)) || Number(min_stock) < 0) {
        errors.push('Minimum stock must be a non-negative integer');
    }

    if (!Number.isInteger(Number(max_stock)) || Number(max_stock) <= Number(min_stock)) {
        errors.push('Maximum stock must be greater than minimum stock');
    }

    // Supplier validation (if provided)
    if (product_supplier && !/^S\d{3}$/.test(product_supplier)) {
        errors.push('Invalid supplier ID format. Expected format: S followed by 3 digits (e.g., S001)');
    }

    return errors;
};

module.exports = {
    validateEmployee,
    validateSupplier,
    validateProduct
}; 