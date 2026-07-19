'use client';

import React from 'react';
import styled from 'styled-components';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const InputContainer = styled.div<{ hasIcon: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  svg {
    position: absolute;
    left: 0.85rem;
    color: ${({ theme }) => theme.colors.textMuted};
    pointer-events: none;
  }
`;

const StyledInput = styled.input<{ hasIcon: boolean; hasError: boolean }>`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ hasError, theme }) => (hasError ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.75rem 1rem;
  padding-left: ${({ hasIcon }) => (hasIcon ? '2.5rem' : '1rem')};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.9rem;
  outline: none;
  transition: border-color ${({ theme }) => theme.transitions.fast}, box-shadow ${({ theme }) => theme.transitions.fast};

  &:focus {
    border-color: ${({ hasError, theme }) => (hasError ? theme.colors.danger : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${({ hasError, theme }) => (hasError ? 'rgba(239, 68, 68, 0.2)' : theme.colors.primaryLight)};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 500;
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <InputWrapper className={className}>
      {label && <Label>{label}</Label>}
      <InputContainer hasIcon={!!icon}>
        {icon}
        <StyledInput hasIcon={!!icon} hasError={!!error} {...props} />
      </InputContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  );
};

export default Input;
