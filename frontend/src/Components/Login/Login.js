import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaUser, FaLock } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    empid: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', formData);
      console.log('Login response:', response.data);
      const { role, username, employee_id, token } = response.data;

      if (!employee_id) {
        throw new Error('Employee ID not provided by server');
      }

      // Store user info in localStorage
      localStorage.setItem('userRole', role);
      localStorage.setItem('username', username);
      localStorage.setItem('employeeId', employee_id);
      console.log('Stored employeeId:', localStorage.getItem('employeeId'));

      // Login successful
      login({
        employee_id: employee_id,
        role: role,
        username: username
      }, token);

      // Navigate based on role
      switch(role.toLowerCase()) {
        case 'manager':
          navigate('/dashboard');
          break;
        case 'cashier':
          navigate('/bill');
          break;
        default:
          setError('Invalid role assigned');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-page">
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h1>Welcome Back</h1>
          {error && <div className="error-message">{error}</div>}
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
            <FaUser className="icon" />
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
            <FaLock className="icon" />
          </div>
          <button type="submit">Login</button>
          <div className="register-link">
            <p>New to AASPOS? <Link to="/signup">Create an Account</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 