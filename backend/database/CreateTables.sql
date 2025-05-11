-- Create bills table
CREATE TABLE bills (
    id INT IDENTITY(1,1) PRIMARY KEY,
    total_amount DECIMAL(18,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Create expenses table
CREATE TABLE expenses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    amount DECIMAL(18,2) NOT NULL,
    description VARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
); 