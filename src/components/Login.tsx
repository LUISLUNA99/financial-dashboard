import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { CSIColors } from '../styles/CSITheme';
import toast from 'react-hot-toast';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: 
    linear-gradient(rgba(27, 54, 92, 0.6), rgba(200, 16, 46, 0.4)),
    url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2864&q=80') center/cover;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, ${CSIColors.primary.main}30 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, ${CSIColors.secondary.main}30 0%, transparent 50%),
      linear-gradient(135deg, rgba(27, 54, 92, 0.3) 0%, rgba(200, 16, 46, 0.3) 100%);
    backdrop-filter: blur(2px);
  }
`;

const LoginCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;

  @media (max-width: 640px) {
    margin: 1rem;
    padding: 2rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.05) 100%);
    border-radius: 24px;
    pointer-events: none;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const LogoIcon = styled.div`
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, ${CSIColors.primary.main}, ${CSIColors.secondary.main});
  border-radius: 20px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  font-weight: bold;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  font-weight: 300;
  text-align: center;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0 0 2.5rem 0;
  font-size: 0.95rem;
  font-weight: 300;
  letter-spacing: 0.05em;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  padding: 1.2rem 1rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 300;
  }

  &:focus {
    outline: none;
    border-bottom-color: ${CSIColors.accent.gold};
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
  }
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, ${CSIColors.secondary.main} 0%, ${CSIColors.secondary.dark} 100%);
  border: none;
  border-radius: 0;
  padding: 1.2rem 2rem;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-top: 1rem;
  box-shadow: 0 8px 25px rgba(200, 16, 46, 0.3);

  &:hover {
    box-shadow: 0 12px 35px rgba(200, 16, 46, 0.4);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }
`;

const SignUpButton = styled(Button)`
  background: linear-gradient(135deg, ${CSIColors.accent.gold} 0%, #B8860B 100%);
  margin-top: 0.5rem;
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);

  &:hover {
    box-shadow: 0 12px 35px rgba(212, 175, 55, 0.4);
  }
`;

const DemoCredentials = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const DemoTitle = styled.h3`
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  text-align: center;
`;

const DemoUser = styled.div`
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DemoEmail = styled.div`
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
`;

const DemoPassword = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const DemoRole = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  font-style: italic;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      toast.success('¡Bienvenido al Dashboard Financiero!');
    } else {
      toast.error('Credenciales incorrectas. Verifica tu email y contraseña.');
    }
  };

  const fillDemoCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <LoginContainer>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Logo>
          <LogoIcon>🏢</LogoIcon>
          <Title>QUARTER</Title>
          <Subtitle>No list. Just the best places to be.</Subtitle>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Username</Label>
            <Input
              id="email"
              type="email"
              placeholder="ahenker"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </InputGroup>

          <Button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading && <LoadingSpinner />}
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          <SignUpButton
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign Up
          </SignUpButton>
        </Form>

        <DemoCredentials>
          <DemoTitle>🔐 Demo Credentials</DemoTitle>
          
          <DemoUser onClick={() => fillDemoCredentials('admin@inovitz.com', 'admin123')}>
            <DemoEmail>admin@inovitz.com</DemoEmail>
            <DemoPassword>Password: admin123</DemoPassword>
            <DemoRole>Role: Admin</DemoRole>
          </DemoUser>

          <DemoUser onClick={() => fillDemoCredentials('user@buzzword.com', 'user123')}>
            <DemoEmail>user@buzzword.com</DemoEmail>
            <DemoPassword>Password: user123</DemoPassword>
            <DemoRole>Role: User</DemoRole>
          </DemoUser>

          <DemoUser onClick={() => fillDemoCredentials('viewer@empresa.com', 'viewer123')}>
            <DemoEmail>viewer@empresa.com</DemoEmail>
            <DemoPassword>Password: viewer123</DemoPassword>
            <DemoRole>Role: Viewer</DemoRole>
          </DemoUser>
        </DemoCredentials>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
