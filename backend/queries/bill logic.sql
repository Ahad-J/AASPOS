--------use version_1
--------go
---------- 1. Procedure to Initialize a New Bill
--------CREATE PROCEDURE InitializeBill
--------    @cashier_id VARCHAR(4),
--------    @customer_id VARCHAR(4) = NULL
--------AS
--------BEGIN
--------    SET NOCOUNT ON;
--------    BEGIN TRY
--------        BEGIN TRANSACTION;

--------        -- Validate cashier
--------        IF NOT EXISTS (
--------            SELECT 1 FROM employee 
--------            WHERE employee_id = @cashier_id 
--------            AND employee_available = 1
--------        )
--------        BEGIN
--------            RAISERROR('Invalid or inactive cashier', 16, 1);
--------            RETURN;
--------        END;

--------        -- Validate customer if provided
--------        IF @customer_id IS NOT NULL AND NOT EXISTS (
--------            SELECT 1 FROM costumer 
--------            WHERE costumer_id = @customer_id 
--------            AND costumer_available = 1
--------        )
--------        BEGIN
--------            RAISERROR('Invalid or inactive customer', 16, 1);
--------            RETURN;
--------        END;

--------        -- Create new bill
--------        INSERT INTO bill (bill_cashier, bill_costumer)
--------        VALUES (@cashier_id, @customer_id);

--------        -- Return generated bill ID
--------        SELECT 
--------            bill_id AS new_bill_id,
--------            created_at AS bill_timestamp,
--------            @cashier_id AS cashier_id,
--------            @customer_id AS customer_id
--------        FROM bill
--------        WHERE b_id = SCOPE_IDENTITY();

--------        COMMIT TRANSACTION;
--------    END TRY
--------    BEGIN CATCH
--------        IF @@TRANCOUNT > 0
--------            ROLLBACK TRANSACTION;
        
--------        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
--------        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
--------        DECLARE @ErrorState INT = ERROR_STATE();
        
--------        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
--------    END CATCH
--------END;
-------- 2. Procedure to Add Product to Bill
------CREATE or alter PROCEDURE AddProductToBill
------    @bill_id VARCHAR(9),
------    @product_id VARCHAR(9),
------    @quantity INT
------AS
------BEGIN
------    SET NOCOUNT ON;
------    BEGIN TRY
------        BEGIN TRANSACTION;

------        -- Validate bill
------        IF NOT EXISTS (
------            SELECT 1 FROM bill 
------            WHERE bill_id = @bill_id 
------            AND is_completed = 0
------        )
------        BEGIN
------            RAISERROR('Invalid or completed bill', 16, 1);
------            RETURN;
------        END;

------        -- Validate product
------        IF NOT EXISTS (
------            SELECT 1 FROM product 
------            WHERE product_id = @product_id 
------            AND product_available = 1
------        )
------        BEGIN
------            RAISERROR('Invalid or inactive product', 16, 1);
------            RETURN;
------        END;

------        -- Validate quantity
------        IF @quantity <= 0
------        BEGIN
------            RAISERROR('Quantity must be positive', 16, 1);
------            RETURN;
------        END;

------        -- Get current price
------        DECLARE @unit_price DECIMAL(10,2);
------        SELECT @unit_price = product_sale_price 
------        FROM product 
------        WHERE product_id = @product_id;

------        -- Update or insert product in bill
------        IF EXISTS (
------            SELECT 1 FROM bill_log 
------            WHERE bill_id = @bill_id 
------            AND product_id = @product_id
------        )
------        BEGIN
------            UPDATE bill_log
------            SET quantity += @quantity
------            WHERE bill_id = @bill_id
------            AND product_id = @product_id;
------        END
------        ELSE
------        BEGIN
------            INSERT INTO bill_log (bill_id, product_id, quantity, unit_price)
------            VALUES (@bill_id, @product_id, @quantity, @unit_price);
------        END;

------        -- Return updated bill details
------        SELECT 
------            bl.product_id,
------            p.product_name,
------            bl.quantity,
------            bl.unit_price,
------            (bl.quantity * bl.unit_price) AS total_price
------        FROM bill_log bl
------        INNER JOIN product p ON bl.product_id = p.product_id
------        WHERE bl.bill_id = @bill_id;

------        COMMIT TRANSACTION;
------    END TRY
------    BEGIN CATCH
------        IF @@TRANCOUNT > 0
------            ROLLBACK TRANSACTION;
        
------        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
------        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
------        DECLARE @ErrorState INT = ERROR_STATE();
        
------        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
------    END CATCH
------END;
------ 3. Procedure to Checkout Bill (Updated)
----CREATE or alter PROCEDURE CheckoutBill
----    @bill_id VARCHAR(9)
----AS
----BEGIN
----    SET NOCOUNT ON;
----    BEGIN TRY
----        BEGIN TRANSACTION;

----        -- Validate bill
----        IF NOT EXISTS (
----            SELECT 1 FROM bill 
----            WHERE bill_id = @bill_id 
----            AND is_completed = 0
----        )
----        BEGIN
----            RAISERROR('Invalid or completed bill', 16, 1);
----            RETURN;
----        END;

