import React from 'react';
import styled from 'styled-components';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  className?: string;
}

const getBadgeVariant = (variant: string) => {
  const variants = {
    default: `
      background: hsl(221.2 83.2% 53.3%);
      color: hsl(210 40% 98%);
    `,
    secondary: `
      background: hsl(210 40% 96%);
      color: hsl(222.2 84% 4.9%);
    `,
    destructive: `
      background: hsl(0 84.2% 60.2%);
      color: hsl(210 40% 98%);
    `,
    outline: `
      background: transparent;
      color: hsl(222.2 84% 4.9%);
      border: 1px solid hsl(214.3 31.8% 91.4%);
    `,
    success: `
      background: hsl(142.1 76.2% 36.3%);
      color: hsl(210 40% 98%);
    `,
    warning: `
      background: hsl(32.7 98.7% 83.7%);
      color: hsl(25 95.8% 53.1%);
    `,
  };
  
  return variants[variant as keyof typeof variants] || variants.default;
};

const StyledBadge = styled.span<{ variant: string }>`
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  
  ${({ variant }) => getBadgeVariant(variant)}
`;

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className,
  ...props 
}) => {
  return (
    <StyledBadge 
      variant={variant} 
      className={className}
      {...props}
    >
      {children}
    </StyledBadge>
  );
};

export default Badge;
