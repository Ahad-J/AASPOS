CREATE or alter PROCEDURE AddSupplier
    @name VARCHAR(64),
    @contact CHAR(11),
    @email VARCHAR(128),
    @address VARCHAR(256),
    @available CHAR(1) = '1',
    @newSupplierId INT OUTPUT
AS
BEGIN
    INSERT INTO supplier (
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
    )
    
    SET @newSupplierId = SCOPE_IDENTITY()
END