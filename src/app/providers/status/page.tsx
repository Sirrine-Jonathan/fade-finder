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
import {
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  ShieldCheck,
  UserCheck,
  Award,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

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
  max-width: 950px;
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
  position: relative;
  overflow: hidden;
`;

const TrackerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 3rem 0 3.5rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }
`;

const ProgressBarBackground = styled.div`
  position: absolute;
  top: 24px;
  left: 50px;
  right: 50px;
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
  z-index: 1;

  @media (max-width: 640px) {
    top: 24px;
    left: 24px;
    bottom: 24px;
    right: auto;
    width: 4px;
    height: auto;
  }
`;

const ProgressBarFill = styled.div<{ $progress: number; $isRejected?: boolean }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ $isRejected, theme }) =>
    $isRejected
      ? theme.colors.danger
      : `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.primaryAccent} 100%)`};
  transition: width 0.5s ease;

  @media (max-width: 640px) {
    width: 100%;
    height: ${({ $progress }) => $progress}%;
  }
`;

const StepItem = styled.div<{ $active: boolean; $completed: boolean; $rejected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;

  @media (max-width: 640px) {
    flex-direction: row;
    gap: 1rem;
    width: 100%;
  }
`;

const StepIcon = styled.div<{ $active: boolean; $completed: boolean; $rejected?: boolean }>`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: ${({ $active, $completed, $rejected, theme }) =>
    $rejected
      ? theme.colors.danger
      : $completed
      ? theme.colors.primary
      : $active
      ? theme.colors.surface
      : theme.colors.background};
  border: 3px solid
    ${({ $active, $completed, $rejected, theme }) =>
      $rejected
        ? theme.colors.danger
        : $completed
        ? theme.colors.primaryAccent
        : $active
        ? theme.colors.accent
        : theme.colors.border};
  color: ${({ $active, $completed, $rejected, theme }) =>
    $rejected || $completed ? '#ffffff' : $active ? theme.colors.accent : theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  box-shadow: ${({ $active, $completed, theme }) =>
    $active || $completed ? theme.shadows.glow : 'none'};
  transition: all 0.3s ease;

  @media (max-width: 640px) {
    margin-bottom: 0;
    flex-shrink: 0;
  }
`;

const StepTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (max-width: 640px) {
    align-items: flex-start;
    text-align: left;
  }
`;

const StepTitle = styled.span<{ $active: boolean; $completed: boolean }>`
  font-size: 0.9rem;
  font-weight: ${({ $active, $completed }) => ($active || $completed ? '700' : '600')};
  color: ${({ $active, $completed, theme }) =>
    $completed
      ? theme.colors.primaryAccent
      : $active
      ? theme.colors.textPrimary
      : theme.colors.textMuted};
`;

const StepSubtitle = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.2rem;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
`;

const DetailCard = styled.div<{ $highlight?: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ $highlight, theme }) => ($highlight ? theme.colors.primary : theme.colors.cardBorder)};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.25rem;
`;

const DetailCardTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: ${({ theme }) => theme.colors.primaryAccent};
  }
`;

