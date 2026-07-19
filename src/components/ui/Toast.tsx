'use client';

import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Sparkles, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string | null;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose?: () => void;
  duration?: number;
}

const getToastBg = (type: ToastProps['type'] = 'success') => {
  switch (type) {
    case 'error':
      return css`
        background-color: ${({ theme }) => theme.colors.danger};
      `;
    case 'warning':
      return css`
        background-color: ${({ theme }) => theme.colors.warning};
      `;
    case 'info':
      return css`
        background-color: ${({ theme }) => theme.colors.secondary};
      `;
    case 'success':
    default:
      return css`
        background-color: ${({ theme }) => theme.colors.primary};
      `;
  }
};

const ToastContainer = styled.div<{ type?: ToastProps['type'] }>`
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 300;
  padding: 0.75rem 1.25rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  color: #ffffff;
  font-weight: 700;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  backdrop-filter: blur(8px);
  animation: slideIn 0.3s ease-out;

  ${({ type }) => getToastBg(type)}

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem;
  margin-left: 0.5rem;

  &:hover {
    color: #ffffff;
  }
`;

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    if (message && duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <ToastContainer type={type}>
      {type === 'success' && <Sparkles size={18} />}
      {type === 'error' && <AlertCircle size={18} />}
      {type === 'warning' && <AlertCircle size={18} />}
      {type === 'info' && <Info size={18} />}
      <span>{message}</span>
      {onClose && (
        <CloseBtn onClick={onClose} aria-label="Close Toast">
          <X size={16} />
        </CloseBtn>
      )}
    </ToastContainer>
  );
};

export default Toast;
