-- Add employee
CREATE PROCEDURE AddEmployee
    @name VARCHAR(64),
    @cnic BIGINT,
    @salary SMALLMONEY,
    @contact CHAR(11),
    @email VARCHAR(128),
    @designation VARCHAR(64),
    @address VARCHAR(256),
    @available CHAR(1)
AS
BEGIN
    INSERT INTO employee(employee_name, employee_cnic, employee_salary, employee_contact_no, employee_email, employee_designation, employee_address, employee_available)
    VALUES (@name, @cnic, @salary, @contact, @email, @designation, @address, @available);
END

-- View employee
go
CREATE PROCEDURE ViewEmployees
AS BEGIN
    SELECT * FROM employee;
END

-- View customers
go
CREATE PROCEDURE ViewCustomers
AS BEGIN
    SELECT * FROM costumer;
END

-- View inventory (products)
go
CREATE PROCEDURE ViewInventory
AS BEGIN
    SELECT * FROM product;
END

-- View expenses
go
CREATE PROCEDURE ViewExpenses
AS BEGIN
    SELECT * FROM expense;
END

-- View profit: +ive sales - expenses
go
CREATE PROCEDURE GetProfit
AS BEGIN
    DECLARE @salesTotal MONEY, @expenseTotal MONEY;
    SELECT @salesTotal = SUM(product_price * product_quantity) FROM bill;
    SELECT @expenseTotal = SUM(expense_price) FROM expense;
    SELECT @salesTotal - @expenseTotal AS NetProfit;
END

-- View suppliers
go
CREATE PROCEDURE ViewSuppliers
AS BEGIN
    SELECT * FROM supplier;
END
