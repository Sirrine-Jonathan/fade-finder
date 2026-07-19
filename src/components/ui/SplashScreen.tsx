'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

export interface SplashScreenProps {
  appName?: string;
  tagline?: string;
  logoUrl?: string;
  durationMs?: number;
}

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(13, 148, 136, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(13, 148, 136, 0);
  }
`;

const SplashOverlay = styled.div<{ visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  transition: opacity 0.4s ease-out, visibility 0.4s ease-out;
`;

const LogoContainer = styled.div`
  margin-bottom: 1.5rem;
  border-radius: 50%;
  padding: 8px;
  background: radial-gradient(circle, rgba(13, 148, 136, 0.2) 0%, transparent 70%);
  animation: ${pulse} 2s infinite;
`;

const SplashLogo = styled.img`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.primary};
  object-fit: cover;
`;

const AppTitle = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.025em;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 0.4rem;
`;

const Tagline = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.primaryAccent};
  font-weight: 600;
  letter-spacing: 0.05em;
`;

export const SplashScreen: React.FC<SplashScreenProps> = ({
  appName = 'FADE FINDER',
  tagline = 'Local Barbers. On Demand.',
  logoUrl = '/logo.png',
  durationMs = 1200,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  if (!visible) return null;

  return (
    <SplashOverlay visible={visible}>
      <LogoContainer>
        <SplashLogo src={logoUrl} alt={appName} />
      </LogoContainer>
      <AppTitle>{appName}</AppTitle>
      <Tagline>{tagline}</Tagline>
    </SplashOverlay>
  );
};

export default SplashScreen;
