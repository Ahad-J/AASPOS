USE VERSION_1;
GO

-- Drop existing tables if they exist
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[bill_log]') AND type in (N'U'))
    DROP TABLE [dbo].[bill_log];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[bill]') AND type in (N'U'))
    DROP TABLE [dbo].[bill];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[bill_header]') AND type in (N'U'))
    DROP TABLE [dbo].[bill_header];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[bill_items]') AND type in (N'U'))
    DROP TABLE [dbo].[bill_items];

-- Create the main bill table
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

-- Create the bill log table
CREATE TABLE bill_log (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    bill_id VARCHAR(9) NOT NULL,
    product_id VARCHAR(9) NOT NULL,
    quantity INT CHECK(quantity > 0) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    added_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (bill_id) REFERENCES bill(bill_id) ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON UPDATE CASCADE
);

-- Drop existing CreateBill procedure if it exists
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'CreateBill')
    DROP PROCEDURE CreateBill;
GO

-- Create the CreateBill procedure
CREATE PROCEDURE CreateBill
    @cashierId VARCHAR(4)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Verify employee exists and is available
        IF NOT EXISTS (SELECT 1 FROM employee WHERE employee_id = @cashierId AND employee_available = '1')
            THROW 50001, 'Employee not found or not available', 1;
            
        -- Verify employee is a cashier or manager
        IF NOT EXISTS (SELECT 1 FROM users WHERE employee_id = @cashierId AND role IN ('cashier', 'manager'))
            THROW 50002, 'Employee is not authorized to create bills', 1;
            
        BEGIN TRANSACTION;
            -- Insert new bill
            INSERT INTO bill (bill_cashier) 
            VALUES (@cashierId);
            
            -- Get the generated bill_id
            SELECT bill_id 
            FROM bill WITH (NOLOCK)
            WHERE b_id = SCOPE_IDENTITY();
            
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END;
GO 