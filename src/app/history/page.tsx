'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Calendar,
  Clock,
  MapPin,
  Scissors,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Star,
  XCircle,
  CheckCircle,
} from 'lucide-react';

interface AppointmentItem {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  locationType: 'STUDIO' | 'HOUSE_CALL';
  clientAddress?: string | null;
  startTime: string;
  endTime: string;
  totalPrice: number;
  notes?: string | null;
  service: {
    id: string;
    name: string;
    description: string;
    durationMinutes: number;
    studioPrice: number;
    houseCallPrice: number;
  };
  barber: {
    id: string;
    slug: string;
    baseAddress: string;
    rating: number;
    user: {
      firstName: string;
      lastName: string;
      phone: string;
      avatarUrl?: string | null;
    };
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
}

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem 1.25rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 0.5rem 0;
`;

const PageSubtitle = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterTab = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1.2rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primaryLight : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.primaryAccent : theme.colors.textSecondary)};
  cursor: pointer;
  white-space: nowrap;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const AppointmentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const AppointmentCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
`;

const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
`;

const BarberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BarberAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BarberDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const BarberName = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const ServiceName = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaryAccent};
  margin: 0.2rem 0 0 0;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    color: ${({ theme }) => theme.colors.primaryAccent};
    flex-shrink: 0;
  }
`;

const CardActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PriceTag = styled.span`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border};
`;

export default function HistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAppointments(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCancel = async (appointmentId: string) => {
    try {
      setCancellingId(appointmentId);
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Appointment cancelled successfully.' });
        fetchAppointments();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to cancel appointment.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setCancellingId(null);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'UPCOMING') return apt.status === 'PENDING' || apt.status === 'CONFIRMED' || apt.status === 'IN_PROGRESS';
    if (filter === 'COMPLETED') return apt.status === 'COMPLETED';
    if (filter === 'CANCELLED') return apt.status === 'CANCELLED';
    return true;
  });

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'info' | 'danger' | 'outline' => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'outline';
    }
  };

  if (authLoading || loading) {
    return (
      <PageWrapper>
        <Navbar activeTab="HISTORY" />
        <MainContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <RefreshCw className="animate-spin" size={32} style={{ color: '#0d9488' }} />
        </MainContent>
        <Footer />
      </PageWrapper>
    );
  }

  if (!user) {
    return (
      <PageWrapper>
        <Navbar activeTab="HISTORY" />
        <MainContent>
          <EmptyState data-testid="unauth-history-state">
            <AlertCircle size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
            <h2>Sign In Required</h2>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Please log in to view and manage your appointment history.
            </p>
            <Link href="/login">
              <Button variant="primary">Log In</Button>
            </Link>
          </EmptyState>
        </MainContent>
        <Footer />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar activeTab="HISTORY" />

      <MainContent>
        <PageHeader>
          <PageTitle>My Appointments</PageTitle>
          <PageSubtitle>Track, manage, and review your barbershop and house call appointments.</PageSubtitle>
        </PageHeader>

        {feedbackMsg && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              backgroundColor: feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${feedbackMsg.type === 'success' ? '#10b981' : '#ef4444'}`,
              color: '#f8fafc',
            }}
          >
            {feedbackMsg.text}
          </div>
        )}

        <FilterContainer>
          <FilterTab $active={filter === 'ALL'} onClick={() => setFilter('ALL')} data-testid="filter-all">
            All ({appointments.length})
          </FilterTab>
          <FilterTab
            $active={filter === 'UPCOMING'}
            onClick={() => setFilter('UPCOMING')}
            data-testid="filter-upcoming"
          >
            Upcoming (
            {appointments.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS').length}
            )
          </FilterTab>
          <FilterTab
            $active={filter === 'COMPLETED'}
            onClick={() => setFilter('COMPLETED')}
            data-testid="filter-completed"
          >
            Completed ({appointments.filter((a) => a.status === 'COMPLETED').length})
          </FilterTab>
          <FilterTab
            $active={filter === 'CANCELLED'}
            onClick={() => setFilter('CANCELLED')}
            data-testid="filter-cancelled"
          >
            Cancelled ({appointments.filter((a) => a.status === 'CANCELLED').length})
          </FilterTab>
        </FilterContainer>

        {filteredAppointments.length === 0 ? (
          <EmptyState data-testid="empty-history-state">
            <Scissors size={48} style={{ color: '#64748b', marginBottom: '1rem' }} />
            <h3>No appointments found</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              {filter === 'ALL'
                ? "You haven't booked any appointments yet."
                : `No ${filter.toLowerCase()} appointments.`}
            </p>
            <Link href="/search">
              <Button variant="primary">Find a Barber</Button>
            </Link>
          </EmptyState>
        ) : (
          <AppointmentGrid data-testid="appointment-grid">
            {filteredAppointments.map((apt) => {
              const startDate = new Date(apt.startTime);
              const formattedDate = startDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });

              const isUpcoming = apt.status === 'PENDING' || apt.status === 'CONFIRMED';

              return (
                <AppointmentCard key={apt.id} data-testid={`appointment-card-${apt.id}`}>
                  <CardTopRow>
                    <BarberInfo>
                      <BarberAvatar>
                        {apt.barber.user.avatarUrl ? (
                          <img src={apt.barber.user.avatarUrl} alt={apt.barber.user.firstName} />
                        ) : (
                          `${apt.barber.user.firstName[0]}${apt.barber.user.lastName[0]}`
                        )}
                      </BarberAvatar>
                      <BarberDetails>
                        <BarberName>
                          {apt.barber.user.firstName} {apt.barber.user.lastName}
                        </BarberName>
                        <ServiceName>{apt.service.name}</ServiceName>
                      </BarberDetails>
                    </BarberInfo>

                    <Badge variant={getStatusBadgeVariant(apt.status)}>
                      {apt.status}
                    </Badge>
                  </CardTopRow>

                  <DetailsGrid>
                    <DetailItem>
                      <Calendar size={16} />
                      <span>{formattedDate} at {formattedTime}</span>
                    </DetailItem>
                    <DetailItem>
                      <Clock size={16} />
                      <span>{apt.service.durationMinutes} mins</span>
                    </DetailItem>
                    <DetailItem>
                      <MapPin size={16} />
                      <span>
                        {apt.locationType === 'HOUSE_CALL'
                          ? `House Call: ${apt.clientAddress || 'Your Location'}`
                          : `Studio: ${apt.barber.baseAddress}`}
                      </span>
                    </DetailItem>
                  </DetailsGrid>

                  <CardActionRow>
                    <PriceTag>${apt.totalPrice.toFixed(2)}</PriceTag>

                    <ActionGroup>
                      {isUpcoming && (
                        <>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancel(apt.id)}
                            disabled={cancellingId === apt.id}
                            data-testid={`cancel-btn-${apt.id}`}
                          >
                            <XCircle size={14} style={{ marginRight: 4 }} />
                            {cancellingId === apt.id ? 'Cancelling...' : 'Cancel'}
                          </Button>
                          <Link href={`/booking/${apt.barber.slug}`}>
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                          </Link>
                        </>
                      )}

                      {apt.status === 'COMPLETED' && (
                        <>
                          <Link href={`/booking/${apt.barber.slug}`}>
                            <Button variant="primary" size="sm">
                              Book Again
                            </Button>
                          </Link>
                        </>
                      )}

                      {apt.status === 'CANCELLED' && (
                        <Link href={`/booking/${apt.barber.slug}`}>
                          <Button variant="outline" size="sm">
                            Book Again
                          </Button>
                        </Link>
                      )}
                    </ActionGroup>
                  </CardActionRow>
                </AppointmentCard>
              );
            })}
          </AppointmentGrid>
        )}
      </MainContent>

      <Footer />
    </PageWrapper>
  );
}
