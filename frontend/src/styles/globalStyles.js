import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: ${theme.colors.background.main};
    color: ${theme.colors.text.primary};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.background.main};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.background.hover};
    border-radius: ${theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primary};
  }

  /* Selection */
  ::selection {
    background: ${theme.colors.primary};
    color: ${theme.colors.text.primary};
  }

  /* Focus Styles */
  :focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  /* Button Reset */
  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
    color: inherit;
  }

  /* Link Reset */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* Input Reset */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  /* Smooth Scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Card Styles */
  .card {
    background: ${theme.colors.background.card};
    border-radius: ${theme.borderRadius.lg};
    padding: ${theme.spacing.lg};
    box-shadow: ${theme.shadows.md};
    transition: ${theme.transitions.default};

    &:hover {
      box-shadow: ${theme.shadows.lg};
      transform: translateY(-2px);
    }
  }

  /* Button Styles */
  .btn {
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.borderRadius.md};
    font-weight: 500;
    transition: ${theme.transitions.default};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .btn-primary {
    background: ${theme.colors.primary};
    color: white;

    &:hover {
      background: ${theme.colors.primaryDark};
    }
  }

  .btn-secondary {
    background: ${theme.colors.secondary};
    color: white;

    &:hover {
      background: ${theme.colors.secondaryDark};
    }
  }

  /* Form Styles */
  .form-group {
    margin-bottom: ${theme.spacing.md};
  }

  .form-label {
    display: block;
    margin-bottom: ${theme.spacing.xs};
    color: ${theme.colors.text.secondary};
  }

  .form-input {
    width: 100%;
    padding: ${theme.spacing.sm};
    background: ${theme.colors.background.card};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.md};
    color: ${theme.colors.text.primary};
    transition: ${theme.transitions.default};

    &:focus {
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 2px ${theme.colors.primary}33;
    }
  }

  /* Table Styles */
  .table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: ${theme.spacing.lg} 0;
  }

  .table th,
  .table td {
    padding: ${theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${theme.colors.border};
  }

  .table th {
    background: ${theme.colors.background.card};
    font-weight: 600;
    color: ${theme.colors.text.secondary};
  }

  .table tr:hover td {
    background: ${theme.colors.background.hover};
  }
`;

export default GlobalStyles; 