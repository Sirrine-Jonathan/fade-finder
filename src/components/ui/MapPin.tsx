'use client';

import React from 'react';
import styled from 'styled-components';
import { MapPin as MapPinIcon, Home, Scissors } from 'lucide-react';

export interface MapPinProps {
  label?: string;
  isStudio?: boolean;
  distanceMiles?: number | null;
  active?: boolean;
  onClick?: () => void;
}

const PinContainer = styled.div<{ active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ active, theme }) => (active ? '#ffffff' : theme.colors.textPrimary)};
  border: 1px solid ${({ active, theme }) => (active ? theme.colors.primaryAccent : theme.colors.border)};
  padding: 0.35rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const DistanceText = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 500;
`;

export const MapPin: React.FC<MapPinProps> = ({
  label,
  isStudio = true,
  distanceMiles,
  active = false,
  onClick,
}) => {
  return (
    <PinContainer active={active} onClick={onClick}>
      {isStudio ? <Scissors size={14} /> : <Home size={14} />}
      {label && <span>{label}</span>}
      {distanceMiles !== undefined && distanceMiles !== null && (
        <DistanceText>{distanceMiles} mi</DistanceText>
      )}
    </PinContainer>
  );
};

export default MapPin;
