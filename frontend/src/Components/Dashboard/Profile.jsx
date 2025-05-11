import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import { cardStyle } from "./Reusablestyle";
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const employeeId = localStorage.getItem('employeeId');
                console.log('Stored employeeId:', employeeId);

                if (!employeeId) {
                    console.error('No employee ID found in localStorage');
                    throw new Error('No employee ID found. Please login again.');
                }

                // Log the full URL being requested
                const url = '/api/manager/profile';
                console.log('Making API request to:', url);
                console.log('With params:', { employee_id: employeeId });

                const response = await axios.get(url, {
                    params: {
                        employee_id: employeeId
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                console.log('Full API Response:', response);
                console.log('Response data:', response.data);
                console.log('Profile data:', response.data.data);

                if (!response.data || !response.data.data) {
                    console.error('Invalid response structure:', response);
                    throw new Error('Invalid profile data received');
                }

                setProfile(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Profile fetch error details:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    headers: err.response?.headers,
                    config: {
                        url: err.config?.url,
                        method: err.config?.method,
                        params: err.config?.params,
                        headers: err.config?.headers
                    }
                });

                let errorMessage = 'Failed to fetch profile';
                if (err.response?.status === 404) {
                    errorMessage = 'Profile not found. Please check if the employee ID is correct.';
                } else if (err.response?.status === 401) {
                    errorMessage = 'Unauthorized. Please login again.';
                } else if (err.response?.data?.error) {
                    errorMessage = err.response.data.error;
                } else if (err.message) {
                    errorMessage = err.message;
                }

                setError(errorMessage);
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div>Loading profile...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;
    if (!profile) return <div>No profile data available</div>;

    return (
        <Section>
            <div className="image">
                <FaUserCircle size={100} />
            </div>
            <div className="title">
                <h2>{profile.employee_name || 'N/A'}</h2>
                <h5>
                    <HiOutlineLocationMarker/> {profile.employee_address || 'N/A'}
                </h5>
            </div>
            <div className="info">
                <div className="container">
                    <h5>Role</h5>
                    <h3>{profile.role || 'N/A'}</h3>
                </div>
                <div className="container">
                    <h5>Designation</h5>
                    <h3>{profile.employee_designation || 'N/A'}</h3>
                </div>
                <div className="container">
                    <h5>Total Sales</h5>
                    <h3>{profile.total_sales || 0}</h3>
                </div>
            </div>
        </Section>
    );
};

const Section = styled.section`
    ${cardStyle}
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    .error-message {
        color: #ff0033;
        padding: 1rem;
        text-align: center;
        background: #ffe6e6;
        border-radius: 4px;
        margin: 1rem 0;
    }

    .image {
        height: 10rem;
        width: 10rem;
        display: flex;
        justify-content: center;
        align-items: center;
        svg {
            color: rgb(16, 212, 25);
        }
    }

    .title {
        text-align: center;
        h2,
        h5 {
            color: rgb(16, 212, 25);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: center;
        }
    }

    .info {
        display: flex;
        gap: 1rem;
        .container {
            text-align: center;
            padding: 0 1rem;
            border-right: 1px solid #6c6e6e;
            &:last-child {
                border: none;
            }
            h5 {
                color: rgb(16, 212, 25);
                margin-bottom: 0.5rem;
            }
        }
    }
`;

export default Profile;