----        -- Check stock availability
----        IF EXISTS (
----            SELECT 1
----            FROM bill_log bl
----            INNER JOIN product p ON bl.product_id = p.product_id
----            WHERE bl.bill_id = @bill_id
----            AND p.product_quantity < bl.quantity
----        )
----        BEGIN
----            RAISERROR('Insufficient stock for one or more products', 16, 1);
----            RETURN;
----        END;

----        -- Calculate total and get transaction details
----        DECLARE @total DECIMAL(10,2),
----                @cashier_id VARCHAR(4),
----                @customer_id VARCHAR(4);

----        SELECT 
----            @total = SUM(bl.quantity * bl.unit_price),
----            @cashier_id = b.bill_cashier,
----            @customer_id = b.bill_costumer
----        FROM bill_log bl
----        INNER JOIN bill b ON bl.bill_id = b.bill_id
----        WHERE bl.bill_id = @bill_id
----        GROUP BY b.bill_cashier, b.bill_costumer;

----        -- Record transaction
----        INSERT INTO expense (
----            expense_type,
----            expense_description,
----            expense_price,
----            expense_generation_employee
----        )
----        VALUES (
----            'Sale',
----            'Bill checkout: ' + @bill_id,
----            @total,
----            @cashier_id
----        );

----        -- Update inventory
----        UPDATE p
----        SET product_quantity -= bl.quantity
----        FROM product p
----        INNER JOIN bill_log bl ON p.product_id = bl.product_id
----        WHERE bl.bill_id = @bill_id;

----        -- Mark bill complete
----        UPDATE bill
----        SET is_completed = 1
----        WHERE bill_id = @bill_id;

----        -- Return final receipt
----        SELECT
----            @bill_id AS bill_id,
----            @total AS total_amount,
----            @customer_id AS customer_id,
----            GETDATE() AS checkout_time,
----            bl.product_id,
----            p.product_name,
----            bl.quantity,
----            bl.unit_price,
----            (bl.quantity * bl.unit_price) AS line_total
----        FROM bill_log bl
----        INNER JOIN product p ON bl.product_id = p.product_id
----        WHERE bl.bill_id = @bill_id;

----        COMMIT TRANSACTION;
----    END TRY
----    BEGIN CATCH
----        IF @@TRANCOUNT > 0
----            ROLLBACK TRANSACTION;
        
----        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
----        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
----        DECLARE @ErrorState INT = ERROR_STATE();
        
----        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
----    END CATCH
----END;
---- 1. Procedure to Initialize a New Bill
--CREATE OR ALTER PROCEDURE InitializeBill
--    @cashier_id VARCHAR(4),
--    @customer_id VARCHAR(4) = NULL
--AS
--BEGIN
--    SET NOCOUNT ON;
--    BEGIN TRY
--        BEGIN TRANSACTION;

--        -- Validate employee (both managers and cashiers can initialize bills)
--        IF NOT EXISTS (
--            SELECT 1 FROM employee e
--            JOIN USERS u ON e.employee_id = u.employee_id
--            WHERE e.employee_id = @cashier_id 
--            AND e.employee_available = 1
--            AND u.role IN ('Manager', 'Cashier')
--        )
--        BEGIN
--            RAISERROR('Invalid or inactive employee', 16, 1);
--            RETURN;
--        END;

--        -- Validate customer if provided
--        IF @customer_id IS NOT NULL AND NOT EXISTS (
--            SELECT 1 FROM costumer 
--            WHERE costumer_id = @customer_id 
--            AND costumer_available = 1
--        )
--        BEGIN
--            RAISERROR('Invalid or inactive customer', 16, 1);
--            RETURN;
--        END;

--        -- Create new bill
--        INSERT INTO bill (bill_cashier, bill_costumer)
--        VALUES (@cashier_id, @customer_id);

--        -- Return generated bill ID
--        SELECT 
--            bill_id AS new_bill_id,
--            created_at AS bill_timestamp,
--            @cashier_id AS cashier_id,
--            @customer_id AS customer_id
--        FROM bill
--        WHERE b_id = SCOPE_IDENTITY();

----        COMMIT TRANSACTION;
----    END TRY
----    BEGIN CATCH
----        IF @@TRANCOUNT > 0
----            ROLLBACK TRANSACTION;
        
----        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
----        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
----        DECLARE @ErrorState INT = ERROR_STATE();
        
----        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
----    END CATCH
----END;
----go
--USE VERSION_1;
--GO

--CREATE OR ALTER PROCEDURE CreateBill
--    @cashierId VARCHAR(4)
--AS
--BEGIN
--    SET NOCOUNT ON;
    
--    BEGIN TRY
--        BEGIN TRANSACTION;
--            -- Insert new bill
--            INSERT INTO bill (bill_cashier) 
--            VALUES (@cashierId);
            
--            -- Get the generated bill_id
--            SELECT bill_id 
--            FROM bill WITH (NOLOCK)
--            WHERE b_id = SCOPE_IDENTITY();
            
--        COMMIT TRANSACTION;
--    END TRY
--    BEGIN CATCH
--        IF @@TRANCOUNT > 0
--            ROLLBACK TRANSACTION;
            
--        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
--        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
--        DECLARE @ErrorState INT = ERROR_STATE();
        
--        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
--    END CATCH;
--END;
--GO 
select *
from bill_log