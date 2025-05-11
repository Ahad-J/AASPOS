USE VERSION_1;
GO

CREATE OR ALTER PROCEDURE CreateBill
    @cashierId VARCHAR(4)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
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