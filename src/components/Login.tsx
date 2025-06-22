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
  background: linear-gradient(135deg, 
    ${CSIColors.primary.dark} 0%, 
    ${CSIColors.primary.main} 25%, 
    ${CSIColors.secondary.dark} 50%, 
    ${CSIColors.secondary.main} 75%, 
    ${CSIColors.accent.gold} 100%
  );
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
      radial-gradient(circle at 20% 80%, ${CSIColors.primary.main}40 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, ${CSIColors.secondary.main}40 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, ${CSIColors.accent.gold}20 0%, transparent 50%);
  }
`;

const LoginCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 
    0 20px 25px -5px rgb(0 0 0 / 0.4),
    0 8px 10px -6px rgb(0 0 0 / 0.4);
  position: relative;
  z-index: 1;

  @media (max-width: 640px) {
    margin: 1rem;
    padding: 2rem;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  font-weight: bold;
`;

const Title = styled.h1`
  color: white;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin: 0 0 2rem 0;
  font-size: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.875rem;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Button = styled(motion.button)`
  background: ${CSIColors.gradients.primary};
  border: none;
  border-radius: 12px;
  padding: 1rem;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: 0 8px 25px ${CSIColors.primary.main}40;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${CSIColors.neutral.white}20, transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
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
          <LogoIcon>💰</LogoIcon>
          <Title>Dashboard Financiero</Title>
          <Subtitle>Gestiona tus finanzas de manera inteligente</Subtitle>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Contraseña</Label>
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
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </Form>

        <DemoCredentials>
          <DemoTitle>🔐 Credenciales de Demo</DemoTitle>
          
          <DemoUser onClick={() => fillDemoCredentials('admin@inovitz.com', 'admin123')}>
            <DemoEmail>admin@inovitz.com</DemoEmail>
            <DemoPassword>Contraseña: admin123</DemoPassword>
            <DemoRole>Rol: Administrador</DemoRole>
          </DemoUser>

          <DemoUser onClick={() => fillDemoCredentials('user@buzzword.com', 'user123')}>
            <DemoEmail>user@buzzword.com</DemoEmail>
            <DemoPassword>Contraseña: user123</DemoPassword>
            <DemoRole>Rol: Usuario</DemoRole>
          </DemoUser>

          <DemoUser onClick={() => fillDemoCredentials('viewer@empresa.com', 'viewer123')}>
            <DemoEmail>viewer@empresa.com</DemoEmail>
            <DemoPassword>Contraseña: viewer123</DemoPassword>
            <DemoRole>Rol: Visualizador</DemoRole>
          </DemoUser>
        </DemoCredentials>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
