USE [VERSION_1];
GO

-- Disable constraints temporarily
EXEC sp_msforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

-- 1. Insert 10 Employees
INSERT INTO employee (employee_name, employee_cnic, employee_salary, employee_contact_no, employee_email, employee_designation, employee_address, employee_available)
VALUES
('Ali Khan', 3520112345671, 45000, '03001234567', 'ali.khan@company.com', 'Manager', 'House 1, Street 5, Islamabad', 1),
('Sara Ahmed', 3520112345672, 35000, '03001234568', 'sara.ahmed@company.com', 'Cashier', 'Flat 3, Sector F-7, Islamabad', 1),
('Ahmed Raza', 3520112345673, 32000, '03001234569','helloworld@gmail.com', 'Store Keeper', 'Street 8, Bahria Town, Rawalpindi', 1),
('Fatima Malik', 3520112345674, 38000, '03001234570', 'fatima.malik@company.com', 'Cashier', 'House 45, G-9/4, Islamabad', 1),
('Zainab Iqbal', 3520112345675, 42000, '03001234571', 'zainab@company.com', 'Assistant Manager', 'Sector I-8/3, Islamabad', 1),
('Usman Khan', 3520112345676, 30000, '03001234572', 'bonga@gmail.com', 'Security Supervisor', 'Street 1, DHA Phase 2, Islamabad', 1),
('Hina Shah', 3520112345677, 32000, '03001234573', 'hina.shah@company.com', 'Cashier', 'Flat 402, Blue Area, Islamabad', 1),
('Bilal Abbas', 3520112345678, 28000, '03001234574', 'saad@velo.com', 'Cleaner', 'House 78, PWD Colony, Islamabad', 1),
('Ayesha Khan', 3520112345679, 36000, '03001234575', 'ayesha@company.com', 'Inventory Manager', 'Sector F-11/2, Islamabad', 1),
('Omar Sultan', 3520112345680, 40000, '03001234576', 'omar.s@company.com', 'IT Manager', 'Street 9, Chaklala Scheme, Rawalpindi', 1);
GO

-- 2. Insert 5 Suppliers
INSERT INTO supplier (supplier_name, supplier_contact_no, supplier_email, supplier_address, supplier_available)
VALUES
('Karachi Electronics', '02134567890', 'sales@karachielec.com', 'ST-14, Industrial Area, Karachi', 1),
('Lahore Textiles', '04237894561', 'info@lahoretext.com', '45-Main Boulevard, Lahore', 1),
('Islamabad Foods', '05123456789', NULL, 'Sector I-9/3, Islamabad', 1),
('Peshawar Hardware', '09156789012', 'contact@peshawarhardware.pk', 'Jamrud Road, Peshawar', 1),
('Multan Stationery', '06145678901', 'orders@multanstationery.com', 'Bosan Road, Multan', 1);
GO

-- 3. Insert 20 Customers
INSERT INTO costumer (costumer_name, costumer_contact_no, costumer_email, costumer_address, costumer_available)
VALUES
('Ahmed Raza', '03001112233', 'ahmed.raza@email.com', 'House 12, Street 7, Islamabad', 1),
('Fatima Ali', '03001112234', 'fa@gmail.com', 'Flat 5, Sector F-8, Islamabad', 1),
('Bilal Ahmed', '03001112235', 'bilal.a@email.com', 'Street 3, Bahria Town, Rawalpindi', 1),
('Sana Khan', '03001112236', 'sana.k@email.com', 'House 45, G-10/4, Islamabad', 1),
('Usman Malik', '03001112237', 'f@gmail.com', 'Sector I-8/1, Islamabad', 1),
('Zainab Akhtar', '03001112238', 'zainab@email.com', 'Street 9, DHA Phase 1, Islamabad', 1),
('Ali Hassan', '03001112239', 'ali.h@email.com', 'Flat 12, Blue Area, Islamabad', 1),
('Hira Shah', '03001112240', 'fdc@gmail.com', 'House 78, PWD Colony, Islamabad', 1),
('Omar Farooq', '03001112241', 'omar.f@email.com', 'Sector F-11/3, Islamabad', 1),
('Ayesha Riaz', '03001112242', 'ayesha.r@email.com', 'Street 5, Chaklala Scheme, Rawalpindi', 1),
('Kamran Ali', '03001112243', 'faaa@gmail.com', 'ST-8, Industrial Area, Karachi', 1),
('Sadia Ahmed', '03001112244', 'sadia.a@email.com', '45-Main Market, Lahore', 1),
('Farhan Malik', '03001112245', 'fty@gmail.com', 'Sector I-9/1, Islamabad', 1),
('Nadia Khan', '03001112246', 'nadia.k@email.com', 'Jamrud Road, Peshawar', 1),
('Tariq Mahmood', '03001112247', 'faty@gmail.com', 'Bosan Road, Multan', 1),
('Saima Akram', '03001112248', 'saima.a@email.com', 'House 34, Street 9, Islamabad', 1),
('Imran Siddique', '03001112249', 'foster@gmail.com', 'Flat 8, Sector F-7, Islamabad', 1),
('Fariha Rizwan', '03001112250', 'fariha@email.com', 'Street 2, Bahria Town, Rawalpindi', 1),
('Nasir Hussain', '03001112251', 'faster@gmail.com', 'G-10/2, Islamabad', 1),
('Amina Sheikh', '03001112252', 'amina.s@email.com', 'Sector I-8/4, Islamabad', 1);
GO

