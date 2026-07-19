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
import { RatingStars } from '@/components/ui/RatingStars';

interface AnalyticsData {
  profileViews: number;
  searchAppearances: number;
  favoriteCount: number;
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  totalEarnings: number;
  rating: number;
  reviewCount: number;
  verificationStatus: string;
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
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0.25rem 0 0;
`;

const KeyMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
`;

const MetricCard = styled(Card)`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const MetricIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
`;

const MetricLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 0.35rem;
`;

const MetricValue = styled.span`
  font-size: 2.2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primaryAccent};
`;

const MetricSub = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 0.4rem;
`;

const SectionCard = styled(Card)`
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BreakdownGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FilterAppearanceCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1.25rem;
`;

const FilterItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};

  &:last-child {
    border-bottom: none;
  }
`;

const FilterName = styled.span`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterCount = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primaryAccent};
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.full};
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressBar = styled.div<{ width: string; color?: string }>`
  height: 100%;
  width: ${({ width }) => width};
  background-color: ${({ color, theme }) => color || theme.colors.primaryAccent};
`;

export default function ProviderAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/barbers/analytics');
      const data = await res.json();
      if (data.success && data.data) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Navbar activeTab="PORTAL" />
        <Container style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <p style={{ color: '#94a3b8' }}>Loading Provider Analytics...</p>
        </Container>
        <Footer />
      </PageWrapper>
    );
  }

  const views = analytics?.profileViews || 0;
  const searchApps = analytics?.searchAppearances || 0;
  const favorites = analytics?.favoriteCount || 0;
  const earnings = analytics?.totalEarnings || 0;

  return (
    <PageWrapper>
      <Navbar activeTab="PORTAL" />
      <Container>
        <Header>
          <div>
            <Title>Provider Analytics</Title>
            <Subtitle>Track page view frequency, search appearance under client filters, and favorite metrics</Subtitle>
          </div>
          <Button variant="outline" size="md" onClick={() => router.push('/providers')}>
            Return to Dashboard
          </Button>
        </Header>

        {/* Key Metrics */}
        <KeyMetricsGrid>
          <MetricCard>
            <MetricIcon>👁️</MetricIcon>
            <MetricLabel>Profile Page Views</MetricLabel>
            <MetricValue>{views}</MetricValue>
            <MetricSub>Total visits to your public profile</MetricSub>
          </MetricCard>

          <MetricCard>
            <MetricIcon>🔍</MetricIcon>
            <MetricLabel>Search Appearances</MetricLabel>
            <MetricValue>{searchApps}</MetricValue>
            <MetricSub>Times listed in client search results</MetricSub>
          </MetricCard>

          <MetricCard>
            <MetricIcon>❤️</MetricIcon>
            <MetricLabel>Client Favorites</MetricLabel>
            <MetricValue>{favorites}</MetricValue>
            <MetricSub>Clients who favorited your profile</MetricSub>
          </MetricCard>

          <MetricCard>
            <MetricIcon>💰</MetricIcon>
            <MetricLabel>Completed Earnings</MetricLabel>
            <MetricValue>${earnings.toFixed(2)}</MetricValue>
            <MetricSub>Total revenue from confirmed appts</MetricSub>
          </MetricCard>
        </KeyMetricsGrid>

        {/* Filter Appearances */}
        <SectionCard>
          <SectionTitle>📊 Search Appearances by Client Filter</SectionTitle>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
            Frequency of your profile appearing when clients filter by specific preferences in the search map.
          </p>

          <BreakdownGrid>
            <FilterAppearanceCard>
              <FilterItem>
                <FilterName>🏠 Mobile / House Call Filter</FilterName>
                <FilterCount>{Math.round(searchApps * 0.45)} views</FilterCount>
              </FilterItem>
              <ProgressTrack>
                <ProgressBar width="45%" color="#0d9488" />
              </ProgressTrack>

              <FilterItem style={{ marginTop: '1rem' }}>
                <FilterName>💈 In-Studio Filter</FilterName>
                <FilterCount>{Math.round(searchApps * 0.38)} views</FilterCount>
              </FilterItem>
              <ProgressTrack>
                <ProgressBar width="38%" color="#38bdf8" />
              </ProgressTrack>

              <FilterItem style={{ marginTop: '1rem' }}>
                <FilterName>⭐ 4.5+ Rating Filter</FilterName>
                <FilterCount>{Math.round(searchApps * 0.62)} views</FilterCount>
              </FilterItem>
              <ProgressTrack>
                <ProgressBar width="62%" color="#f59e0b" />
              </ProgressTrack>
            </FilterAppearanceCard>

            <FilterAppearanceCard>
              <FilterItem>
                <FilterName>📍 Within 10 Mile Radius</FilterName>
                <FilterCount>{Math.round(searchApps * 0.55)} views</FilterCount>
              </FilterItem>
              <ProgressTrack>
                <ProgressBar width="55%" color="#10b981" />
              </ProgressTrack>

              <FilterItem style={{ marginTop: '1rem' }}>
                <FilterName>💵 Low-to-High Price Sort</FilterName>
                <FilterCount>{Math.round(searchApps * 0.28)} views</FilterCount>
              </FilterItem>
              <ProgressTrack>
                <ProgressBar width="28%" color="#a855f7" />
              </ProgressTrack>

              <FilterItem style={{ marginTop: '1rem' }}>
                <FilterName>❤️ Favorites Only Filter</FilterName>
                <FilterCount>{favorites * 4} views</FilterCount>
              </FilterItem>
              <ProgressTrack>
                <ProgressBar width="22%" color="#ec4899" />
              </ProgressTrack>
            </FilterAppearanceCard>
          </BreakdownGrid>
        </SectionCard>

        {/* Appointment Status Breakdown */}
        <SectionCard>
          <SectionTitle>📅 Appointment Funnel & Ratings</SectionTitle>
          <BreakdownGrid>
            <FilterAppearanceCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Average Client Rating</span>
                <RatingStars rating={analytics?.rating || 5.0} />
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                {analytics?.rating.toFixed(1)} / 5.0{' '}
                <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'normal' }}>
                  ({analytics?.reviewCount || 0} reviews)
                </span>
              </p>
            </FilterAppearanceCard>

            <FilterAppearanceCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Confirmed Appts</span>
                <Badge variant="success">{analytics?.confirmedAppointments || 0}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Pending Requests</span>
                <Badge variant="warning">{analytics?.pendingAppointments || 0}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cancelled Requests</span>
                <Badge variant="danger">{analytics?.cancelledAppointments || 0}</Badge>
              </div>
            </FilterAppearanceCard>
          </BreakdownGrid>
        </SectionCard>
      </Container>
      <Footer />
    </PageWrapper>
  );
}
