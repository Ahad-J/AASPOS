import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { cardStyle } from "./Reusablestyle";
import { BsFillCalendar2WeekFill } from "react-icons/bs";
import { IoStatsChart } from "react-icons/io5";
import { BiGroup } from "react-icons/bi";
import { FiActivity } from "react-icons/fi";
import axios from 'axios';

const Analytics = () => {
    const [analytics, setAnalytics] = useState({
        productCount: 0,
        employeeCount: 0,
        customerCount: 0,
        profit: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/analytics/dashboard');
                setAnalytics(response.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch analytics');
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div>Loading analytics...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Section>
            <div className="analytic">
                <div className="content">
                    <h5>PRODUCT COUNT</h5>
                    <h2>{analytics.productCount}</h2>
                </div>
                <div className="logo">
                    <BsFillCalendar2WeekFill/>
                </div>
            </div>
            <div className="analytic">
                <div className="logo">
                    <IoStatsChart/>
                </div>
                <div className="content">
                    <h5>EMPLOYEE COUNT</h5>
                    <h2>{analytics.employeeCount}</h2>
                </div>
            </div>
            <div className="analytic">
                <div className="logo">
                    <BiGroup/>
                </div>
                <div className="content">
                    <h5>CUSTOMER COUNT</h5>
                    <h2>{analytics.customerCount}</h2>
                </div>
            </div>
            <div className="analytic">
                <div className="content">
                    <h5>PROFIT</h5>
                    <h2>${analytics.profit.toFixed(2)}</h2>
                </div>
                <div className="logo">
                    <FiActivity/>
                </div>
            </div>
        </Section>
    )
}

const Section = styled.section`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    .analytic{
        ${cardStyle};
        padding: 1rem;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        gap: 1rem;
        transition: 0.1s ease-in-out;
        &:hover{
            background-color: rgb(16, 212, 25);
            color: #000000;
            svg{
                color:rgb(255, 255, 255);
            }
        }
        .logo{
            background-color: #000000;
            border-radius: 3rem;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.5rem;
            svg{
                font-size: 1.5rem;
            }
        }
    }
`;

export default Analytics;