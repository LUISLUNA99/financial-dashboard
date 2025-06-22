import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: hsl(222.2 84% 4.9%);
    background: linear-gradient(135deg, hsl(210 40% 98%) 0%, hsl(214 32% 91%) 100%);
    min-height: 100vh;
    font-feature-settings: "cv11", "ss01";
    font-variation-settings: "opsz" 32;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    color: hsl(222.2 84% 4.9%);
    letter-spacing: -0.025em;
  }

  h1 {
    font-size: 2.25rem;
    font-weight: 700;
  }

  h2 {
    font-size: 1.875rem;
    font-weight: 600;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
    transition: all 0.2s ease-in-out;
    font-weight: 500;
    border-radius: 0.375rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    text-decoration: none;
    
    &:disabled {
      pointer-events: none;
      opacity: 0.5;
    }
    
    &:focus-visible {
      outline: 2px solid hsl(221.2 83.2% 53.3%);
      outline-offset: 2px;
    }
  }

  input, select, textarea {
    font-family: inherit;
    border: 1px solid hsl(214.3 31.8% 91.4%);
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
    background: hsl(0 0% 100%);
    font-size: 0.875rem;
    transition: all 0.2s ease-in-out;
    
    &::placeholder {
      color: hsl(215.4 16.3% 46.9%);
    }
  }

  input:focus, select:focus, textarea:focus {
    border-color: hsl(221.2 83.2% 53.3%);
    outline: 2px solid hsl(221.2 83.2% 53.3%);
    outline-offset: 2px;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: hsl(210 40% 98%);
    border-radius: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: hsl(215.4 16.3% 46.9%);
    border-radius: 8px;
    
    &:hover {
      background: hsl(215.4 16.3% 36.9%);
    }
  }

  /* Selection styles */
  ::selection {
    background-color: hsl(221.2 83.2% 53.3%);
    color: white;
  }

  /* Focus styles for accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Animation utilities */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }

  .animate-slide-in {
    animation: slideIn 0.3s ease-out;
  }

  /* Card shadows */
  .shadow-sm {
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .shadow {
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  }

  .shadow-md {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  .shadow-lg {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

  .shadow-xl {
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  }
`;

const App: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      <Router basename="/financial-dashboard" future={{ v7_startTransition: true }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(0 0% 100%)',
            color: 'hsl(222.2 84% 4.9%)',
            border: '1px solid hsl(214.3 31.8% 91.4%)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: 'hsl(142.1 76.2% 36.3%)',
              secondary: 'hsl(0 0% 100%)',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(0 84.2% 60.2%)',
              secondary: 'hsl(0 0% 100%)',
            },
          },
        }}
      />
    </>
  );
};

export default App;