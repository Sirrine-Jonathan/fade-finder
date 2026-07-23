'use client';

import React from 'react';
import styled from 'styled-components';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Card } from '@/components/ui/Card';
import { Shield, FileText, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Container = styled.main`
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 1.25rem;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #f8fafc 0%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  max-width: 650px;
  margin: 0 auto;
`;

const ContentCard = styled(Card)`
  padding: 2.5rem;
  margin-bottom: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.card};
  line-height: 1.7;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.primaryAccent};
`;

const Paragraph = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1.25rem;
  font-size: 0.975rem;
`;

const BulletList = styled.ul`
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
`;

const BulletItem = styled.li`
  margin-bottom: 0.5rem;
`;

const InfoBox = styled.div`
  background-color: ${({ theme }) => theme.colors.primaryLight};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  padding: 1.25rem;
  border-radius: ${({ theme }) => theme.radii.md};
  margin: 1.5rem 0;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const InfoText = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.5;
`;

export default function DoplStandardsPage() {
  return (
    <PageWrapper>
      <Navbar activeTab="CLIENT" />
      <Container>
        <HeaderSection>
          <Title>Utah DOPL License Standards</Title>
          <Subtitle>
            Maintaining the highest safety, hygiene, and verification standards for mobile and studio barbering.
          </Subtitle>
        </HeaderSection>

        <ContentCard>
          <SectionTitle>
            <Shield size={24} /> Utah DOPL Requirements Overview
          </SectionTitle>
          <Paragraph>
            The Division of Professional Licensing (DOPL) regulates the practice of barbering and cosmetology in the state of Utah. To ensure customer safety, health, and service quality, every barber profile on Fade Finder is cross-verified with official state databases before being allowed to accept bookings.
          </Paragraph>

          <InfoBox>
            <FileText size={20} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
            <InfoText>
              <strong>Important Notice:</strong> Under Utah Code Title 58, Chapter 11a, it is unlawful to offer or provide barbering services for compensation without an active and valid license issued by DOPL, except in specified exempt conditions.
            </InfoText>
          </InfoBox>

          <SectionTitle>
            <CheckCircle2 size={24} /> Barber Licensing Requirements
          </SectionTitle>
          <Paragraph>
            To receive a verified DOPL badge on Fade Finder, barbers must upload their license number and show proof of:
          </Paragraph>
          <BulletList>
            <BulletItem>
              Completion of an approved barber school program (minimum 1,000 hours) or equivalent apprenticeship.
            </BulletItem>
            <BulletItem>
              Successful completion of both the practical and theory examinations administered by DOPL.
            </BulletItem>
            <BulletItem>
              An active status license in good standing, with no active suspensions, revocations, or probation.
            </BulletItem>
          </BulletList>

          <SectionTitle>
            <AlertTriangle size={24} /> Sanitation & Mobile Service Safety
          </SectionTitle>
          <Paragraph>
            When performing mobile house calls, providers must strictly adhere to the Utah Administrative Code R156-11a sanitation rules:
          </Paragraph>
          <BulletList>
            <BulletItem>
              <strong>Sanitization of Tools:</strong> All shears, clippers, guards, combs, and razors must be fully sanitized using an EPA-registered hospital-grade disinfectant before every appointment.
            </BulletItem>
            <BulletItem>
              <strong>Single-Use Items:</strong> Neck strips, protective towels, and disposable blades must be single-use and properly discarded immediately after the service.
            </BulletItem>
            <BulletItem>
              <strong>Clean Environment:</strong> Mobile barbers are responsible for setting up in a clean area, using protective mats to catch hair, and leaving the client's home or office clean and tidy.
            </BulletItem>
          </BulletList>

          <SectionTitle>
            <Users size={24} /> Verification Process
          </SectionTitle>
          <Paragraph>
            Fade Finder verifies every professional's license on signup using a multi-step check:
          </Paragraph>
          <BulletList>
            <BulletItem>
              License number validation against the official Utah DOPL public license lookup database.
            </BulletItem>
            <BulletItem>
              Matching the licensee name with the legal government ID submitted during registration.
            </BulletItem>
            <BulletItem>
              Periodic re-verification checks to ensure the license remains active and valid over time.
            </BulletItem>
          </BulletList>
          <Paragraph>
            If you have any questions or notice an issue with a provider's credentials, please contact support immediately.
          </Paragraph>
        </ContentCard>
      </Container>
      <Footer />
    </PageWrapper>
  );
}
