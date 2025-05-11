import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container>
      <Content>
        <h1>Access Denied</h1>
        <p>Sorry, you don't have permission to access this page.</p>
        <p>Your current role: <strong>{user?.role || 'Not logged in'}</strong></p>
        <ButtonGroup>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
          <Button onClick={handleLogout}>Logout</Button>
        </ButtonGroup>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #1a1a1a;
  padding: 20px;
`;

const Content = styled.div`
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 500px;
  width: 100%;

  h1 {
    color: #ff4444;
    margin-bottom: 1rem;
  }

  p {
    color: #fff;
    margin-bottom: 1rem;
  }

  strong {
    color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  background: ${props => props.primary ? '#007bff' : '#444'};
  color: white;

  &:hover {
    background: ${props => props.primary ? '#0056b3' : '#555'};
  }
`;

export default Unauthorized; 