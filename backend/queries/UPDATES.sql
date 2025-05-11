USE VERSION_1
GO
CREATE OR ALTER PROCEDURE ViewInventory
AS
BEGIN
    SELECT 
        p.product_id,
        p.product_name AS name,
        p.product_type AS type,
        p.product_description AS description,
        p.product_cost_price AS cp,
        p.product_sale_price AS sp,
        p.product_quantity AS qty,
        s.supplier_name AS supplier,
        p.min_stock,
        p.max_stock,
        p.product_available AS available
    FROM product p
    LEFT JOIN supplier s ON p.product_supplier = s.supplier_id
    ORDER BY p.product_name;
END
GO
CREATE OR ALTER PROCEDURE AddProduct
    @name VARCHAR(128),
    @type VARCHAR(128),
    @desc VARCHAR(512) = NULL,
    @cp SMALLMONEY,
    @sp SMALLMONEY,
    @qty INT,
    @supplier VARCHAR(4) = NULL,
    @available CHAR(1) = '1'
AS
BEGIN
    INSERT INTO product(
        product_name, 
        product_type, 
        product_description,
        product_cost_price,
        product_sale_price,
        product_quantity,
        product_supplier,
        product_available
    )
    VALUES (
        @name,
        @type,
        @desc,
        @cp,
        @sp,
        @qty,
        @supplier,
        @available
    );
    
    SELECT SCOPE_IDENTITY() AS product_id;
END
GO
CREATE OR ALTER PROCEDURE CreateBill
    @cashier_id VARCHAR(4),
    @customer_id VARCHAR(4) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @new_bill_id VARCHAR(9);
    
    -- Generate bill ID with proper zero-padding
    SELECT @new_bill_id = 'B' + RIGHT('00000000' + 
        CAST(
            ISNULL(
                MAX(CAST(SUBSTRING(bill_id, 2, 8) AS INT)), 
                0
            ) + 1 
        AS VARCHAR(8)), 
        8)
    FROM bill_header;
    
    -- Insert new bill
    INSERT INTO bill_header (bill_id, cashier_id, customer_id)
    VALUES (@new_bill_id, @cashier_id, @customer_id);
    
    SELECT @new_bill_id AS bill_id;
END
GO
CREATE OR ALTER PROCEDURE CreateBill
    @cashier_id VARCHAR(4),
    @customer_id VARCHAR(4) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @new_bill_id VARCHAR(9);
    
    SELECT @new_bill_id = 'B' + RIGHT('00000000' + 
        CAST(
            ISNULL(
                MAX(CAST(SUBSTRING(bill_id, 2, 8) AS INT)), 
                0
            ) + 1 
        AS VARCHAR(8)), 
        8)
    FROM bill_header;
    
    INSERT INTO bill_header (bill_id, cashier_id, customer_id)
    VALUES (@new_bill_id, @cashier_id, @customer_id);
    
    SELECT @new_bill_id AS bill_id;
END