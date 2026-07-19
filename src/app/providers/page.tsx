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
import { Toast } from '@/components/ui/Toast';

interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  barberProfile?: {
    id: string;
    slug: string;
    bio: string;
    verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    autoConfirmBookings: boolean;
    rating: number;
    reviewCount: number;
  } | null;
}

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  locationType: 'STUDIO' | 'HOUSE_CALL';
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  clientAddress?: string | null;
  notes?: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
  };
  service: {
    id: string;
    name: string;
    durationMinutes: number;
  };
}

interface AnalyticsOverview {
  profileViews: number;
  searchAppearances: number;
  favoriteCount: number;
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  totalEarnings: number;
}

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
`;

/* Unauthenticated Landing Styles */
const HeroSection = styled.div`
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.25) 0%, rgba(19, 31, 38, 0.8) 100%);
  border: 1px solid ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 3.5rem 2rem;
  text-align: center;
  margin-bottom: 3rem;
  box-shadow: ${({ theme }) => theme.shadows.glow};
`;

const HeroTitle = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.textPrimary};

  span {
    color: ${({ theme }) => theme.colors.primaryAccent};
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const HeroButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const SectionHeading = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const SectionSub = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
`;

const ProcessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
`;

const ProcessCard = styled(Card)`
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StepBadge = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primaryAccent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.primary};
`;

const StepTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
`;

const StepDesc = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
`;

const FeatureCard = styled(Card)`
  padding: 1.75rem;
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h4`
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const FeatureText = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

/* Authenticated Dashboard Styles */
const WelcomeBanner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const WelcomeText = styled.div``;

const WelcomeTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const WelcomeSub = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
`;

const VerificationAlert = styled.div<{ status: string }>`
  background-color: ${({ status, theme }) =>
    status === 'PENDING'
      ? theme.colors.accentLight
      : status === 'REJECTED'
      ? 'rgba(239, 68, 68, 0.15)'
      : theme.colors.primaryLight};
  border: 1px solid
    ${({ status, theme }) =>
      status === 'PENDING'
        ? theme.colors.warning
        : status === 'REJECTED'
        ? theme.colors.danger
        : theme.colors.success};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const AlertText = styled.div`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  strong {
    font-weight: 700;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
`;

const StatCard = styled(Card)`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.span`
  font-size: 1.8rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primaryAccent};
`;

const NavLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 3rem;
`;

const NavCard = styled(Link)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const NavCardIcon = styled.div`
  font-size: 1.5rem;
`;

const NavCardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
`;

const NavCardDesc = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const AppointmentsSection = styled.section`
  margin-bottom: 3rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const AppointmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AppointmentCard = styled(Card)`
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ClientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primaryAccent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  border: 1px solid ${({ theme }) => theme.colors.primary};
`;

const ClientMeta = styled.div``;

const ClientName = styled.h4`
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
`;

const ServiceDetails = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const ApptTiming = styled.div`
  text-align: right;
  @media (max-width: 600px) {
    text-align: left;
  }
`;

const ApptTime = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
`;

const ApptPrice = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.primaryAccent};
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FeedPreviewCard = styled(Card)`
  padding: 2rem;
  background: linear-gradient(135deg, rgba(19, 31, 38, 0.9) 0%, rgba(13, 148, 136, 0.15) 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const FeedContent = styled.div`
  max-width: 600px;
`;

const FeedTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const FeedDesc = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
  margin: 0;
`;

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user && data.user.role === 'BARBER') {
        setUser(data.user);
        fetchDashboardData();
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [apptsRes, analyticsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/barbers/analytics'),
      ]);
      const apptsData = await apptsRes.json();
      const analyticsData = await analyticsRes.json();

      if (apptsData.success) {
        setAppointments(apptsData.data || []);
      }
      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const handleUpdateApptStatus = async (appointmentId: string, status: 'CONFIRMED' | 'CANCELLED') => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({
          message: `Appointment ${status === 'CONFIRMED' ? 'confirmed' : 'declined'} successfully`,
          type: 'success',
        });
        fetchDashboardData();
      } else {
        setToast({ message: data.error || 'Failed to update appointment', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error updating appointment status', type: 'error' });
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Navbar activeTab="PORTAL" />
        <MainContent style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <p style={{ color: '#94a3b8' }}>Loading Provider Portal...</p>
        </MainContent>
        <Footer />
      </PageWrapper>
    );
  }

  /* Unauthenticated Provider Landing Page */
  if (!user) {
    return (
      <PageWrapper>
        <Navbar activeTab="PORTAL" />
        <MainContent>
          <HeroSection>
            <HeroTitle>
              Grow Your Barber Business with <span>Fade Finder</span>
            </HeroTitle>
            <HeroSubtitle>
              Connect with thousands of local clients, manage studio and house call bookings seamlessly, and control your schedule with automatic confirm & dual pricing.
            </HeroSubtitle>
            <HeroButtonGroup>
              <Button variant="primary" size="lg" onClick={() => router.push('/providers/register')}>
                Become a Provider
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/providers/login')}>
                Provider Login
              </Button>
            </HeroButtonGroup>
          </HeroSection>

          <SectionHeading>
            <SectionTitle>How Fade Finder Works for Barbers</SectionTitle>
            <SectionSub>Simple steps to get verified and start booking clients today.</SectionSub>
          </SectionHeading>

          <ProcessGrid>
            <ProcessCard>
              <StepBadge>1</StepBadge>
              <StepTitle>Create & Submit Verification</StepTitle>
              <StepTitle style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 'normal' }}>
                Register your account, enter your base address, license details, and submit for instant admin review.
              </StepTitle>
            </ProcessCard>

            <ProcessCard>
              <StepBadge>2</StepBadge>
              <StepTitle>Configure Profile & Pricing</StepTitle>
              <StepDesc>
                Set up your studio and house call service prices, working hours, auto-confirm preferences, and portfolio gallery.
              </StepDesc>
            </ProcessCard>

            <ProcessCard>
              <StepBadge>3</StepBadge>
              <StepTitle>Receive Bookings & Get Paid</StepTitle>
              <StepDesc>
                Clients find you via map pins and search filters. Accept studio appointments or mobile home visits on your terms.
              </StepDesc>
            </ProcessCard>
          </ProcessGrid>

          <SectionHeading>
            <SectionTitle>Built Specifically for Independent Barbers</SectionTitle>
            <SectionSub>Features designed to elevate your craft and maximize revenue.</SectionSub>
          </SectionHeading>

          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>💈</FeatureIcon>
              <FeatureTitle>Dual Pricing Model</FeatureTitle>
              <FeatureText>
                Charge different rates for in-studio cuts versus house-call mobile appointments to cover travel and setup time.
              </FeatureText>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>⚡</FeatureIcon>
              <FeatureTitle>Auto-Confirm Bookings</FeatureTitle>
              <FeatureText>
                Enable instant auto-confirmation for open time slots or manually approve client requests as they arrive.
              </FeatureText>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>📊</FeatureIcon>
              <FeatureTitle>Search & Profile Analytics</FeatureTitle>
              <FeatureText>
                Track profile views, filter appearances in client searches, and monitor how many clients favorite your profile.
              </FeatureText>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>🛡️</FeatureIcon>
              <FeatureTitle>Verified Barber Badge</FeatureTitle>
              <FeatureText>
                Gain client trust with verified license badges displayed prominently on your public profile.
              </FeatureText>
            </FeatureCard>
          </FeatureGrid>
        </MainContent>
        <Footer />
      </PageWrapper>
    );
  }

  /* Authenticated Provider Dashboard */
  const verificationStatus = user.barberProfile?.verificationStatus || 'PENDING';

  return (
    <PageWrapper>
      <Navbar activeTab="PORTAL" />
      <MainContent>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <WelcomeBanner>
          <WelcomeText>
            <WelcomeTitle>
              Welcome, {user.firstName}!
              <Badge
                variant={
                  verificationStatus === 'APPROVED'
                    ? 'success'
                    : verificationStatus === 'PENDING'
                    ? 'warning'
                    : 'danger'
                }
              >
                {verificationStatus}
              </Badge>
            </WelcomeTitle>
            <WelcomeSub style={{ color: '#94a3b8' }}>
              Manage your upcoming appointments, update profile details, and track your business metrics.
            </WelcomeSub>
          </WelcomeText>

          <Button variant="outline" size="md" onClick={() => router.push(`/providers/profile/private`)}>
            Manage Profile
          </Button>
        </WelcomeBanner>

        {verificationStatus !== 'APPROVED' && (
          <VerificationAlert status={verificationStatus}>
            <AlertText>
              {verificationStatus === 'PENDING' ? (
                <>
                  <strong>Verification Pending:</strong> Your account was submitted for admin review. You can complete your profile while waiting.
                </>
              ) : (
                <>
                  <strong>Verification Status: {verificationStatus}</strong> Please review requirements or contact support for help.
                </>
              )}
            </AlertText>
            <Button variant="secondary" size="sm" onClick={() => router.push('/providers/status')}>
              View Status Details
            </Button>
          </VerificationAlert>
        )}

        {/* Analytics Summary */}
        <StatsGrid>
          <StatCard>
            <StatLabel>Upcoming Appts</StatLabel>
            <StatValue>{appointments.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED').length}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Profile Views</StatLabel>
            <StatValue>{analytics?.profileViews ?? 0}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Search Appearances</StatLabel>
            <StatValue>{analytics?.searchAppearances ?? 0}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Favorites</StatLabel>
            <StatValue>{analytics?.favoriteCount ?? 0}</StatValue>
          </StatCard>
        </StatsGrid>

        {/* Navigation Quick Links */}
        <NavLinksGrid>
          <NavCard href="/providers/profile/private">
            <NavCardIcon>✏️</NavCardIcon>
            <NavCardTitle>Private Profile Manager</NavCardTitle>
            <NavCardDesc>Edit services, dual pricing, bio, gallery & working hours</NavCardDesc>
          </NavCard>

          <NavCard href="/providers/analytics">
            <NavCardIcon>📈</NavCardIcon>
            <NavCardTitle>Analytics Overview</NavCardTitle>
            <NavCardDesc>View search appearance frequency and view trends</NavCardDesc>
          </NavCard>

          <NavCard href="/providers/status">
            <NavCardIcon>🔍</NavCardIcon>
            <NavCardTitle>Verification Tracker</NavCardTitle>
            <NavCardDesc>Check admin approval step and expected timeframe</NavCardDesc>
          </NavCard>

          <NavCard href="/providers/settings">
            <NavCardIcon>⚙️</NavCardIcon>
            <NavCardTitle>Provider Settings</NavCardTitle>
            <NavCardDesc>Account details, password, and notification preferences</NavCardDesc>
          </NavCard>

          <NavCard href="/providers/billing">
            <NavCardIcon>💳</NavCardIcon>
            <NavCardTitle>Billing & Payouts</NavCardTitle>
            <NavCardDesc>Payout methods, deposit history, and booking fee info</NavCardDesc>
          </NavCard>
        </NavLinksGrid>

        {/* Upcoming Appointments */}
        <AppointmentsSection>
          <SectionHeader>
            <SectionTitle style={{ fontSize: '1.5rem', margin: 0 }}>Upcoming Appointments</SectionTitle>
            <Badge variant="info">{appointments.length} Total</Badge>
          </SectionHeader>

          {appointments.length === 0 ? (
            <EmptyState>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
                No appointments booked yet.
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                Ensure your profile is complete and verified to start appearing in local search results.
              </p>
            </EmptyState>
          ) : (
            <AppointmentsList>
              {appointments.map((appt) => (
                <AppointmentCard key={appt.id}>
                  <ClientInfo>
                    <Avatar>{appt.client?.firstName?.[0] || 'C'}</Avatar>
                    <ClientMeta>
                      <ClientName>
                        {appt.client?.firstName} {appt.client?.lastName}
                      </ClientName>
                      <ServiceDetails>
                        {appt.service?.name} ({appt.locationType === 'HOUSE_CALL' ? 'House Call' : 'In Studio'}) • {appt.client?.phone || appt.client?.email}
                      </ServiceDetails>
                    </ClientMeta>
                  </ClientInfo>

                  <ApptTiming>
                    <ApptTime>{new Date(appt.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</ApptTime>
                    <ApptPrice>${appt.totalPrice.toFixed(2)}</ApptPrice>
                  </ApptTiming>

                  <ActionButtons>
                    <Badge
                      variant={
                        appt.status === 'CONFIRMED'
                          ? 'success'
                          : appt.status === 'PENDING'
                          ? 'warning'
                          : appt.status === 'CANCELLED'
                          ? 'danger'
                          : 'secondary'
                      }
                    >
                      {appt.status}
                    </Badge>
                    {appt.status === 'PENDING' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateApptStatus(appt.id, 'CONFIRMED')}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleUpdateApptStatus(appt.id, 'CANCELLED')}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                  </ActionButtons>
                </AppointmentCard>
              ))}
            </AppointmentsList>
          )}
        </AppointmentsSection>

        {/* Feed Preview CTA */}
        <FeedPreviewCard>
          <FeedContent>
            <FeedTitle>Provider Community Feed</FeedTitle>
            <FeedDesc>
              Share your latest haircuts, showcase portfolio photos, and post updates to connect directly with your client base.
            </FeedDesc>
          </FeedContent>
          <Button variant="secondary" size="md">
            Preview Feed Feature
          </Button>
        </FeedPreviewCard>
      </MainContent>
      <Footer />
    </PageWrapper>
  );
}
