import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Shield, Eye, Settings, BarChart3, Users, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RoleIndicator = styled(motion.div)<{ role: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 0.75rem;
  border: 2px solid;
  background: ${props => {
    switch (props.role) {
      case 'admin': return 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)';
      case 'user': return 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)';
      case 'viewer': return 'linear-gradient(135deg, #f3e8ff 0%, #8b5cf6 100%)';
      default: return 'linear-gradient(135deg, #f1f5f9 0%, #64748b 100%)';
    }
  }};
  border-color: ${props => {
    switch (props.role) {
      case 'admin': return '#f59e0b';
      case 'user': return '#3b82f6';
      case 'viewer': return '#8b5cf6';
      default: return '#64748b';
    }
  }};
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const RoleIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
`;

const RoleInfo = styled.div`
  flex: 1;
`;

const RoleTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
`;

const RoleDescription = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  opacity: 0.9;
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const PermissionCard = styled(motion.div)<{ available: boolean }>`
  padding: 1rem;
  border-radius: 0.5rem;
  background: ${props => props.available ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${props => props.available ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PermissionIcon = styled.div<{ available: boolean }>`
  color: ${props => props.available ? '#22c55e' : '#ef4444'};
`;

const PermissionText = styled.span<{ available: boolean }>`
  color: ${props => props.available ? '#22c55e' : '#ef4444'};
  font-weight: 500;
`;

interface Permission {
  icon: React.ReactNode;
  text: string;
  roles: Array<'admin' | 'user' | 'viewer'>;
}

const permissions: Permission[] = [
  {
    icon: <BarChart3 size={20} />,
    text: 'Ver dashboards financieros',
    roles: ['admin', 'user', 'viewer']
  },
  {
    icon: <Settings size={20} />,
    text: 'Configurar sistema',
    roles: ['admin']
  },
  {
    icon: <Users size={20} />,
    text: 'Gestionar usuarios',
    roles: ['admin']
  },
  {
    icon: <Eye size={20} />,
    text: 'Exportar reportes',
    roles: ['admin', 'user']
  },
  {
    icon: <Lock size={20} />,
    text: 'Acceso a datos sensibles',
    roles: ['admin']
  }
];

const RoleBasedContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={24} />;
      case 'user': return <BarChart3 size={24} />;
      case 'viewer': return <Eye size={24} />;
      default: return <Shield size={24} />;
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'user': return 'Usuario';
      case 'viewer': return 'Visualizador';
      default: return 'Usuario';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Acceso completo al sistema y configuración';
      case 'user': return 'Acceso a dashboards y generación de reportes';
      case 'viewer': return 'Solo visualización de dashboards';
      default: return 'Acceso básico al sistema';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <RoleIndicator
        role={user.role}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <RoleIcon>
          {getRoleIcon(user.role)}
        </RoleIcon>
        <RoleInfo>
          <RoleTitle>{getRoleTitle(user.role)}</RoleTitle>
          <RoleDescription>{getRoleDescription(user.role)}</RoleDescription>
        </RoleInfo>
      </RoleIndicator>

      <PermissionsGrid>
        {permissions.map((permission, index) => (
          <PermissionCard
            key={index}
            available={permission.roles.includes(user.role)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <PermissionIcon available={permission.roles.includes(user.role)}>
              {permission.icon}
            </PermissionIcon>
            <PermissionText available={permission.roles.includes(user.role)}>
              {permission.text}
            </PermissionText>
          </PermissionCard>
        ))}
      </PermissionsGrid>
    </motion.div>
  );
};

export default RoleBasedContent;
