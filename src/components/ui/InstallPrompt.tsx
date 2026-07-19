'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import Button from './Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone) {
      setIsStandalone(true);
      return;
    }

    // Check localStorage dismissal persistence
    const dismissed = localStorage.getItem('pwa_install_dismissed') === 'true';
    if (!dismissed) {
      setIsDismissed(false);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!dismissed) {
        setIsDismissed(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install Fade Finder, use your browser options menu and tap "Add to Home Screen" or "Install App".');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <Container>
      <ContentRow>
        <IconWrapper>
          <Smartphone size={24} color="#0d9488" />
        </IconWrapper>
        <TextSection>
          <Title>
            Install Fade Finder App <Sparkles size={14} color="#f59e0b" />
          </Title>
          <Description>
            Add Fade Finder to your home screen for fast booking, offline support, and mobile push notifications.
          </Description>
        </TextSection>
        <ActionSection>
          <Button size="sm" variant="primary" icon={<Download size={15} />} onClick={handleInstallClick}>
            Install App
          </Button>
          <CloseButton onClick={handleDismiss} title="Dismiss Install Banner" aria-label="Dismiss Install Banner">
            <X size={18} />
          </CloseButton>
        </ActionSection>
      </ContentRow>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 1.5rem auto;
  padding: 0.9rem 1.25rem;
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(19, 31, 38, 0.9) 100%);
  border: 1px solid rgba(13, 148, 136, 0.4);
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const ContentRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const IconWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.primaryLight};
  padding: 0.65rem;
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextSection = styled.div`
  flex: 1;
`;

const Title = styled.h4`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.2rem 0;
`;

const Description = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const ActionSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export default InstallPrompt;