const DetailCardText = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
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

  const status = barber?.verificationStatus || 'PENDING';

  let progressPercentage = 33;
  if (status === 'PENDING') progressPercentage = 66;
  if (status === 'APPROVED') progressPercentage = 100;
  if (status === 'REJECTED') progressPercentage = 66;

  if (loading) {
    return (
      <PageWrapper>
        <Navbar activeTab="PORTAL" />
        <Container style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <Clock size={40} style={{ color: '#0d9488', animation: 'spin 1.5s linear infinite' }} />
          <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Checking verification status...</p>
        </Container>
        <Footer />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar activeTab="PORTAL" />
      <Container data-testid="provider-status-tracker">
        <Header>
          <Title>Provider Application Status</Title>
          <Subtitle>Track the real-time progress of your DOPL license verification</Subtitle>
        </Header>

        <StatusCard>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Utah DOPL License: <strong style={{ color: '#f8fafc' }}>{barber?.licenseNumber || 'NOT SUBMITTED'}</strong>
              </p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0 0' }}>
                {barber?.user.firstName} {barber?.user.lastName}
              </h2>
            </div>

            <Badge
              variant={status === 'APPROVED' ? 'success' : status === 'PENDING' ? 'warning' : 'danger'}
              style={{ fontSize: '0.9rem', padding: '0.4rem 0.9rem' }}
            >
              STATUS: {status}
            </Badge>
          </div>

          {/* 4-Step Progress Tracker */}
          <TrackerWrapper>
            <ProgressBarBackground>
              <ProgressBarFill $progress={progressPercentage} $isRejected={status === 'REJECTED'} />
            </ProgressBarBackground>

            {/* Step 1: Account Created */}
            <StepItem $active={false} $completed={true} data-testid="step-1">
              <StepIcon $active={false} $completed={true}>
                <UserCheck size={22} />
              </StepIcon>
              <StepTextGroup>
                <StepTitle $active={false} $completed={true}>
                  1. Account Created
                </StepTitle>
                <StepSubtitle>Profile registered</StepSubtitle>
              </StepTextGroup>
            </StepItem>

            {/* Step 2: DOPL License Submitted */}
            <StepItem $active={false} $completed={true} data-testid="step-2">
              <StepIcon $active={false} $completed={true}>
                <FileCheck size={22} />
              </StepIcon>
              <StepTextGroup>
                <StepTitle $active={false} $completed={true}>
                  2. DOPL License
                </StepTitle>
                <StepSubtitle>License logged</StepSubtitle>
              </StepTextGroup>
            </StepItem>

            {/* Step 3: Admin Reviewing */}
            <StepItem
              $active={status === 'PENDING'}
              $completed={status === 'APPROVED'}
              $rejected={status === 'REJECTED'}
              data-testid="step-3"
            >
              <StepIcon
                $active={status === 'PENDING'}
                $completed={status === 'APPROVED'}
                $rejected={status === 'REJECTED'}
              >
                {status === 'APPROVED' ? (
                  <CheckCircle2 size={22} />
                ) : status === 'REJECTED' ? (
                  <XCircle size={22} />
                ) : (
                  <Clock size={22} />
                )}
              </StepIcon>
              <StepTextGroup>
                <StepTitle $active={status === 'PENDING'} $completed={status === 'APPROVED'}>
                  3. Admin Review
                </StepTitle>
                <StepSubtitle>
                  {status === 'PENDING'
                    ? 'In Review'
                    : status === 'APPROVED'
                    ? 'Verified'
                    : 'Action Needed'}
                </StepSubtitle>
              </StepTextGroup>
            </StepItem>

            {/* Step 4: Approved & Live */}
            <StepItem $active={false} $completed={status === 'APPROVED'} data-testid="step-4">
              <StepIcon $active={false} $completed={status === 'APPROVED'}>
                <Award size={22} />
              </StepIcon>
              <StepTextGroup>
                <StepTitle $active={false} $completed={status === 'APPROVED'}>
                  4. Approved & Live
                </StepTitle>
                <StepSubtitle>Publicly Searchable</StepSubtitle>
              </StepTextGroup>
            </StepItem>
          </TrackerWrapper>

          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              backgroundColor:
                status === 'APPROVED'
                  ? 'rgba(16, 185, 129, 0.1)'
                  : status === 'REJECTED'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${
                status === 'APPROVED'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : status === 'REJECTED'
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(245, 158, 11, 0.3)'
              }`,
              textAlign: 'center',
            }}
          >
            {status === 'APPROVED' && (
              <p style={{ margin: 0, color: '#10b981', fontWeight: 600 }}>
                 Congratulations! Your provider account is fully verified and live on Fade Finder.
              </p>
            )}
            {status === 'PENDING' && (
              <p style={{ margin: 0, color: '#f59e0b', fontWeight: 600 }}>
                ⏳ Your DOPL license verification is currently under review by our admin team (24-48 hrs).
              </p>
            )}
            {status === 'REJECTED' && (
              <p style={{ margin: 0, color: '#ef4444', fontWeight: 600 }}>
                 Action Required: Additional DOPL license verification is required. Please contact support.
              </p>
            )}
          </div>
        </StatusCard>

        {/* Step Breakdown Cards */}
        <DetailsGrid>
          <DetailCard $highlight={status === 'PENDING'}>
            <DetailCardTitle>
              <ShieldCheck size={20} /> License Validation
            </DetailCardTitle>
            <DetailCardText>
              Our admin team cross-references your license number with Utah DOPL database records to confirm active standing.
            </DetailCardText>
          </DetailCard>

          <DetailCard>
            <DetailCardTitle>
              <FileCheck size={20} /> Profile Setup
            </DetailCardTitle>
            <DetailCardText>
              Set up your studio address, house-call coverage radius, services, and working hours in the Private Profile Manager.
            </DetailCardText>
          </DetailCard>

          <DetailCard>
            <DetailCardTitle>
              <HelpCircle size={20} /> Provider Support
            </DetailCardTitle>
            <DetailCardText>
              Have questions about your verification? Email us anytime at support@fadefinder.com for expedited assistance.
            </DetailCardText>
          </DetailCard>
        </DetailsGrid>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Button variant="primary" size="lg" onClick={() => router.push('/providers/profile/private')}>
            Manage Barber Profile <ArrowRight size={18} style={{ marginLeft: 6 }} />
          </Button>
        </div>
      </Container>
      <Footer />
    </PageWrapper>
  );
}