-- 4. Insert 20 Products
INSERT INTO product (product_name, product_type, product_description, product_cost_price, product_sale_price, product_quantity, product_supplier, product_available, min_stock, max_stock)
VALUES
('LED TV 55"', 'Electronics', '4K Smart LED Television', 80000, 120000, 5, 'S001', 1, 10, 50),
('Rice 5kg', 'Groceries', 'Basmati Rice Premium Quality', 1500, 2000, 18, 'S003', 1, 20, 100),
('Office Chair', 'Furniture', 'Ergonomic Office Chair', 7500, 12000, 8, 'S004', 1, 5, 30),
('Notebook Set', 'Stationery', '10-Pack A4 Notebooks', 600, 1000, 45, 'S005', 1, 50, 200),
('Wireless Mouse', 'Electronics', 'Bluetooth Optical Mouse', 1200, 2000, 12, 'S001', 1, 15, 60),
('Olive Oil 1L', 'Groceries', 'Extra Virgin Olive Oil', 1800, 2500, 22, 'S003', 1, 25, 80),
('Steel Cabinet', 'Furniture', '2-Drawer Steel Filing Cabinet', 9500, 15000, 3, 'S004', 1, 5, 20),
('Ballpoint Pen', 'Stationery', 'Pack of 12 Blue Pens', 300, 500, 80, 'S005', 1, 100, 400),
('Bluetooth Speaker', 'Electronics', 'Portable 20W Speaker', 4500, 7000, 15, 'S001', 1, 10, 40),
('Wheat Flour 10kg', 'Groceries', 'Fine Ground Wheat Flour', 1200, 1800, 28, 'S003', 1, 30, 120),
('Desk Lamp', 'Furniture', 'Adjustable LED Desk Lamp', 1500, 2500, 9, 'S004', 1, 10, 35),
('Sticky Notes', 'Stationery', 'Pack of 5 Color Pads', 250, 400, 65, 'S005', 1, 80, 300),
('Earphones', 'Electronics', 'Wired Stereo Earphones', 800, 1500, 20, 'S001', 1, 25, 75),
('Sugar 5kg', 'Groceries', 'Refined White Sugar', 1300, 1900, 35, 'S003', 1, 40, 150),
('Bookshelf', 'Furniture', '3-Tier Wooden Bookshelf', 12000, 18000, 4, 'S004', 1, 5, 15),
('Highlighters', 'Stationery', 'Assorted Color Pack', 400, 700, 55, 'S005', 1, 60, 250),
('Tablet PC', 'Electronics', '10" Android Tablet', 25000, 35000, 7, 'S001', 1, 8, 25),
('Lentils 2kg', 'Groceries', 'Premium Masoor Dal', 600, 900, 40, 'S003', 1, 50, 180),
('Folding Table', 'Furniture', 'Plastic Foldable Table', 3000, 5000, 6, 'S004', 1, 10, 30),
('Whiteboard Marker', 'Stationery', 'Pack of 6 Colors', 350, 600, 70, 'S005', 1, 90, 350);
GO

-- 5. Insert 10 Bills
INSERT INTO bill (bill_cashier, bill_costumer, is_completed)
VALUES
('E002', 'C001', 1),
('E004', 'C003', 1),
('E007', NULL, 1),
('E002', 'C005', 1),
('E004', 'C007', 1),
('E007', 'C009', 1),
('E002', NULL, 1),
('E004', 'C011', 1),
('E007', 'C013', 1),
('E002', 'C015', 1);
GO

-- 6. Insert Bill Logs
INSERT INTO bill_log (bill_id, product_id, quantity, unit_price)
VALUES
('B00000001', 'P00000001', 1, 120000),
('B00000001', 'P00000005', 2, 2000),
('B00000002', 'P00000003', 1, 12000),
('B00000003', 'P00000008', 5, 500),
('B00000003', 'P00000012', 3, 400),
('B00000004', 'P00000015', 1, 18000),
('B00000005', 'P00000018', 4, 900),
('B00000006', 'P00000020', 10, 600),
('B00000007', 'P00000010', 2, 1800),
('B00000007', 'P00000014', 1, 1900),
('B00000008', 'P00000006', 3, 2500),
('B00000009', 'P00000019', 2, 5000),
('B00000010', 'P00000017', 1, 35000);
GO

-- 7. Insert Expenses (10 from bills + 2 manual)
INSERT INTO expense (expense_type, expense_description, expense_price, expense_generation_employee)
VALUES
('Sale', 'Bill B00000001 Checkout', 124000, 'E002'),
('Sale', 'Bill B00000002 Checkout', 12000, 'E004'),
('Sale', 'Bill B00000003 Checkout', 3700, 'E007'),
('Sale', 'Bill B00000004 Checkout', 18000, 'E002'),
('Sale', 'Bill B00000005 Checkout', 3600, 'E004'),
('Sale', 'Bill B00000006 Checkout', 6000, 'E007'),
('Sale', 'Bill B00000007 Checkout', 5500, 'E002'),
('Sale', 'Bill B00000008 Checkout', 7500, 'E004'),
('Sale', 'Bill B00000009 Checkout', 10000, 'E007'),
('Sale', 'Bill B00000010 Checkout', 35000, 'E002'),
('Utilities', 'Monthly Electricity Bill', 45000, 'E001'),
('Maintenance', 'AC Servicing', 12000, 'E009');
GO

-- Re-enable constraints
EXEC sp_msforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
GO