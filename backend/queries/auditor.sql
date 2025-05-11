-- Add product
go
CREATE or alter PROCEDURE AddProduct
    @name VARCHAR(128),
    @type VARCHAR(128),
    @desc VARCHAR(512),
    @cp SMALLMONEY,
    @sp SMALLMONEY,
    @qty INT,
    @supplier VARCHAR(4),
    @available CHAR(1)
AS
BEGIN
    INSERT INTO product(product_name, product_type, product_description, product_cost_price, product_sale_price, product_quantity, product_supplier, product_available)
    VALUES (@name, @type, @desc, @cp, @sp, @qty, @supplier, @available);
END

-- Remove product
go
CREATE or alter PROCEDURE RemoveProduct
    @productId VARCHAR(9)
AS
BEGIN
    DELETE FROM product WHERE product_id = @productId;
END

-- Add supplier
go
CREATE or alter PROCEDURE AddSupplier
    @name VARCHAR(64),
    @contact CHAR(11),
    @email VARCHAR(128),
    @address VARCHAR(256),
    @available CHAR(1)
AS
BEGIN
    INSERT INTO supplier(supplier_name, supplier_contact_no, supplier_email, supplier_address, supplier_available)
    VALUES (@name, @contact, @email, @address, @available);
END

-- Remove supplier
go
CREATE or alter PROCEDURE RemoveSupplier
    @supplierId VARCHAR(4)
AS
BEGIN
    DELETE FROM supplier WHERE supplier_id = @supplierId;
END

-- Update product
go
CREATE or alter PROCEDURE UpdateProduct
    @productId VARCHAR(9),
    @qty INT,
    @cp SMALLMONEY,
    @sp SMALLMONEY
AS
BEGIN
    UPDATE product
    SET product_quantity = @qty,
        product_cost_price = @cp,
        product_sale_price = @sp
    WHERE product_id = @productId;
END

-- Remove customer
go
CREATE PROCEDURE RemoveCustomer
    @customerId VARCHAR(4)
AS
BEGIN
    DELETE FROM costumer WHERE costumer_id = @customerId;
END
