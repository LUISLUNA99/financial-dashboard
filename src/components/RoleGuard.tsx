import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  allowedRoles: Array<'admin' | 'user' | 'viewer'>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RestrictedMessage = styled(motion.div)`
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.75rem;
  color: #ef4444;
`;

const RestrictedTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const RestrictedText = styled.p`
  margin: 0;
  opacity: 0.8;
`;

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, fallback }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <RestrictedMessage
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <RestrictedTitle>Acceso Restringido</RestrictedTitle>
        <RestrictedText>
          No tienes permisos para ver este contenido. Contacta al administrador si necesitas acceso.
        </RestrictedText>
      </RestrictedMessage>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
