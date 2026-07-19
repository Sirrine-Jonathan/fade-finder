'use client';

import React from 'react';
import styled, { css } from 'styled-components';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const getVariantStyles = (variant: ButtonProps['variant'] = 'primary') => {
  switch (variant) {
    case 'secondary':
      return css`
        background-color: ${({ theme }) => theme.colors.surface};
        color: ${({ theme }) => theme.colors.textPrimary};
        border: 1px solid ${({ theme }) => theme.colors.border};

        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.surfaceHover};
          border-color: ${({ theme }) => theme.colors.primary};
        }
      `;
    case 'outline':
      return css`
        background-color: transparent;
        color: ${({ theme }) => theme.colors.primaryAccent};
        border: 1px solid ${({ theme }) => theme.colors.primary};

        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.primaryLight};
        }
      `;
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${({ theme }) => theme.colors.textSecondary};
        border: 1px solid transparent;

        &:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.05);
          color: ${({ theme }) => theme.colors.textPrimary};
        }
      `;
    case 'danger':
      return css`
        background-color: ${({ theme }) => theme.colors.danger};
        color: #ffffff;
        border: 1px solid transparent;

        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.dangerHover};
        }
      `;
    case 'primary':
    default:
      return css`
        background-color: ${({ theme }) => theme.colors.primary};
        color: #ffffff;
        border: 1px solid transparent;

        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.primaryHover};
          box-shadow: ${({ theme }) => theme.shadows.glow};
        }
      `;
  }
};

const getSizeStyles = (size: ButtonProps['size'] = 'md') => {
  switch (size) {
    case 'sm':
      return css`
        padding: 0.35rem 0.75rem;
        font-size: 0.8rem;
        border-radius: ${({ theme }) => theme.radii.sm};
      `;
    case 'lg':
      return css`
        padding: 0.85rem 1.75rem;
        font-size: 1.05rem;
        border-radius: ${({ theme }) => theme.radii.lg};
      `;
    case 'md':
    default:
      return css`
        padding: 0.6rem 1.25rem;
        font-size: 0.9rem;
        border-radius: ${({ theme }) => theme.radii.md};
      `;
  }
};

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  outline: none;

  ${({ variant }) => getVariantStyles(variant)}
  ${({ size }) => getSizeStyles(size)}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  icon,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  return (
    <StyledButton variant={variant} size={size} fullWidth={fullWidth} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </StyledButton>
  );
};

export default Button;
