import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { cardStyle } from "./Reusablestyle";
import axios from 'axios';

const Transfer = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/manager/view-expenses');
                // Sort expenses by time in descending order and take only the first 10
                const sortedExpenses = response.data.data
                    .sort((a, b) => new Date(b.time) - new Date(a.time))
                    .slice(0, 5);
                setExpenses(sortedExpenses);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching expenses:', err);
                setError(err.response?.data?.error || 'Failed to fetch expenses');
                setLoading(false);
            }
        };

        fetchExpenses();
    }, []);

    if (loading) return <div>Loading expenses...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Section>
            <div className="title">
                <h2>Recent Expenses</h2>
            </div>
            <div className="transactions">
                {expenses.map((expense) => (
                    <div className="transaction" key={expense.id}>
                        <div className="transaction_title">
                            <div className="transaction_title_details">
                                <h3>{expense.description}</h3>
                                <h5>{new Date(expense.time).toLocaleString()}</h5>
                            </div>
                        </div>
                        <div className="transaction_amount negative">
                            <span>{expense.amount.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
                {expenses.length === 0 && (
                    <div className="no-data">No expenses found</div>
                )}
            </div>
        </Section>
    );
};

const Section = styled.section`
    ${cardStyle}
    display: flex;
    flex-direction: column;
    gap: 1rem;
    .title {
        h2 {
            color: rgb(16, 212, 25);
        }
    }
    .transactions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
        .transaction {
            display: flex;
            justify-content: space-between;
            align-items: center;
            &_title {
                display: flex;
                gap: 1rem;
                &_details {
                    h3 {
                        font-size: 1rem;
                    }
                    h5 {
                        color: #777;
                        font-size: 0.8rem;
                    }
                }
            }
            &_amount {
                background-color: #d7e41e1d;
                padding: 0.2rem 0.5rem;
                width: 4rem;
                border-radius: 1rem;
                text-align: center;
                white-space: nowrap;
                transition: 0.3s ease-in-out;
                &.negative span {
                    color: red;
                }
            }
        }
        .no-data {
            text-align: center;
            color: #777;
            padding: 1rem;
        }
    }
`;

export default Transfer;
