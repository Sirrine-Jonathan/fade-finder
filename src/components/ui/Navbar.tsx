'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

export interface NavTab {
  id: string;
  label: string;
  count?: number;
  href?: string;
}

export interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  tabs?: NavTab[];
  showAdminLink?: boolean;
}

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.9rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BrandLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
`;

const LogoImage = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  object-fit: cover;
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
  }
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const NavControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 0.25rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 0.4rem 0.9rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background-color: ${({ active, theme }) => (active ? theme.colors.primary : 'transparent')};
  color: ${({ active, theme }) => (active ? '#ffffff' : theme.colors.textSecondary)};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'CLIENT',
  onTabChange,
  tabs = [
    { id: 'CLIENT', label: 'Find Barbers' },
    { id: 'BOOKINGS', label: 'Bookings' },
    { id: 'PORTAL', label: 'Barber Portal' },
  ],
}) => {
  return (
    <HeaderWrapper>
      <Container>
        <BrandLink href="/">
          <LogoImage src="/logo.png" alt="Fade Finder Logo" />
          <BrandText>
            <Title>FADE FINDER</Title>
            <Subtitle>Local Barbers. On Demand.</Subtitle>
          </BrandText>
        </BrandLink>

        <NavControls>
          <TabContainer>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TabButton
                  key={tab.id}
                  active={isActive}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                >
                  {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
                </TabButton>
              );
            })}
          </TabContainer>
        </NavControls>
      </Container>
    </HeaderWrapper>
  );
};

export default Navbar;
