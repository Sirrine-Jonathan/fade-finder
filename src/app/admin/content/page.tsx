'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LayoutDashboard, Settings, FileText, Image, Layout, ChevronRight, Monitor, Edit3 } from 'lucide-react';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Main = styled.main`
  flex: 1;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PageSubtitle = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 2rem;
`;

const AdminNav = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const NavPill = styled(Link)<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  background: ${({ active, theme }) => active ? theme.colors.primaryLight : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.primaryAccent : theme.colors.textSecondary};
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all ${({ theme }) => theme.transitions.fast};
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
`;

const ContentCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.xl};
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const ContentIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primaryAccent};
  flex-shrink: 0;
`;

const ContentMeta = styled.div`flex: 1;`;
const ContentTitle = styled.div`font-weight: 700; font-size: 0.95rem; margin-bottom: 0.2rem;`;
const ContentDesc = styled.div`font-size: 0.8rem; color: ${({ theme }) => theme.colors.textSecondary};`;

export default function AdminContentPage() {
  return (
    <PageWrapper>
      <Navbar activeTab="PORTAL" />
      <Main>
        <PageTitle>
          <FileText size={28} color="#0d9488" />
          Content Management
        </PageTitle>
        <PageSubtitle>Edit landing pages, marketing copy, and platform messaging</PageSubtitle>

        <AdminNav>
          <NavPill href="/admin">
            <LayoutDashboard size={14} /> Overview
          </NavPill>
          <NavPill href="/admin/settings">
            <Settings size={14} /> Settings
          </NavPill>
          <NavPill href="/admin/content" active>
            <FileText size={14} /> Content
          </NavPill>
        </AdminNav>

        <ContentGrid>
          <ContentCard href="/admin/content/landing" id="content-landing">
            <ContentIcon><Layout size={22} /></ContentIcon>
            <ContentMeta>
              <ContentTitle>Consumer Landing Page</ContentTitle>
              <ContentDesc>Hero headline, subtext, CTA buttons, feature highlights</ContentDesc>
            </ContentMeta>
            <ChevronRight size={16} color="#64748b" />
          </ContentCard>

          <ContentCard href="/admin/content/providers-landing" id="content-providers-landing">
            <ContentIcon><Monitor size={22} /></ContentIcon>
            <ContentMeta>
              <ContentTitle>Provider Landing Page</ContentTitle>
              <ContentDesc>Barber recruitment hero, benefits, pricing sections</ContentDesc>
            </ContentMeta>
            <ChevronRight size={16} color="#64748b" />
          </ContentCard>

          <ContentCard href="#" style={{ opacity: 0.55, pointerEvents: 'none' }} id="content-emails">
            <ContentIcon><Edit3 size={22} /></ContentIcon>
            <ContentMeta>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ContentTitle>Email Templates</ContentTitle>
                <Badge variant="info" size="sm">Soon</Badge>
              </div>
              <ContentDesc>Confirmation, reminder, and notification email copy</ContentDesc>
            </ContentMeta>
            <ChevronRight size={16} color="#64748b" />
          </ContentCard>

          <ContentCard href="#" style={{ opacity: 0.55, pointerEvents: 'none' }} id="content-media">
            <ContentIcon><Image size={22} /></ContentIcon>
            <ContentMeta>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ContentTitle>Media Library</ContentTitle>
                <Badge variant="info" size="sm">Soon</Badge>
              </div>
              <ContentDesc>Platform images, hero backgrounds, logo assets</ContentDesc>
            </ContentMeta>
            <ChevronRight size={16} color="#64748b" />
          </ContentCard>
        </ContentGrid>
      </Main>
      <Footer />
    </PageWrapper>
  );
}
