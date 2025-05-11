-- Generate bill
go
CREATE PROCEDURE CreateNewBill
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO bill DEFAULT VALUES;
    SELECT SCOPE_IDENTITY() AS bill_id;  -- returns the new bill ID
END
go
CREATE PROCEDURE AddProductToBill
    @billID INT,
    @productID INT,
    @quantity INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO bill_detail (bill_id, product_id, quantity)
    VALUES (@billID, @productID, @quantity);
END
go
CREATE OR ALTER PROCEDURE CheckoutBill
    @billID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    -- Calculate total directly
    SELECT 
        SUM(product_price * product_quantity) AS total_amount
    FROM bill
    WHERE bill_id = @billID;
END;



-- Add customer
go
CREATE PROCEDURE AddCustomer
    @name VARCHAR(64),
    @contact CHAR(11),
    @email VARCHAR(128),
    @address VARCHAR(256),
    @available CHAR(1)
AS
BEGIN
    INSERT INTO costumer(costumer_name, costumer_contact_no, costumer_email, costumer_address, costumer_available)
    VALUES (@name, @contact, @email, @address, @available);
END

-- View profile (self)
go
CREATE PROCEDURE ViewProfile
    @employeeId VARCHAR(4)
AS
BEGIN
    SELECT * FROM employee WHERE employee_id = @employeeId;
END

-- Edit profile

go
CREATE PROCEDURE EditProfile
    @employeeId VARCHAR(4),
    @contact CHAR(11),
    @email VARCHAR(128),
    @address VARCHAR(256)
AS
BEGIN
    UPDATE employee
    SET employee_contact_no = @contact,
        employee_email = @email,
        employee_address = @address
    WHERE employee_id = @employeeId;
END

Exec CreateNewBill