import React, { useState } from "react";
import './Signup.css'
import {FaUser, FaLock, FaIdCard, FaUserTie} from "react-icons/fa"
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        empid: '',
        password: '',
        role: 'manager'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/auth/signup', formData);
            setSuccess('Registration successful! Please login.');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="signup-page">
            <div className='wrapper'>
                <form onSubmit={handleSubmit}>
                    <h1>Create Account</h1>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <div className="input-box">
                        <input 
                            type="text" 
                            name="name"
                            placeholder="Full Name" 
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <FaUser className="icon"/>
                    </div>
                    <div className="input-box">
                        <input 
                            type="text" 
                            name="empid"
                            placeholder="Employee ID (E###)" 
                            value={formData.empid}
                            onChange={handleChange}
                            required
                            pattern="E\d{3}"
                            title="Employee ID should be in format E### (e.g., E001)"
                        />
                        <FaIdCard className="icon"/>
                    </div>
                    <div className="input-box">
                        <input 
                            type="password" 
                            name="password"
                            placeholder="Password" 
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <FaLock className="icon"/>
                    </div>
                    <div className="input-box">
                        <select 
                            name="role" 
                            value={formData.role}
                            onChange={handleChange}
                            className="role-select"
                        >
                            <option value="manager">Manager</option>
                        </select>
                        <FaUserTie className="icon"/>
                    </div>
                    <button type="submit">Create Account</button>
                    <div className="login-link">
                        <p>Already have an account? <Link to="/login">Sign In</Link></p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signup 