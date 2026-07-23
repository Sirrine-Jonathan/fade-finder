'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { MapPreview } from '@/components/ui/MapPreview';
import {
  Calendar, CheckCircle2, Car, Home as HomeIcon,
  ChevronLeft, RefreshCw, Scissors, Clock, DollarSign,
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  studioPrice: number;
  houseCallPrice: number;
}

interface BarberPublic {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string;
  autoConfirmBookings: boolean;
  maxTravelRadiusMiles: number;
  services: Service[];
  latitude: number;
  longitude: number;
  baseAddress: string;
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
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
`;

const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  padding: 0;
  transition: color ${({ theme }) => theme.transitions.fast};
  &:hover { color: ${({ theme }) => theme.colors.textPrimary}; }
`;

const BookingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.xl};
`;

const BarberAvatar = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const BarberMeta = styled.div``;

const BarberName = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
`;

const BookingCard = styled(Card)`
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 0.85rem;
`;

const LocationToggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const LocationOption = styled.button<{ active: boolean }>`
  padding: 1rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 2px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  background: ${({ active, theme }) => active ? theme.colors.primaryLight : theme.colors.surface};
  color: ${({ active, theme }) => active ? theme.colors.textPrimary : theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  text-align: left;

  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const OptionTitle = styled.div`
  font-weight: 700;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OptionPrice = styled.div`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.primaryAccent};
  font-weight: 600;
`;

const OptionNote = styled.div`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 0.2rem;
`;

const DateTimeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const OrderSummary = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.25rem;
  margin: 1.5rem 0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  padding: 0.35rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  }
