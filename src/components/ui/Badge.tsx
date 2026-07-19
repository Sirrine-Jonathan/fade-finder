'use client';

import React from 'react';
import styled, { css } from 'styled-components';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

const getVariantStyles = (variant: BadgeProps['variant'] = 'primary') => {
  switch (variant) {
    case 'secondary':
      return css`
        background-color: ${({ theme }) => theme.colors.surface};
        color: ${({ theme }) => theme.colors.textSecondary};
        border: 1px solid ${({ theme }) => theme.colors.border};
      `;
    case 'accent':
      return css`
        background-color: ${({ theme }) => theme.colors.accentLight};
        color: ${({ theme }) => theme.colors.accent};
        border: 1px solid rgba(245, 158, 11, 0.3);
      `;
    case 'success':
      return css`
        background-color: rgba(16, 185, 129, 0.15);
        color: ${({ theme }) => theme.colors.success};
        border: 1px solid rgba(16, 185, 129, 0.3);
      `;
    case 'warning':
      return css`
        background-color: rgba(245, 158, 11, 0.15);
        color: ${({ theme }) => theme.colors.warning};
        border: 1px solid rgba(245, 158, 11, 0.3);
      `;
    case 'danger':
      return css`
        background-color: rgba(239, 68, 68, 0.15);
        color: ${({ theme }) => theme.colors.danger};
        border: 1px solid rgba(239, 68, 68, 0.3);
      `;
    case 'info':
      return css`
        background-color: rgba(56, 189, 248, 0.15);
        color: ${({ theme }) => theme.colors.secondary};
        border: 1px solid rgba(56, 189, 248, 0.3);
      `;
    case 'outline':
      return css`
        background-color: transparent;
        color: ${({ theme }) => theme.colors.textSecondary};
        border: 1px solid ${({ theme }) => theme.colors.border};
      `;
    case 'primary':
    default:
      return css`
        background-color: ${({ theme }) => theme.colors.primaryLight};
        color: ${({ theme }) => theme.colors.primaryAccent};
        border: 1px solid rgba(13, 148, 136, 0.3);
      `;
  }
};

const StyledBadge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.radii.full};
  white-space: nowrap;
  letter-spacing: 0.02em;

  ${({ size }) =>
    size === 'sm'
      ? css`
          padding: 0.15rem 0.5rem;
          font-size: 0.7rem;
        `
      : css`
          padding: 0.3rem 0.75rem;
          font-size: 0.75rem;
        `}

  ${({ variant }) => getVariantStyles(variant)}
`;

export const Badge: React.FC<BadgeProps> = ({
  children,
  icon,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  return (
    <StyledBadge variant={variant} size={size} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </StyledBadge>
  );
};

export default Badge;
