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
import {
  User, Calendar, Settings, CreditCard, Search,
  LogOut, RefreshCw, ChevronRight, CheckCircle2, Clock, XCircle,
} from 'lucide-react';

interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  avatarUrl?: string;
}

interface Appointment {
  id: string;
  startTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  locationType: 'STUDIO' | 'HOUSE_CALL';
  totalPrice: number;
  service: { name: string; durationMinutes: number };
  barber: { user: { firstName: string; lastName: string } };
}

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

const ProfileHero = styled(Card)`
  padding: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const AvatarCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primaryAccent};
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const QuickLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
`;

const QuickCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.lg};
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const QuickIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primaryAccent};
  flex-shrink: 0;
`;

const QuickLabel = styled.div`
  flex: 1;
  font-weight: 600;
  font-size: 0.9rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const AppointmentCard = styled(Card)`
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const ApptLeft = styled.div``;

const ApptService = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
`;

const ApptMeta = styled.div`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ApptRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ApptPrice = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primaryAccent};
`;

const statusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  if (status === 'CONFIRMED') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'CANCELLED') return 'danger';
  if (status === 'COMPLETED') return 'info';
  return 'secondary';
};

const EmptyAppts = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border};
`;

const LogoutCard = styled(Card)`
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [sessionRes, apptsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/appointments'),
        ]);
        const sessionData = await sessionRes.json();
        const apptsData = await apptsRes.json();

        if (sessionData.success && sessionData.user) {
          setUser(sessionData.user);
        } else {
          router.push('/login');
          return;
        }
        if (apptsData.success) setAppointments(apptsData.data || []);
      } catch (err) {
        console.error('Failed to load profile:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setToast('Logged out successfully');
    setTimeout(() => router.push('/'), 1000);
  };

  if (loading) {
    return (
      <PageWrapper>
        <Navbar activeTab="CLIENT" />
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <p>Loading your profile...</p>
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  if (!user) return null;

  const upcomingAppts = appointments.filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status));
  const pastAppts = appointments.filter((a) => ['COMPLETED', 'CANCELLED'].includes(a.status));

  return (
    <PageWrapper>
      <Navbar activeTab="CLIENT" />
      <Main>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}

        <ProfileHero>
          <AvatarCircle>
            {user.firstName[0]}{user.lastName[0]}
          </AvatarCircle>
          <UserInfo>
            <UserName>{user.firstName} {user.lastName}</UserName>
            <UserEmail>{user.email}</UserEmail>
            {user.phone && <UserEmail>{user.phone}</UserEmail>}
          </UserInfo>
          <Button variant="outline" size="md" icon={<Settings size={15} />} onClick={() => router.push('/settings')}>
            Settings
          </Button>
        </ProfileHero>

        <QuickLinks>
          <QuickCard href="/search" id="nav-search">
            <QuickIcon><Search size={18} /></QuickIcon>
            <QuickLabel>Find a Barber</QuickLabel>
            <ChevronRight size={16} color="#64748b" />
          </QuickCard>
          <QuickCard href="/settings" id="nav-settings">
            <QuickIcon><Settings size={18} /></QuickIcon>
            <QuickLabel>Account Settings</QuickLabel>
            <ChevronRight size={16} color="#64748b" />
          </QuickCard>
          <QuickCard href="/billing" id="nav-billing">
            <QuickIcon><CreditCard size={18} /></QuickIcon>
            <QuickLabel>Billing & Payments</QuickLabel>
            <ChevronRight size={16} color="#64748b" />
          </QuickCard>
        </QuickLinks>

        {/* UPCOMING */}
        <section style={{ marginBottom: '2rem' }}>
          <SectionTitle>
            <Calendar size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />
            Upcoming Appointments ({upcomingAppts.length})
          </SectionTitle>
          {upcomingAppts.length === 0 ? (
            <EmptyAppts>
              <Calendar size={32} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.35 }} />
              <p style={{ fontWeight: 600 }}>No upcoming appointments</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <Link href="/search" style={{ color: '#0d9488' }}>Find a barber</Link> to get started.
              </p>
            </EmptyAppts>
          ) : (
            upcomingAppts.map((appt) => (
              <AppointmentCard key={appt.id} variant="solid">
                <ApptLeft>
                  <ApptService>{appt.service.name}</ApptService>
                  <ApptMeta>
                    with {appt.barber.user.firstName} {appt.barber.user.lastName} ·{' '}
                    {appt.locationType === 'HOUSE_CALL' ? '🚗 House Call' : '💈 Studio'} ·{' '}
                    {new Date(appt.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </ApptMeta>
                </ApptLeft>
                <ApptRight>
                  <ApptPrice>${appt.totalPrice}</ApptPrice>
                  <Badge variant={statusVariant(appt.status)} size="sm">
                    {appt.status === 'CONFIRMED' && <CheckCircle2 size={11} style={{ marginRight: 4 }} />}
                    {appt.status === 'PENDING' && <Clock size={11} style={{ marginRight: 4 }} />}
                    {appt.status}
                  </Badge>
                </ApptRight>
              </AppointmentCard>
            ))
          )}
        </section>

        {/* PAST */}
        {pastAppts.length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <SectionTitle>Past Appointments</SectionTitle>
            {pastAppts.slice(0, 5).map((appt) => (
              <AppointmentCard key={appt.id} variant="glass" style={{ opacity: 0.8 }}>
                <ApptLeft>
                  <ApptService>{appt.service.name}</ApptService>
                  <ApptMeta>
                    with {appt.barber.user.firstName} {appt.barber.user.lastName} ·{' '}
                    {new Date(appt.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </ApptMeta>
                </ApptLeft>
                <ApptRight>
                  <ApptPrice>${appt.totalPrice}</ApptPrice>
                  <Badge variant={statusVariant(appt.status)} size="sm">
                    {appt.status === 'COMPLETED' && <CheckCircle2 size={11} style={{ marginRight: 4 }} />}
                    {appt.status === 'CANCELLED' && <XCircle size={11} style={{ marginRight: 4 }} />}
                    {appt.status}
                  </Badge>
                </ApptRight>
              </AppointmentCard>
            ))}
          </section>
        )}

        <LogoutCard>
          <div>
            <div style={{ fontWeight: 700 }}>Sign Out</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              You&apos;re signed in as {user.email}
            </div>
          </div>
          <Button variant="danger" size="md" icon={<LogOut size={15} />} onClick={handleLogout} id="logout-btn">
            Sign Out
          </Button>
        </LogoutCard>
      </Main>
      <Footer />
    </PageWrapper>
  );
}
