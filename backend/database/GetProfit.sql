CREATE PROCEDURE GetProfit
AS
BEGIN
    SET NOCOUNT ON;

    -- Calculate total sales from bills
    DECLARE @total_sales DECIMAL(18,2) = (
        SELECT ISNULL(SUM(total_amount), 0)
        FROM bills
        WHERE status = 'paid'
    );

    -- Calculate total expenses
    DECLARE @total_expenses DECIMAL(18,2) = (
        SELECT ISNULL(SUM(amount), 0)
        FROM expenses
    );

    -- Calculate net profit
    DECLARE @net_profit DECIMAL(18,2) = @total_sales - @total_expenses;

    -- Return the results
    SELECT 
        @total_sales AS total_sales,
        @total_expenses AS total_expenses,
        @net_profit AS net_profit;
END 