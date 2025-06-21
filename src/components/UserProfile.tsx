import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getUser, getDashboardStats } from '../services/supabaseClient';
import { User, DashboardStats } from '../types';

const ProfileContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

const Avatar = styled.div<{ url?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.url ? `url(${props.url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: bold;
  margin-right: 20px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
`;

const UserEmail = styled.p`
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const GrowthIndicator = styled.span<{ positive: boolean }>`
  color: ${props => props.positive ? '#52c41a' : '#ff4d4f'};
  font-size: 14px;
  margin-left: 8px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ff4d4f;
  padding: 20px;
  background: #fff2f0;
  border-radius: 8px;
  border: 1px solid #ffccc7;
`;

interface UserProfileProps {
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const [userData, statsData] = await Promise.all([
                    getUser(userId),
                    getDashboardStats(userId)
                ]);
                
                setUser(userData);
                setStats(statsData);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Error al cargar los datos del usuario');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <ProfileContainer>
                <LoadingSpinner>Cargando perfil...</LoadingSpinner>
            </ProfileContainer>
        );
    }

    if (error || !user) {
        return (
            <ProfileContainer>
                <ErrorMessage>
                    {error || 'No se encontraron datos del usuario'}
                </ErrorMessage>
            </ProfileContainer>
        );
    }

    return (
        <ProfileContainer>
            <ProfileHeader>
                <Avatar url={user.avatar_url}>
                    {!user.avatar_url && getInitials(user.name)}
                </Avatar>
                <UserInfo>
                    <UserName>{user.name}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                </UserInfo>
            </ProfileHeader>

            {stats && (
                <StatsGrid>
                    <StatCard>
                        <StatValue>{formatCurrency(stats.totalIncome)}</StatValue>
                        <StatLabel>Ingresos Totales</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatValue>{formatCurrency(stats.totalExpenses)}</StatValue>
                        <StatLabel>Gastos Totales</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatValue>{formatCurrency(stats.balance)}</StatValue>
                        <StatLabel>Balance</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatValue>
                            {stats.monthlyGrowth.toFixed(1)}%
                            <GrowthIndicator positive={stats.monthlyGrowth >= 0}>
                                {stats.monthlyGrowth >= 0 ? '↗' : '↘'}
                            </GrowthIndicator>
                        </StatValue>
                        <StatLabel>Crecimiento Mensual</StatLabel>
                    </StatCard>
                </StatsGrid>
            )}
        </ProfileContainer>
    );
};

export default UserProfile;