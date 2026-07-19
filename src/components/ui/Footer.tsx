'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const FooterWrapper = styled.footer`
  background-color: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 2.5rem 1.25rem 1.5rem 1.25rem;
  margin-top: 4rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FooterBrand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.primary};
`;

const BrandTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const ColumnTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 0.25rem;
`;

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryAccent};
  }
`;

const BottomRow = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Footer: React.FC = () => {
  return (
    <FooterWrapper>
      <Container>
        <FooterBrand>
          <LogoRow>
            <LogoImg src="/logo.png" alt="Fade Finder" />
            <BrandTitle>Fade Finder</BrandTitle>
          </LogoRow>
          <p style={{ lineHeight: 1.4 }}>
            Connecting clients with verified local barbers for house calls and studio haircuts on demand.
          </p>
        </FooterBrand>

        <Column>
          <ColumnTitle>For Clients</ColumnTitle>
          <FooterLink href="/search">Find Barbers</FooterLink>
          <FooterLink href="/login">Client Login</FooterLink>
          <FooterLink href="/register">Sign Up Free</FooterLink>
        </Column>

        <Column>
          <ColumnTitle>For Barbers</ColumnTitle>
          <FooterLink href="/providers">Barber Overview</FooterLink>
          <FooterLink href="/providers/register">Become a Provider</FooterLink>
          <FooterLink href="/providers/login">Provider Portal</FooterLink>
        </Column>

        <Column>
          <ColumnTitle>Admin & Legal</ColumnTitle>
          <FooterLink href="/admin">Admin Login</FooterLink>
          <FooterLink href="/admin/settings">Admin Settings</FooterLink>
        </Column>
      </Container>

      <BottomRow>
        <div>&copy; {new Date().getFullYear()} Fade Finder. All rights reserved.</div>
        <div>Mobile House Calls & Studio Cuts</div>
      </BottomRow>
    </FooterWrapper>
  );
};

export default Footer;
