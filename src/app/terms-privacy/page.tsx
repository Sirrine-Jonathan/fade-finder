'use client';

import React from 'react';
import styled from 'styled-components';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Card } from '@/components/ui/Card';
import { FileText, Shield, Key, Eye } from 'lucide-react';

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

export default function TermsPrivacyPage() {
  return (
    <PageWrapper>
      <Navbar activeTab="CLIENT" />
      <Container>
        <HeaderSection>
          <Title>Terms of Service & Privacy Policy</Title>
          <Subtitle>
            Please read these terms carefully before using the Fade Finder platform.
          </Subtitle>
        </HeaderSection>

        <ContentCard>
          <SectionTitle>
            <FileText size={24} /> Terms of Service
          </SectionTitle>
          <Paragraph>
            Welcome to Fade Finder. These Terms of Service ("Terms") govern your access to and use of our platform, website, and services. By registering an account or making bookings, you agree to comply with and be bound by these Terms.
          </Paragraph>
          
          <SectionTitle>
            1. Platform Role
          </SectionTitle>
          <Paragraph>
            Fade Finder acts as a technology intermediary platform connecting independent barbers/cosmetologists ("Providers") with clients seeking hair services ("Clients"). We do not directly employ barbers, operate physical salons, or provide barber services ourselves.
          </Paragraph>

          <SectionTitle>
            2. Booking Contract & Payments
          </SectionTitle>
          <Paragraph>
            When a Client books an appointment, a direct agreement is established between the Client and the Provider. Clients agree to pay the rate corresponding to the location type (Studio vs. House Call) selected during booking, plus any applicable taxes or travel fees.
          </Paragraph>

          <SectionTitle>
            3. Cancellations & Fees
          </SectionTitle>
          <Paragraph>
            Cancellation policies are determined by independent Providers and displayed on their booking page. Clients agree to respect booking times. Cancellations made less than 24 hours before the scheduled appointment may be subject to fee penalties according to provider settings.
          </Paragraph>

          <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '2rem 0' }} />

          <SectionTitle>
            <Shield size={24} /> Privacy Policy
          </SectionTitle>
          <Paragraph>
            Your privacy is highly important to us. This Privacy Policy details how we collect, use, and protect your personal information when you use our platform.
          </Paragraph>

          <SectionTitle>
            1. Information Collection
          </SectionTitle>
          <Paragraph>
            We collect information that you provide to us directly:
          </Paragraph>
          <BulletList>
            <BulletItem>
              <strong>Profile Information:</strong> Name, email address, phone number, and profile picture.
            </BulletItem>
            <BulletItem>
              <strong>Location Data:</strong> GPS coordinates (if permitted) or typed address coordinates to calculate travel distance and matching travel radius boundaries.
            </BulletItem>
            <BulletItem>
              <strong>Booking Details:</strong> Date, time, services requested, and appointment notes.
            </BulletItem>
          </BulletList>

          <SectionTitle>
            2. How We Use Information
          </SectionTitle>
          <Paragraph>
            Your details are used solely to facilitate the core bookings and platform functionality:
          </Paragraph>
          <BulletList>
            <BulletItem>
              Sharing booking location addresses and contact details with the selected barber.
            </BulletItem>
            <BulletItem>
              Displaying local barbers matching your search location and filter settings.
            </BulletItem>
            <BulletItem>
              Sending appointment confirmations and safety notifications.
            </BulletItem>
          </BulletList>

          <SectionTitle>
            3. Security
          </SectionTitle>
          <Paragraph>
            We implement standard industry encryption (HTTPS/SSL) and secure hashing protocols to protect all user credentials, tokens, and location addresses from unauthorized access.
          </Paragraph>
        </ContentCard>
      </Container>
      <Footer />
    </PageWrapper>
  );
}