`;

const SummaryLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SummaryValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const TotalRow = styled(SummaryRow)`
  font-size: 1.1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primaryAccent};
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;
`;

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const barberSlug = params['barber-slug'] as string;

  const [barber, setBarber] = useState<BarberPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [locationType, setLocationType] = useState<'STUDIO' | 'HOUSE_CALL'>('STUDIO');
  const [clientAddress, setClientAddress] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [successModal, setSuccessModal] = useState(false);
  const [confirmedStatus, setConfirmedStatus] = useState('');
  const [clientLatitude, setClientLatitude] = useState<number | null>(null);
  const [clientLongitude, setClientLongitude] = useState<number | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [radiusWarning, setRadiusWarning] = useState<string | null>(null);

  const handleAddressBlur = async () => {
    if (!clientAddress || !barber) return;
    setIsGeocoding(true);
    setRadiusWarning(null);
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(clientAddress)}`);
      const data = await res.json();
      if (data.success) {
        setClientLatitude(data.latitude);
        setClientLongitude(data.longitude);

        // Haversine formula inline
        const R = 3958.8; // Earth radius in miles
        const dLat = (barber.latitude - data.latitude) * (Math.PI / 180);
        const dLon = (barber.longitude - data.longitude) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(data.latitude * (Math.PI / 180)) *
            Math.cos(barber.latitude * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = Math.round(R * c * 10) / 10;

        if (distance > barber.maxTravelRadiusMiles) {
          setRadiusWarning(
            `This address is ${distance} miles away, which exceeds the barber's maximum travel radius of ${barber.maxTravelRadiusMiles} miles.`
          );
        }
      }
    } catch (err) {
      console.error('Error geocoding client address:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (!barberSlug) return;
    fetch(`/api/barbers/${barberSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setBarber(data.data);
          if (data.data.services?.length > 0) setSelectedService(data.data.services[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [barberSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barber || !selectedService) return;

    let finalLat = clientLatitude;
    let finalLng = clientLongitude;

    if (locationType === 'HOUSE_CALL') {
      if (!clientAddress) {
        setToast({ message: 'Please enter your address for the house call', type: 'error' });
        return;
      }

      if (finalLat === null || finalLng === null) {
        setSubmitting(true);
        try {
          const res = await fetch(`/api/geocode?address=${encodeURIComponent(clientAddress)}`);
          const data = await res.json();
          if (data.success) {
            finalLat = data.latitude;
            finalLng = data.longitude;
            setClientLatitude(finalLat);
            setClientLongitude(finalLng);
          } else {
            setToast({ message: 'Could not verify the provided address location', type: 'error' });
            setSubmitting(false);
            return;
          }
        } catch {
          setToast({ message: 'Error checking address location', type: 'error' });
          setSubmitting(false);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const startTimeStr = `${bookingDate}T${bookingTime}:00.000Z`;
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: barber.id,
          serviceId: selectedService.id,
          locationType,
          clientAddress: locationType === 'HOUSE_CALL' ? clientAddress : null,
          clientLatitude: locationType === 'HOUSE_CALL' ? finalLat : null,
          clientLongitude: locationType === 'HOUSE_CALL' ? finalLng : null,
          startTimeStr,
          notes,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setConfirmedStatus(data.data.status);
        setSuccessModal(true);
      } else {
        setToast({ message: data.error || 'Booking failed. Please try again.', type: 'error' });
      }
    } catch {
      setToast({ message: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const price = selectedService
    ? locationType === 'STUDIO'
      ? selectedService.studioPrice
      : selectedService.houseCallPrice
    : 0;

  if (loading) {
    return (
      <PageWrapper>
        <Navbar activeTab="CLIENT" />
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <p>Loading booking form...</p>
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  if (!barber) {
    return (
      <PageWrapper>
        <Navbar activeTab="CLIENT" />
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <Scissors size={40} style={{ opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
          <h2>Barber Not Found</h2>
          <Button variant="outline" size="md" onClick={() => router.push('/search')} style={{ marginTop: '1.5rem' }}>
            Browse Barbers
          </Button>
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar activeTab="CLIENT" />
      <Main>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <BackLink onClick={() => router.back()}>
          <ChevronLeft size={16} /> Back
        </BackLink>

        <BookingHeader>
          <BarberAvatar src={barber.avatarUrl} alt={barber.name} />
          <BarberMeta>
            <BarberName>Book with {barber.name}</BarberName>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {barber.autoConfirmBookings ? (
                <Badge variant="success" size="sm" icon={<CheckCircle2 size={12} />}>
                  Instant Confirm
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  Pending Approval
                </Badge>
              )}
              {barber.maxTravelRadiusMiles > 0 && (
                <Badge variant="info" size="sm" icon={<Car size={12} />}>
                  House Calls up to {barber.maxTravelRadiusMiles} mi
                </Badge>
              )}
            </div>
          </BarberMeta>
        </BookingHeader>

        <BookingCard>
          <form onSubmit={handleSubmit} id="booking-form">
            {/* SERVICE */}
            <FormSection>
              <SectionTitle>Select Service</SectionTitle>
              <Select
                label=""
                value={selectedService?.id || ''}
                onChange={(e) => {
                  const srv = barber.services.find((s) => s.id === e.target.value);
                  if (srv) setSelectedService(srv);
                }}
                options={barber.services.map((s) => ({
                  value: s.id,
                  label: `${s.name} — ${s.durationMinutes} min`,
                }))}
                id="service-select"
              />
              {selectedService && (
                <p style={{ fontSize: '0.83rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  {selectedService.description}
                </p>
              )}
            </FormSection>

            {/* LOCATION TYPE */}
            <FormSection>
              <SectionTitle>Location Type</SectionTitle>
              <LocationToggle>
                <LocationOption
                  type="button"
                  active={locationType === 'STUDIO'}
                  onClick={() => setLocationType('STUDIO')}
                  id="location-studio"
                >
                  <OptionTitle> In Studio</OptionTitle>
                  <OptionPrice>${selectedService?.studioPrice ?? '—'}</OptionPrice>
                  <OptionNote>Visit the barber&apos;s studio location</OptionNote>
                </LocationOption>

                {barber.maxTravelRadiusMiles > 0 && (
                  <LocationOption
                    type="button"
                    active={locationType === 'HOUSE_CALL'}
                    onClick={() => setLocationType('HOUSE_CALL')}
                    id="location-house-call"
                  >
                    <OptionTitle> House Call</OptionTitle>
                    <OptionPrice>${selectedService?.houseCallPrice ?? '—'}</OptionPrice>
                    <OptionNote>Barber travels to your location</OptionNote>
                  </LocationOption>
                )}
              </LocationToggle>

              {locationType === 'HOUSE_CALL' && (
                <>
                  <Input
                    label="Your Address"
                    placeholder="123 Main St, Salt Lake City, UT 84101"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    onBlur={handleAddressBlur}
                    required
                    id="client-address"
                  />
                  {radiusWarning && (
                    <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.25rem' }}>
                      ⚠️ {radiusWarning}
                    </div>
                  )}
                  {clientAddress && clientLatitude !== null && clientLongitude !== null && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <MapPreview
                        latitude={clientLatitude}
                        longitude={clientLongitude}
                        label={isGeocoding ? "Checking Address..." : "Your Booking Location"}
                        height="160px"
                      />
                    </div>
                  )}
                </>
              )}
            </FormSection>

            {/* DATE & TIME */}
            <FormSection>
              <SectionTitle>Date & Time</SectionTitle>
              <DateTimeRow>
                <Input
                  label="Date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  id="booking-date"
                />
                <Input
                  label="Time"
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                  id="booking-time"
                />
              </DateTimeRow>
            </FormSection>

            {/* NOTES */}
            <FormSection>
              <SectionTitle>Special Notes (optional)</SectionTitle>
              <Input
                label=""
                placeholder="Fade style, gate code, parking info, allergies..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                id="booking-notes"
              />
            </FormSection>

            {/* ORDER SUMMARY */}
            {selectedService && (
              <OrderSummary>
                <SummaryRow>
                  <SummaryLabel><Scissors size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{selectedService.name}</SummaryLabel>
                  <SummaryValue>${price}</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel><Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Duration</SummaryLabel>
                  <SummaryValue>{selectedService.durationMinutes} min</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>Location</SummaryLabel>
                  <SummaryValue>{locationType === 'STUDIO' ? ' In Studio' : ' House Call'}</SummaryValue>
                </SummaryRow>
                <TotalRow>
                  <span><DollarSign size={16} style={{ verticalAlign: 'middle' }} />Total</span>
                  <span>${price}</span>
                </TotalRow>
              </OrderSummary>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={submitting || !selectedService}
              id="booking-submit"
            >
              {submitting
                ? 'Confirming...'
                : barber.autoConfirmBookings
                ? `Confirm Booking — $${price}`
                : `Request Appointment — $${price}`}
            </Button>
          </form>
        </BookingCard>
      </Main>

      {/* SUCCESS MODAL */}
      <Modal
        isOpen={successModal}
        onClose={() => { setSuccessModal(false); router.push('/'); }}
        title="Booking Submitted!"
      >
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <CheckCircle2 size={52} color="#10b981" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {confirmedStatus === 'CONFIRMED' ? 'Appointment Confirmed!' : 'Request Submitted!'}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            {confirmedStatus === 'CONFIRMED'
              ? `Your appointment with ${barber.name} is confirmed. See you soon!`
              : `Your request has been sent to ${barber.name}. They will confirm shortly.`}
          </p>
          <Button variant="primary" size="lg" onClick={() => { setSuccessModal(false); router.push('/'); }}>
            Back to Home
          </Button>
        </div>
      </Modal>

      <Footer />
    </PageWrapper>
  );
}
