import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { cardStyle } from "./Reusablestyle";
import axios from 'axios';

const Earnings = () => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [monthlyEarnings, setMonthlyEarnings] = useState(0);
    const [growth, setGrowth] = useState(0);

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/analytics/dashboard');
                const { dailySales } = response.data.data;
                
                // Calculate monthly earnings (last 30 days)
                const totalEarnings = dailySales.reduce((sum, day) => sum + day.amount, 0);
                setMonthlyEarnings(totalEarnings);

                // Calculate growth percentage (comparing last 15 days with previous 15 days)
                if (dailySales.length >= 30) {
                    const last15Days = dailySales.slice(-15).reduce((sum, day) => sum + day.amount, 0);
                    const prev15Days = dailySales.slice(-30, -15).reduce((sum, day) => sum + day.amount, 0);
                    const growthPercentage = prev15Days ? ((last15Days - prev15Days) / prev15Days) * 100 : 0;
                    setGrowth(growthPercentage);
                }

                setSalesData(dailySales);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch sales data');
                setLoading(false);
            }
        };

        fetchSalesData();
    }, []);

    if (loading) return <div>Loading sales data...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Section>
            <div className="top">
                <div className="info">
                    <h4>This month earnings</h4>
                    <h1>${monthlyEarnings.toFixed(2)}</h1>
                    <div className="growth">
                        <span>{growth >= 0 ? '+' : ''}{growth.toFixed(2)}%</span>
                    </div>
                </div>
            </div>
            <div className="chart">
                <ResponsiveContainer height="100%" width="100%">
                    <AreaChart data={salesData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <Tooltip 
                            cursor={false}
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']}
                            labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        />
                        <Area
                        animationBegin={800}
                        animationDuration={2000}
                        type="monotone"
                            dataKey="amount"
                        stroke="rgb(16, 212, 25)"
                        fill="#8068233e"
                        strokeWidth={4}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Section>
    )
}

const Section = styled.section`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 20rem;
    ${cardStyle}
    padding: 2rem 0 0 0;
    .top{
        .info{
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.3rem;
            h1{
                font-size: 2rem;
            }
            .growth{
                background-color: #d7e41e1d;
                padding: 0.5rem;
                border-radius: 1rem;
                transition: 0.3s ease-in-out;
                &:hover{
                    background-color: rgb(16, 212, 25);
                    span{
                        color: #000000
                    }
                }
                span{
                    color: rgb(16, 212, 25);
                }
            }
        }
    }
    .chart{
        height: 70%;
        .recharts-default-tooltip{
            background-color: #000000 !important;
            border-color: #000000 !important;
        }
    }
`;

export default Earnings;