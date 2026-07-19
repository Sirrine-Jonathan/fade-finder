'use client';

import React from 'react';
import styled, { css } from 'styled-components';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'outline';
  padding?: string;
  interactive?: boolean;
}

const StyledCard = styled.div<CardProps>`
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ padding }) => padding || '1.25rem'};
  transition: transform ${({ theme }) => theme.transitions.normal}, box-shadow ${({ theme }) => theme.transitions.normal}, border-color ${({ theme }) => theme.transitions.normal};

  ${({ variant = 'glass', theme }) => {
    switch (variant) {
      case 'solid':
        return css`
          background-color: ${theme.colors.surface};
          border: 1px solid ${theme.colors.border};
        `;
      case 'outline':
        return css`
          background-color: transparent;
          border: 1px solid ${theme.colors.border};
        `;
      case 'glass':
      default:
        return css`
          background: ${theme.colors.card};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${theme.colors.cardBorder};
          box-shadow: ${theme.shadows.md};
        `;
    }
  }}

  ${({ interactive, theme }) =>
    interactive &&
    css`
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.lg};
        border-color: ${theme.colors.primary};
      }
    `}
`;

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  padding,
  interactive = false,
  ...props
}) => {
  return (
    <StyledCard variant={variant} padding={padding} interactive={interactive} {...props}>
      {children}
    </StyledCard>
  );
};

export default Card;
