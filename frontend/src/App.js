import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import GlobalStyles from './styles/globalStyles';
import { theme } from './styles/theme';
import { fadeIn } from './styles/animations';
import Login from './Components/Login/Login';
import Signup from './Components/Signup/Signup';
import Dashboardmain from './Components/Dashboard/Dashboardmain';
import ProductMain from './Components/Products/productmain';
import Customermain from './Components/Customers/customermain';
import Employeemain from './Components/Employee/employeemain';
import Suppliermain from './Components/Supplier/suppliermain';
import Billmain from './Components/Billing/billmain';
import ProtectedRoute from './Components/ProtectedRoute';
import Unauthorized from './Components/Unauthorized/Unauthorized';
import { AuthProvider } from './context/AuthContext';

// Styled Components
const AppWrapper = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background.main};
  position: relative;
  overflow-x: hidden;
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  padding: ${theme.spacing.xl};
  animation: ${fadeIn} 0.5s ease-out;
  background: linear-gradient(
    135deg,
    ${theme.colors.background.main} 0%,
    ${theme.colors.background.card} 100%
  );
`;

function App() {
  return (
    <AuthProvider>
    <AppWrapper>
      <GlobalStyles />
      <Router>
        <Routes>
            <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Protected Routes */}
          <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="manager">
                <PageWrapper>
              <Dashboardmain />
                </PageWrapper>
            </ProtectedRoute>
          } />
            
          <Route path="/product" element={
              <ProtectedRoute requiredRole="manager">
                <PageWrapper>
              <ProductMain />
                </PageWrapper>
            </ProtectedRoute>
          } />
            
          <Route path="/customer" element={
              <ProtectedRoute requiredRole="manager">
                <PageWrapper>
              <Customermain />
                </PageWrapper>
            </ProtectedRoute>
          } />
            
          <Route path="/employee" element={
              <ProtectedRoute requiredRole="manager">
                <PageWrapper>
              <Employeemain />
                </PageWrapper>
            </ProtectedRoute>
          } />
            
          <Route path="/supply" element={
              <ProtectedRoute requiredRole="manager">
                <PageWrapper>
              <Suppliermain />
                </PageWrapper>
            </ProtectedRoute>
          } />
            
          <Route path="/bill" element={
              <ProtectedRoute requiredRole="manager">
                <PageWrapper>
              <Billmain />
                </PageWrapper>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AppWrapper>
    </AuthProvider>
  );
}

export default App;