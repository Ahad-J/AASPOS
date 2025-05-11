import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { IoIosArrowForward } from "react-icons/io";
import { AiFillCalendar } from "react-icons/ai";
import { MdTimelapse } from "react-icons/md";
import { IoMdCash } from "react-icons/io";
import { cardStyle } from "./Reusablestyle";
import axios from 'axios';

const FAQ = () => {
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [topSellingRes, lowStockRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/manager/top-selling'),
                    axios.get('http://localhost:3000/api/manager/low-stock')
                ]);

                setTopSellingProducts(topSellingRes.data.data);
                setLowStockProducts(lowStockRes.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading stock overview...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Section>
            <div className="title">
                <h2>Stock Overview</h2>
            </div>
            <div className="content">
                <div className="column">
                    <h3>Top-Selling Products</h3>
                    {topSellingProducts.map((product, index) => (
                        <div className="item" key={product.product_id}>
                            <div className="info">
                                {index === 0 ? <AiFillCalendar /> : 
                                 index === 1 ? <MdTimelapse /> : 
                                 <IoMdCash />}
                                <h4>{product.product_name} - {product.total_quantity_sold} units sold</h4>
                            </div>
                            <IoIosArrowForward />
                        </div>
                    ))}
                </div>
                <div className="divider" />
                <div className="column">
                    <h3>Low Stock Alerts</h3>
                    {lowStockProducts.map((product, index) => (
                        <div className="item" key={product.product_id}>
                            <div className="info">
                                {index === 0 ? <AiFillCalendar /> : 
                                 index === 1 ? <MdTimelapse /> : 
                                 <IoMdCash />}
                                <h4>{product.product_name} - {product.product_quantity} left (min: {product.min_stock})</h4>
                            </div>
                            <IoIosArrowForward />
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

const Section = styled.section`
    ${cardStyle}
    .title h2 {
        color: rgb(16, 212, 25);
        margin-bottom: 1rem;
    }

    .content {
        display: flex;
        justify-content: space-between;
        gap: 2rem;

        .column {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1rem;

            h3 {
                color: #fff;
                margin-bottom: 0.5rem;
            }

            .item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;

                .info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                svg {
                    font-size: 1.4rem;
                }

                &:nth-of-type(2) {
                    border-top: 0.01rem solid #6c6e6e;
                    border-bottom: 0.01rem solid #6c6e6e;
                    padding: 0.8rem 0;
                }
            }
        }

        .divider {
            width: 1px;
            background-color: #6c6e6e;
        }
    }
`;

export default FAQ;
