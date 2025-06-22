import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { LogOut, User, DollarSign, TrendingUp, Target, Shield, Eye, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ProfileSection = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const MetricsSection = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const MetricCard = styled(motion.div)`
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const MetricIcon = styled.div<{ color: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const MetricInfo = styled.div`
  flex: 1;
`;

const MetricLabel = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
`;

const MetricValue = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const Avatar = styled.div<{ role: string }>`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: ${props => {
    switch (props.role) {
      case 'admin': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'user': return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
      case 'viewer': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RoleBadge = styled.span<{ role: string }>`
  padding: 0.25rem 0.75rem;
  background: ${props => {
    switch (props.role) {
      case 'admin': return '#f59e0b';
      case 'user': return '#3b82f6';
      case 'viewer': return '#8b5cf6';
      default: return '#10b981';
    }
  }};
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const LogoutButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FinancialHeader: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={12} />;
      case 'user': return <BarChart3 size={12} />;
      case 'viewer': return <Eye size={12} />;
      default: return <User size={12} />;
    }
  };

  // Mock financial data - en un caso real vendría de una API
  const financialMetrics = [
    {
      label: 'Ingresos del Mes',
      value: '$2,847,320',
      icon: <DollarSign size={20} />,
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      available: ['admin', 'user', 'viewer'].includes(user?.role || '')
    },
    {
      label: 'Crecimiento',
      value: '+12.5%',
      icon: <TrendingUp size={20} />,
      color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      available: ['admin', 'user'].includes(user?.role || '')
    },
    {
      label: 'Meta Anual',
      value: '78% Completado',
      icon: <Target size={20} />,
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      available: ['admin'].includes(user?.role || '')
    }
  ];

  return (
    <HeaderContainer>
      <ProfileSection
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <UserSection>
          <Avatar role={user?.role || 'user'}>
            {getRoleIcon(user?.role || 'user')}
          </Avatar>
          <UserInfo>
            <UserName>{user?.name || 'Usuario'}</UserName>
            <UserEmail>
              {user?.email || 'email@demo.com'}
              <RoleBadge role={user?.role || 'user'}>
                {getRoleIcon(user?.role || 'user')}
                {user?.role || 'user'}
              </RoleBadge>
            </UserEmail>
          </UserInfo>
        </UserSection>
        <LogoutButton
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={16} />
          Cerrar Sesión
        </LogoutButton>
      </ProfileSection>

      <MetricsSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {financialMetrics.map((metric, index) => (
          metric.available ? (
            <MetricCard
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <MetricIcon color={metric.color}>
                {metric.icon}
              </MetricIcon>
              <MetricInfo>
                <MetricLabel>{metric.label}</MetricLabel>
                <MetricValue>{metric.value}</MetricValue>
              </MetricInfo>
            </MetricCard>
          ) : null
        ))}
      </MetricsSection>
    </HeaderContainer>
  );
};

export default FinancialHeader;
