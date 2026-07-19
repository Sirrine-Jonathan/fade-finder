'use client';

import React from 'react';
import styled from 'styled-components';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

const SelectWrapper = styled.div`
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

const StyledSelect = styled.select<{ hasError: boolean }>`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ hasError, theme }) => (hasError ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.6rem 0.85rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    border-color: ${({ hasError, theme }) => (hasError ? theme.colors.danger : theme.colors.primary)};
  }

  option {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const ErrorText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 500;
`;

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  children,
  className,
  ...props
}) => {
  return (
    <SelectWrapper className={className}>
      {label && <Label>{label}</Label>}
      <StyledSelect hasError={!!error} {...props}>
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </StyledSelect>
      {error && <ErrorText>{error}</ErrorText>}
    </SelectWrapper>
  );
};

export default Select;
