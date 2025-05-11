const { sql, poolConnect, pool } = require('./db');

const initializeBill = async (cashierId) => {
    await poolConnect;
    try {
        // Validate employee ID format (should be 'E' followed by 3 digits)
        if (!cashierId || !cashierId.match(/^E\d{3}$/)) {
            throw new Error('Invalid employee ID format. Expected format: E followed by 3 digits (e.g., E001)');
        }

        console.log('Executing CreateBill procedure with cashierId:', cashierId);
        const request = pool.request()
            .input('cashierId', sql.VarChar(4), cashierId);

        const result = await request.execute('CreateBill');

        if (!result.recordset || !result.recordset[0] || !result.recordset[0].bill_id) {
            console.error('No valid result returned from CreateBill procedure');
            throw new Error('Failed to create bill: No valid bill ID returned');
        }

        console.log('Bill created successfully. Result:', JSON.stringify(result.recordset[0], null, 2));
        return result;
    } catch (error) {
        console.error('Error in initializeBill:', {
            error: error.message,
            stack: error.stack,
            cashierId: cashierId
        });
        throw error;
    }
};

const getAvailableProducts = async () => {
    await poolConnect;
    try {
        const result = await pool.request()
            .query(`
                SELECT 
                    product_id,
                    product_name,
                    product_description,
                    product_sale_price,
                    product_quantity
                FROM product
                WHERE product_available = '1' 
                AND product_quantity > 0
            `);
        return result;
    } catch (error) {
        throw new Error(`Error fetching products: ${error.message}`);
    }
};

const addProductToBill = async (billId, productId, quantity, unitPrice) => {
    await poolConnect;
    try {
        // Validate bill ID format (should be 'B' followed by 8 digits)
        if (!billId || !billId.match(/^B\d{8}$/)) {
            throw new Error('Invalid bill ID format');
        }

        // Validate product ID format (should be 'P' followed by 8 digits)
        if (!productId || !productId.match(/^P\d{8}$/)) {
            throw new Error('Invalid product ID format');
        }

        // Start transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // First check if bill exists and is not completed
            const billCheck = await transaction.request()
                .input('billId', sql.VarChar(9), billId)
                .query(`
                    SELECT bill_id 
                    FROM bill 
                    WHERE bill_id = @billId 
                    AND is_completed = 0
                `);

            if (billCheck.recordset.length === 0) {
                throw new Error('Bill not found or already completed');
            }

            // Check if product has enough quantity
            const checkQuantity = await transaction.request()
                .input('productId', sql.VarChar(9), productId)
                .input('quantity', sql.Int, quantity)
                .query(`
                    SELECT 
                        CASE 
                            WHEN product_quantity >= @quantity AND product_available = '1' THEN 1 
                            ELSE 0 
                        END AS has_stock
                    FROM product 
                    WHERE product_id = @productId
                `);

            if (!checkQuantity.recordset[0].has_stock) {
                throw new Error('Insufficient stock or product unavailable');
            }

            // Add to bill_log and update product quantity
            await transaction.request()
                .input('billId', sql.VarChar(9), billId)
                .input('productId', sql.VarChar(9), productId)
                .input('quantity', sql.Int, quantity)
                .input('unitPrice', sql.Decimal(10,2), unitPrice)
                .query(`
                    INSERT INTO bill_log (bill_id, product_id, quantity, unit_price)
                    VALUES (@billId, @productId, @quantity, @unitPrice);

                    UPDATE product
                    SET product_quantity = product_quantity - @quantity
                    WHERE product_id = @productId;
                `);

            await transaction.commit();
            return { success: true };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        throw new Error(`Error adding product to bill: ${error.message}`);
    }
};

const cancelBill = async (billId) => {
  await poolConnect;
    try {
        // Validate bill ID format
        if (!billId || !billId.match(/^B\d{8}$/)) {
            throw new Error('Invalid bill ID format');
        }

        // Start transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Check if bill exists and is not completed
            const billCheck = await transaction.request()
                .input('billId', sql.VarChar(9), billId)
                .query(`
                    SELECT bill_id 
                    FROM bill 
                    WHERE bill_id = @billId 
                    AND is_completed = 0
                `);

            if (billCheck.recordset.length === 0) {
                throw new Error('Bill not found or already completed');
            }

            // Return products to inventory and delete bill records
            await transaction.request()
                .input('billId', sql.VarChar(9), billId)
                .query(`
                    -- Return products to inventory
                    UPDATE p
                    SET p.product_quantity = p.product_quantity + bl.quantity
                    FROM product p
                    INNER JOIN bill_log bl ON p.product_id = bl.product_id
                    WHERE bl.bill_id = @billId;

                    -- Delete bill records
                    DELETE FROM bill_log WHERE bill_id = @billId;
                    DELETE FROM bill WHERE bill_id = @billId;
                `);

            await transaction.commit();
            return { success: true };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        throw new Error(`Error canceling bill: ${error.message}`);
    }
};

