'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface BarberData {
  id: string;
  slug: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  licenseNumber: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

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
  width: 100%;
  margin: 0 auto;
  padding: 3rem 1.25rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatusCard = styled(Card)`
  padding: 2.5rem;
  margin-bottom: 2rem;
`;

const TrackerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 2.5rem 0 3rem;

  &::before {
    content: '';
    position: absolute;
    top: 24px;
    left: 40px;
    right: 40px;
    height: 4px;
    background: ${({ theme }) => theme.colors.border};
    z-index: 1;
  }
`;

const StepItem = styled.div<{ active: boolean; completed: boolean; isRejected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
`;

const StepIcon = styled.div<{ active: boolean; completed: boolean; isRejected?: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ active, completed, isRejected, theme }) =>
    isRejected
      ? theme.colors.danger
      : completed
      ? theme.colors.primary
      : active
      ? theme.colors.accent
      : theme.colors.surface};
  border: 3px solid
    ${({ active, completed, isRejected, theme }) =>
      isRejected
        ? theme.colors.danger
        : completed
        ? theme.colors.primaryAccent
        : active
        ? theme.colors.warning
        : theme.colors.border};
  color: ${({ active, completed, theme }) => (completed || active ? '#ffffff' : theme.colors.textMuted)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  box-shadow: ${({ active, completed, theme }) =>
    active || completed ? theme.shadows.glow : 'none'};
`;

const StepLabel = styled.span<{ active: boolean; completed: boolean }>`
  font-size: 0.9rem;
  font-weight: ${({ active, completed }) => (active || completed ? '700' : '500')};
  color: ${({ active, completed, theme }) =>
    completed
      ? theme.colors.primaryAccent
      : active
      ? theme.colors.textPrimary
      : theme.colors.textMuted};
  text-align: center;
`;

const StepSub = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.2rem;
  text-align: center;
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InstructionsList = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
  line-height: 1.7;

  li {
    margin-bottom: 0.5rem;
  }
`;

const HelpSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(19, 31, 38, 0.6) 100%);
  border: 1px solid ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HelpText = styled.div``;

const HelpTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
`;

const HelpDesc = styled.p`
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

export default function VerificationStatusPage() {
  const router = useRouter();
  const [barber, setBarber] = useState<BarberData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarberStatus();
  }, []);

  const fetchBarberStatus = async () => {
    try {
      const res = await fetch('/api/barbers/private');
      const data = await res.json();
      if (data.success && data.data) {
        setBarber(data.data);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Navbar activeTab="PORTAL" />
        <Container style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <p style={{ color: '#94a3b8' }}>Checking verification status...</p>
        </Container>
        <Footer />
      </PageWrapper>
    );
  }

  const status = barber?.verificationStatus || 'PENDING';

  return (
    <PageWrapper>
      <Navbar activeTab="PORTAL" />
      <Container>
        <Header>
          <Title>Provider Verification Status</Title>
          <Subtitle>Track the progress of your barber account verification application</Subtitle>
        </Header>

        <StatusCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase' }}>
                Account License: {barber?.licenseNumber || 'PENDING-LIC'}
              </p>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0 0' }}>
                {barber?.user.firstName} {barber?.user.lastName}
              </h2>
            </div>
            <Badge
              variant={
                status === 'APPROVED' ? 'success' : status === 'PENDING' ? 'warning' : 'danger'
              }
            >
              STATUS: {status}
            </Badge>
          </div>

          {/* Tracker Bar */}
          <TrackerWrapper>
            <StepItem active={false} completed={true}>
              <StepIcon active={false} completed={true}>
                ✓
              </StepIcon>
              <StepLabel active={false} completed={true}>
                1. Submitted
              </StepLabel>
              <StepSub>Request Logged</StepSub>
            </StepItem>

            <StepItem
              active={status === 'PENDING'}
              completed={status === 'APPROVED'}
              isRejected={status === 'REJECTED'}
            >
              <StepIcon
                active={status === 'PENDING'}
                completed={status === 'APPROVED'}
                isRejected={status === 'REJECTED'}
              >
                {status === 'APPROVED' ? '✓' : status === 'REJECTED' ? '✕' : '2'}
              </StepIcon>
              <StepLabel active={status === 'PENDING'} completed={status === 'APPROVED'}>
                2. Admin Review
              </StepLabel>
              <StepSub>
                {status === 'PENDING' ? 'Under Review' : status === 'APPROVED' ? 'Verified' : 'Rejected'}
              </StepSub>
            </StepItem>

            <StepItem active={false} completed={status === 'APPROVED'}>
              <StepIcon active={false} completed={status === 'APPROVED'}>
                {status === 'APPROVED' ? '✓' : '3'}
              </StepIcon>
              <StepLabel active={false} completed={status === 'APPROVED'}>
                3. Public Profile Active
              </StepLabel>
              <StepSub>Visible in Search</StepSub>
            </StepItem>
          </TrackerWrapper>

          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0 }}>
              ⏱️ <strong>Expected Timeframe:</strong> Most verification applications are reviewed within{' '}
              <span style={{ color: '#2dd4bf', fontWeight: 600 }}>24 to 48 business hours</span>.
            </p>
          </div>
        </StatusCard>

        {/* Instructions */}
        <InfoBox>
          <InfoTitle>📝 What to do while waiting for approval</InfoTitle>
          <InstructionsList>
            <li>
              <strong>Configure Your Services & Dual Pricing:</strong> Define studio prices vs house-call rates in your private profile manager.
            </li>
            <li>
              <strong>Set Working Hours Availability:</strong> Specify days and hours you are open for appointments.
            </li>
            <li>
              <strong>Add Portfolio Images:</strong> Upload high quality photos of your haircuts to attract clients.
            </li>
            <li>
              <strong>Review Auto-Confirm Settings:</strong> Toggle whether client bookings are confirmed automatically or require manual acceptance.
            </li>
          </InstructionsList>
          <div style={{ marginTop: '1.5rem' }}>
            <Button variant="primary" size="md" onClick={() => router.push('/providers/profile/private')}>
              Go to Private Profile Manager
            </Button>
          </div>
        </InfoBox>

        {/* Support Help CTAs */}
        <HelpSection>
          <HelpText>
            <HelpTitle>Need Help or Have Questions?</HelpTitle>
            <HelpDesc>Contact the Fade Finder admin team for assistance with license documentation or account status.</HelpDesc>
          </HelpText>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="outline" size="sm" onClick={() => alert('Support email: support@fadefinder.com')}>
              Email Support
            </Button>
            <Button variant="secondary" size="sm" onClick={() => router.push('/providers')}>
              Return to Portal
            </Button>
          </div>
        </HelpSection>
      </Container>
      <Footer />
    </PageWrapper>
  );
}
