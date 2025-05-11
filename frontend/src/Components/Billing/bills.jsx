import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Bills = () => {
    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch bills from API
    const fetchBills = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("http://localhost:3000/api/manager/view-bills");
            const data = await response.json();

            if (!data.data) throw new Error("Invalid data format");

            console.log("Fetched bills:", data.data); // Debug log
            setBills(data.data);
        } catch (error) {
            console.error("Error fetching bills:", error);
            setError("Failed to load bills");
            setBills([]); // Optional fallback
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and setup refresh interval
    useEffect(() => {
        fetchBills();
        
        // Refresh every 5 seconds
        const interval = setInterval(fetchBills, 5000);
        
        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    // Handle card click to show detailed view
    const handleCardClick = (bill) => {
        setSelectedBill(bill);
        setShowDetail(true);
    };

    // Close detailed view
    const handleCloseDetail = () => {
        setSelectedBill(null);
        setShowDetail(false);
    };

    // Calculate summary metrics
    const totalSales = bills.reduce((sum, bill) => sum + (parseFloat(bill.total) || 0), 0);
    const averageBillAmount = bills.length > 0 ? (totalSales / bills.length).toFixed(2) : 0.00;
    const highestBill = bills.length > 0 ? Math.max(...bills.map(bill => parseFloat(bill.total) || 0)) : 0.00;
    const salesByCashier = bills.reduce((acc, bill) => {
        acc[bill.cashierId] = (acc[bill.cashierId] || 0) + (parseFloat(bill.total) || 0);
        return acc;
    }, {});
    const latestBillDate = bills.length > 0 ? new Date(Math.max(...bills.map(bill => new Date(bill.date)))).toLocaleString() : "N/A";

    return (
        <Section>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {loading && <LoadingMessage>Loading bills...</LoadingMessage>}
            
            {!showDetail ? (
                <div className="split-container">
                    <div className="summary">
                        <h3>Billing Summary</h3>
                        <div className="stats">
                            <p><strong>Total Bills:</strong> {bills.length}</p>
                            <p><strong>Total Sales:</strong> ${totalSales.toFixed(2)}</p>
                            <p><strong>Average Bill Amount:</strong> ${averageBillAmount}</p>
                            <p><strong>Highest Single Bill:</strong> ${highestBill.toFixed(2)}</p>
                            <p><strong>Sales by Cashier:</strong></p>
                            <ul>
                                {Object.entries(salesByCashier).map(([cashierId, total]) => (
                                    <li key={cashierId}>{cashierId}: ${total.toFixed(2)}</li>
                                ))}
                            </ul>
                            <p><strong>Latest Bill Date:</strong> {latestBillDate}</p>
                        </div>
                    </div>
                    <div className="bills-list">
                        <div className="header">
                            <h2>Bills</h2>
                            <RefreshButton onClick={fetchBills} disabled={loading}>
                                Refresh
                            </RefreshButton>
                        </div>
                        <div className="grid">
                            {bills.map((bill) => (
                                <div className="card" key={bill.billId} onClick={() => handleCardClick(bill)}>
                                    <h3>Bill #{bill.billId}</h3>
                                    <p><strong>Cashier:</strong> {bill.cashierId}</p>
                                    <p><strong>Customer:</strong> {bill.customerId}</p>
                                    <p><strong>Date:</strong> {new Date(bill.date).toLocaleString()}</p>
                                    <p><strong>Total:</strong> ${(parseFloat(bill.total) || 0).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="detail-container">
                    <div className="detail-card">
                        <h2>Bill #{selectedBill.billId}</h2>
                        <p><strong>Cashier:</strong> {selectedBill.cashierId}</p>
                        <p><strong>Customer:</strong> {selectedBill.customerId}</p>
                        <p><strong>Date:</strong> {new Date(selectedBill.date).toLocaleString()}</p>
                        <h4>Products:</h4>
                        <div className="products-list">
                            {selectedBill.products.map((product, index) => (
                                <div key={index} className="product-item">
                                    <p>{product.name} - Qty: {product.quantity} - ${product.price.toFixed(2)} each - Subtotal: ${(product.quantity * product.price).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <p><strong>Total:</strong> ${(parseFloat(selectedBill.total) || 0).toFixed(2)}</p>
                        <button onClick={handleCloseDetail}>Close</button>
                    </div>
                </div>
            )}
        </Section>
    );
};

const Section = styled.section`
    padding: 2rem;
    background-color: #121212;

    .split-container {
        display: flex;
        height: calc(100vh - 4rem);
        gap: 2rem;
    }

    .summary {
        flex: 1;
        background-color: #1e1e1e;
        padding: 2rem;
        border-radius: 8px;
        color: #ffffff;
    }

    .bills-list {
        flex: 1;
        background-color: #1e1e1e;
        border-radius: 8px;
        padding: 1rem;
        overflow-y: auto;
    }

    .header {
        margin-bottom: 1rem;
    }

    h2 {
        margin-bottom: 1rem;
        color: #ffffff;
        font-size: 1.5rem;
    }

    h3 {
        margin-bottom: 1.5rem;
        font-size: 1.2rem;
        color: #ffffff;
    }

    h4 {
        margin: 1rem 0 0.5rem;
        font-size: 1.1rem;
        color: #ffffff;
    }

    .stats p {
        font-size: 1rem;
        color: #cccccc;
        margin: 0.5rem 0;
    }

    .stats ul {
        list-style: none;
        padding-left: 0;
        margin: 0.5rem 0;
    }

    .stats li {
        font-size: 0.9rem;
        color: #cccccc;
        margin: 0.2rem 0;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .card {
        background-color: #1e1e1e;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        color: #ffffff;
        border: 1px solid #333;
        cursor: pointer;

        &:hover {
            background-color: #252525;
        }
    }

    .card h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
        color: #ffffff;
    }

    .card p {
        font-size: 0.9rem;
        color: #cccccc;
        margin: 0.2rem 0;
    }

    .detail-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 4rem);
    }

    .detail-card {
        background-color: #1e1e1e;
        padding: 2rem;
        border-radius: 8px;
        width: 70%;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .detail-card p {
        font-size: 1rem;
        color: #cccccc;
    }

    .products-list {
        margin: 0.5rem 0;
    }

    .product-item {
        padding: 0.5rem;
        border-bottom: 1px solid #333;
    }

    .detail-card button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background-color: #007bff;
        color: #ffffff;
        font-size: 1rem;
        width: fit-content;

        &:hover {
            background-color: #0056b3;
        }
    }
`;

const ErrorMessage = styled.div`
    background-color: #ff4444;
    color: white;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
`;

const LoadingMessage = styled.div`
    background-color: #333;
    color: white;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
`;

const RefreshButton = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 1rem;

    &:hover {
        background-color: #0056b3;
    }

    &:disabled {
        background-color: #666;
        cursor: not-allowed;
    }
`;

export default Bills;