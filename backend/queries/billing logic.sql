-- Updated bill table with consistent column lengths
CREATE TABLE bill (
    b_id INT IDENTITY(1,1),
    bill_id AS 'B' + RIGHT('00000000' + CAST(b_id AS VARCHAR(8)), 8) PERSISTED,
    bill_cashier VARCHAR(4) NOT NULL,
    bill_costumer VARCHAR(4),
    created_at DATETIME DEFAULT GETDATE(),
    is_completed BIT DEFAULT 0,
    PRIMARY KEY (bill_id),
    FOREIGN KEY (bill_cashier) REFERENCES employee(employee_id) ON UPDATE CASCADE,
    FOREIGN KEY (bill_costumer) REFERENCES costumer(costumer_id) ON UPDATE CASCADE
);

-- Updated bill_log table with matching column lengths
CREATE TABLE bill_log (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    bill_id VARCHAR(9) NOT NULL,  -- Changed to VARCHAR(9) to match
    product_id VARCHAR(9) NOT NULL,
    quantity INT CHECK(quantity > 0) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    added_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (bill_id) REFERENCES bill(bill_id) ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON UPDATE CASCADE
);
go
-- CreateBill procedure
CREATE OR ALTER PROCEDURE CreateBill
    @cashier_id VARCHAR(4),
    @customer_id VARCHAR(4) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO bill (bill_cashier, bill_costumer)
    VALUES (@cashier_id, @customer_id);
    
    SELECT bill_id FROM bill WHERE b_id = SCOPE_IDENTITY();
END
GO

-- AddProductToBill procedure
CREATE OR ALTER PROCEDURE AddProductToBill
    @bill_id VARCHAR(9),  -- Changed to VARCHAR(9)
    @product_id VARCHAR(9),
    @quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @price DECIMAL(10,2), @current_stock INT;
        SELECT @price = product_sale_price, @current_stock = product_quantity
        FROM product 
        WHERE product_id = @product_id AND product_available = '1';
        
        IF @price IS NULL
            THROW 50001, 'Product not available', 1;
        IF @current_stock < @quantity
            THROW 50002, 'Insufficient stock', 1;
        
        INSERT INTO bill_log (bill_id, product_id, quantity, unit_price)
        VALUES (@bill_id, @product_id, @quantity, @price);
        
        UPDATE product SET product_quantity = product_quantity - @quantity
        WHERE product_id = @product_id;
        
        COMMIT TRANSACTION;
        SELECT 'Product added successfully' AS message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- CheckoutBill procedure
CREATE OR ALTER PROCEDURE CheckoutBill
    @bill_id VARCHAR(9),
    @cashier_id VARCHAR(4)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Check if bill exists and is active
        IF NOT EXISTS (SELECT 1 FROM bill WHERE bill_id = @bill_id AND is_completed = 0)
        BEGIN
            RAISERROR('No active bill to checkout.', 16, 1);
            RETURN;
        END
        
        BEGIN TRANSACTION;
        -- Rest of your existing procedure...
        
        DECLARE @total DECIMAL(10,2);
        SELECT @total = SUM(quantity * unit_price)
        FROM bill_log 
        WHERE bill_id = @bill_id;
        
        INSERT INTO expense (
            expense_type, 
            expense_description, 
            expense_price, 
            expense_generation_employee
        )
        VALUES (
            'Sale', 
            'Bill ID: ' + @bill_id, 
            @total, 
            @cashier_id
        );
        
        UPDATE bill SET is_completed = 1 WHERE bill_id = @bill_id;
        
        SELECT 
            b.bill_id,
            b.created_at AS bill_date,
            e.employee_name AS cashier,
            c.costumer_name AS customer,
            @total AS total_amount
        FROM bill b
        JOIN employee e ON b.bill_cashier = e.employee_id
        LEFT JOIN costumer c ON b.bill_costumer = c.costumer_id
        WHERE b.bill_id = @bill_id;
        
        SELECT 
            p.product_name,
            bl.quantity,
            bl.unit_price,
            (bl.quantity * bl.unit_price) AS line_total
        FROM bill_log bl
        JOIN product p ON bl.product_id = p.product_id
        WHERE bl.bill_id = @bill_id;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO