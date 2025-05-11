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
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validate required fields
        IF @name IS NULL OR @type IS NULL OR @cp IS NULL OR @sp IS NULL OR @qty IS NULL
        BEGIN
            RAISERROR('Name, type, cost price, sale price, and quantity are required fields', 16, 1);
            RETURN;
        END
        
        -- Validate price ranges
        IF @cp <= 0 OR @sp <= 0
        BEGIN
            RAISERROR('Prices must be positive values', 16, 1);
            RETURN;
        END
        
        -- Validate quantity
        IF @qty < 0
        BEGIN
            RAISERROR('Quantity cannot be negative', 16, 1);
            RETURN;
        END
        
        -- Insert the product
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
        
        -- Return the new product ID
        SELECT SCOPE_IDENTITY() AS product_id;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END

go
CREATE OR ALTER PROCEDURE AddSupplier
    @name VARCHAR(64),
    @contact CHAR(11),
    @email VARCHAR(128),
    @address VARCHAR(256),
    @available CHAR(1) = '1'  -- Default value added
AS
BEGIN
    INSERT INTO supplier(
        supplier_name, 
        supplier_contact_no, 
        supplier_email, 
        supplier_address, 
        supplier_available
    )
    VALUES (
        @name, 
        @contact, 
        @email, 
        @address, 
        @available
    );
	SELECT SCOPE_IDENTITY() AS supplier_id;
END

use VERSION_1
CREATE TABLE bill_header (
    bill_id VARCHAR(9) PRIMARY KEY,
    bill_date DATETIME DEFAULT GETDATE(),
    cashier_id VARCHAR(4) NOT NULL,
    customer_id VARCHAR(4),
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20),
    FOREIGN KEY (cashier_id) REFERENCES employee(employee_id),
    FOREIGN KEY (customer_id) REFERENCES costumer(costumer_id)
);

CREATE TABLE bill_items (
    bill_id VARCHAR(9),
    product_id VARCHAR(9),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (bill_id, product_id),
    FOREIGN KEY (bill_id) REFERENCES bill_header(bill_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

go
CREATE or alter PROCEDURE CreateBillHeader
    @cashier_id VARCHAR(4),
    @customer_id VARCHAR(4) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @new_bill_id VARCHAR(9);

    -- Generate unique bill ID, e.g., B000001
    SELECT @new_bill_id = 'B' + RIGHT('000000' + CAST(ISNULL(MAX(CAST(SUBSTRING(bill_id, 2, 6) AS INT)), 0) + 1 AS VARCHAR), 6)
    FROM bill_header;

    -- Insert new bill
    INSERT INTO bill_header (bill_id, cashier_id, customer_id)
    VALUES (@new_bill_id, @cashier_id, @customer_id);

    SELECT @new_bill_id AS bill_id;
END

go
CREATE PROCEDURE AddBillItem
    @bill_id VARCHAR(9),
    @product_id VARCHAR(9),
    @quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check product availability
        DECLARE @available_qty INT, @price DECIMAL(10,2);
        SELECT @available_qty = product_quantity, @price = product_sale_price 
        FROM product 
        WHERE product_id = @product_id AND product_available = '1';
        
        IF @available_qty IS NULL
            THROW 50001, 'Product not available', 1;
        IF @available_qty < @quantity
            THROW 50002, 'Insufficient stock', 1;
        
        -- Add item to bill
        INSERT INTO bill_items (bill_id, product_id, quantity, unit_price, line_total)
        VALUES (@bill_id, @product_id, @quantity, @price, @quantity * @price);
        
        -- Update inventory
        UPDATE product 
        SET product_quantity = product_quantity - @quantity
        WHERE product_id = @product_id;
        
        -- Update bill totals
        UPDATE bh
        SET 
            subtotal = (SELECT SUM(line_total) FROM bill_items WHERE bill_id = @bill_id),
            total = (SELECT SUM(line_total) FROM bill_items WHERE bill_id = @bill_id)
        FROM bill_header bh
        WHERE bh.bill_id = @bill_id;
        
        COMMIT TRANSACTION;
        
        SELECT 'Item added successfully' AS message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
go
CREATE PROCEDURE CompleteSale
    @bill_id VARCHAR(9),
    @payment_method VARCHAR(20) = 'Cash'
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Verify bill exists and has items
    IF NOT EXISTS (SELECT 1 FROM bill_header WHERE bill_id = @bill_id)
        THROW 50003, 'Bill not found', 1;
        
    IF NOT EXISTS (SELECT 1 FROM bill_items WHERE bill_id = @bill_id)
        THROW 50004, 'Bill has no items', 1;
    
    -- Update payment method
    UPDATE bill_header
    SET payment_method = @payment_method
    WHERE bill_id = @bill_id;
    
    -- Return receipt data
    SELECT 
        bh.bill_id,
        bh.bill_date,
        e.employee_name AS cashier,
        c.costumer_name AS customer,
        bh.subtotal,
        bh.tax,
        bh.discount,
        bh.total,
        bh.payment_method
    FROM bill_header bh
    JOIN employee e ON bh.cashier_id = e.employee_id
    LEFT JOIN costumer c ON bh.customer_id = c.costumer_id
    WHERE bh.bill_id = @bill_id;
    
    SELECT 
        p.product_name,
        bi.quantity,
        bi.unit_price,
        bi.line_total
    FROM bill_items bi
    JOIN product p ON bi.product_id = p.product_id
    WHERE bi.bill_id = @bill_id;
END