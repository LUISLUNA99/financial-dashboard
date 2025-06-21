import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const StyledCard = styled(motion.div)<{ hover?: boolean }>`
  background: hsl(0 0% 100%);
  border: 1px solid hsl(214.3 31.8% 91.4%);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  transition: all 0.2s ease-in-out;
  
  ${({ hover }) => hover && `
    &:hover {
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      transform: translateY(-2px);
    }
  `}
`;

const StyledCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  space-y: 0.375rem;
  padding: 1.5rem 1.5rem 0 1.5rem;
`;

const StyledCardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1;
  color: hsl(222.2 84% 4.9%);
  letter-spacing: -0.025em;
`;

const StyledCardDescription = styled.p`
  font-size: 0.875rem;
  color: hsl(215.4 16.3% 46.9%);
  line-height: 1.4;
  margin-top: 0.25rem;
`;

const StyledCardContent = styled.div`
  padding: 1.5rem;
  padding-top: 0;
`;

const StyledCardFooter = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem;
  padding-top: 0;
`;

const Card: React.FC<CardProps> = ({ children, className, hover = false, ...props }) => {
  return (
    <StyledCard
      className={`animate-fade-in ${className || ''}`}
      hover={hover}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => {
  return (
    <StyledCardHeader className={className} {...props}>
      {children}
    </StyledCardHeader>
  );
};

const CardTitle: React.FC<CardTitleProps> = ({ children, className, ...props }) => {
  return (
    <StyledCardTitle className={className} {...props}>
      {children}
    </StyledCardTitle>
  );
};

const CardDescription: React.FC<CardDescriptionProps> = ({ children, className, ...props }) => {
  return (
    <StyledCardDescription className={className} {...props}>
      {children}
    </StyledCardDescription>
  );
};

const CardContent: React.FC<CardContentProps> = ({ children, className, ...props }) => {
  return (
    <StyledCardContent className={className} {...props}>
      {children}
    </StyledCardContent>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({ children, className, ...props }) => {
  return (
    <StyledCardFooter className={className} {...props}>
      {children}
    </StyledCardFooter>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
