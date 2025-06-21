import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const getVariantStyles = (variant: string) => {
  const variants = {
    default: css`
      background: hsl(221.2 83.2% 53.3%);
      color: hsl(210 40% 98%);
      
      &:hover {
        background: hsl(221.2 83.2% 53.3% / 0.9);
      }
    `,
    destructive: css`
      background: hsl(0 84.2% 60.2%);
      color: hsl(210 40% 98%);
      
      &:hover {
        background: hsl(0 84.2% 60.2% / 0.9);
      }
    `,
    outline: css`
      border: 1px solid hsl(214.3 31.8% 91.4%);
      background: hsl(0 0% 100%);
      color: hsl(222.2 84% 4.9%);
      
      &:hover {
        background: hsl(210 40% 96%);
      }
    `,
    secondary: css`
      background: hsl(210 40% 96%);
      color: hsl(222.2 84% 4.9%);
      
      &:hover {
        background: hsl(210 40% 96% / 0.8);
      }
    `,
    ghost: css`
      background: transparent;
      color: hsl(222.2 84% 4.9%);
      
      &:hover {
        background: hsl(210 40% 96%);
      }
    `,
    link: css`
      background: transparent;
      color: hsl(221.2 83.2% 53.3%);
      text-decoration: underline;
      text-underline-offset: 4px;
      
      &:hover {
        text-decoration: none;
      }
    `,
  };
  
  return variants[variant as keyof typeof variants] || variants.default;
};

const getSizeStyles = (size: string) => {
  const sizes = {
    default: css`
      height: 2.5rem;
      padding: 0 1rem;
      font-size: 0.875rem;
    `,
    sm: css`
      height: 2.25rem;
      padding: 0 0.75rem;
      font-size: 0.875rem;
    `,
    lg: css`
      height: 2.75rem;
      padding: 0 2rem;
      font-size: 1rem;
    `,
    icon: css`
      height: 2.5rem;
      width: 2.5rem;
      padding: 0;
    `,
  };
  
  return sizes[size as keyof typeof sizes] || sizes.default;
};

const StyledButton = styled(motion.button)<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:focus-visible {
    outline: 2px solid hsl(221.2 83.2% 53.3%);
    outline-offset: 2px;
  }
  
  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }
  
  ${({ variant = 'default' }) => getVariantStyles(variant)}
  ${({ size = 'default' }) => getSizeStyles(size)}
`;

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  disabled = false,
  onClick,
  type = 'button',
  className,
  ...props 
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={className}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