const completeBill = async (billId, taxPercentage = 0, discountPercentage = 0) => {
  await poolConnect;
    try {
        // Validate bill ID format
        if (!billId || !billId.match(/^B\d{8}$/)) {
            throw new Error('Invalid bill ID format');
        }

        // Start transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Check if bill exists and is not completed
            const billCheck = await transaction.request()
                .input('billId', sql.VarChar(9), billId)
                .query(`
                    SELECT bill_id, bill_cashier
                    FROM bill 
                    WHERE bill_id = @billId 
                    AND is_completed = 0
                `);

            if (billCheck.recordset.length === 0) {
                throw new Error('Bill not found or already completed');
            }

            // Calculate total amount
            const totalResult = await transaction.request()
                .input('billId', sql.VarChar(9), billId)
                .query(`
                    SELECT SUM(quantity * unit_price) as total_amount
                    FROM bill_log
                    WHERE bill_id = @billId;
                `);

            if (!totalResult.recordset[0] || totalResult.recordset[0].total_amount === null) {
                throw new Error('Bill has no items');
            }

            const total_amount = totalResult.recordset[0].total_amount;
            const cashierId = billCheck.recordset[0].bill_cashier;

            // Mark bill as completed and create expense entry
            await transaction.request()
                .input('billId', sql.VarChar(9), billId)
                .input('totalAmount', sql.Decimal(10,2), total_amount)
                .input('cashierId', sql.VarChar(4), cashierId)
                .query(`
                    -- Update bill completion status
                    UPDATE bill
                    SET is_completed = 1
                    WHERE bill_id = @billId;

                    -- Create expense entry
                    INSERT INTO expense (
                        expense_type,
                        expense_description,
                        expense_price,
                        expense_generation_employee
                    )
                    VALUES (
                        'Sale',
                        'Bill ID: ' + @billId,
                        @totalAmount,
                        @cashierId
                    );
                `);

            await transaction.commit();
            return { 
                success: true, 
                total_amount
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        throw new Error(`Error completing bill: ${error.message}`);
    }
};

const getBillDetails = async (billId) => {
  await poolConnect;
    try {
        // Validate bill ID format
        if (!billId || !billId.match(/^B\d{8}$/)) {
            throw new Error('Invalid bill ID format');
        }

        const result = await pool.request()
            .input('billId', sql.VarChar(9), billId)
            .query(`
                SELECT 
                    bl.*,
                    p.product_name,
                    p.product_description
                FROM bill_log bl
                JOIN product p ON bl.product_id = p.product_id
                WHERE bl.bill_id = @billId
            `);
        return result;
    } catch (error) {
        throw new Error(`Error fetching bill details: ${error.message}`);
    }
};

const updateBill = async (billId, updates) => {
    await poolConnect;
    try {
        console.log('Updating bill:', { billId, updates });

        // Validate bill ID format
        if (!billId || !billId.match(/^B\d{8}$/)) {
            throw new Error('Invalid bill ID format');
        }

        // Start transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Check if bill exists and is not completed
            const billCheck = await transaction.request()
                .input('billId', sql.VarChar(9), billId)
                .query(`
                    SELECT bill_id
                    FROM bill 
                    WHERE bill_id = @billId 
                    AND is_completed = 0
                `);

            console.log('Bill check result:', billCheck);

            if (billCheck.recordset.length === 0) {
                throw new Error('Bill not found or already completed');
            }

            // Build update query dynamically based on provided fields
            let updateFields = [];
            const request = transaction.request()
                .input('billId', sql.VarChar(9), billId);

            // Handle customer ID (can be null)
            if ('bill_costumer' in updates) {
                updateFields.push('bill_costumer = @costumer');
                request.input('costumer', sql.VarChar(4), updates.bill_costumer);
            }

            // Note: According to the DDL, the bill table doesn't have tax_percentage, 
            // discount_percentage, subtotal, or total columns, so we'll remove those updates

            if (updateFields.length > 0) {
                const updateQuery = `
                    UPDATE bill
                    SET ${updateFields.join(', ')}
                    WHERE bill_id = @billId;
                    
                    SELECT * FROM bill WHERE bill_id = @billId;
                `;
                console.log('Executing update query:', updateQuery);
                console.log('Update parameters:', request.parameters);
                const result = await request.query(updateQuery);
                console.log('Update result:', result);
            }

            await transaction.commit();
            return { success: true };
        } catch (error) {
            console.error('Transaction error:', {
                message: error.message,
                stack: error.stack,
                details: error
            });
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Update bill error:', {
            message: error.message,
            stack: error.stack,
            details: error
        });
        throw new Error(`Error updating bill: ${error.message}`);
    }
};

module.exports = {
  initializeBill,
    getAvailableProducts,
  addProductToBill,
    cancelBill,
    completeBill,
    getBillDetails,
    updateBill
};
