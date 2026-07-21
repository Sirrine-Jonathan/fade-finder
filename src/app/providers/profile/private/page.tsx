'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/ui/RatingStars';
import { Toast } from '@/components/ui/Toast';

interface ServiceItem {
  id?: string;
  name: string;
  description: string;
  durationMinutes: number;
  studioPrice: number;
  houseCallPrice: number;
}

interface AvailabilityItem {
  id?: string;
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
}

interface PortfolioItem {
  id?: string;
  imageUrl: string;
  caption?: string;
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
  max-width: 1000px;
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
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0.25rem 0 0;
`;

const SectionCard = styled(Card)`
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  padding-bottom: 0.75rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

const ToggleContainer = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1rem 1.25rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
`;

const ToggleText = styled.div``;

const ToggleTitle = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  display: block;
  margin-bottom: 0.2rem;
`;

const ToggleSub = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Switch = styled.input.attrs({ type: 'checkbox' })`
  width: 22px;
  height: 22px;
  accent-color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`;

const ServiceRow = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1.25rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ServiceInputs = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const HoursGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const HourRow = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr 1fr;
  align-items: center;
  gap: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.75rem 1rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const DayName = styled.span`
  font-weight: 700;
  font-size: 0.9rem;
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
`;

const GalleryCard = styled.div`
  position: relative;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

const GalleryImg = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
`;

const GalleryCaption = styled.div`
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReviewCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1.25rem;
`;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function PrivateProfileManagerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [baseAddress, setBaseAddress] = useState('');
  const [maxTravelRadiusMiles, setMaxTravelRadiusMiles] = useState('15');
  const [autoConfirmBookings, setAutoConfirmBookings] = useState(true);

  const [services, setServices] = useState<ServiceItem[]>([
    { name: 'Standard Cut', description: 'Classic cut and styling', durationMinutes: 30, studioPrice: 35, houseCallPrice: 55 },
    { name: 'Beard Trim & Line-Up', description: 'Precision beard shaping & razor edge', durationMinutes: 20, studioPrice: 20, houseCallPrice: 35 },
  ]);

  const [availabilities, setAvailabilities] = useState<AvailabilityItem[]>([
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
  ]);

  const [portfolioImages, setPortfolioImages] = useState<PortfolioItem[]>([
    { imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80', caption: 'Skin Fade & Beard Lineup' },
    { imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80', caption: 'Classic Executive Cut' },
  ]);

  const [newImageObj, setNewImageObj] = useState({ imageUrl: '', caption: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/barbers/private');
      const data = await res.json();
      if (data.success && data.data) {
        const b = data.data;
        setTitle(`${b.user.firstName} ${b.user.lastName}`);
        setBio(b.bio || '');
        setBaseAddress(b.baseAddress || '');
        setMaxTravelRadiusMiles(String(b.maxTravelRadiusMiles || 15));
        setAutoConfirmBookings(b.autoConfirmBookings !== false);
        if (b.services && b.services.length > 0) {
          setServices(b.services);
        }
        if (b.availabilities && b.availabilities.length > 0) {
          setAvailabilities(b.availabilities);
        }
        if (b.portfolioImages && b.portfolioImages.length > 0) {
          setPortfolioImages(b.portfolioImages);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/barbers/private', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          baseAddress,
          maxTravelRadiusMiles: parseFloat(maxTravelRadiusMiles) || 15.0,
          autoConfirmBookings,
          services,
          availabilities,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: 'Barber profile updated successfully!', type: 'success' });
      } else {
        setToast({ message: data.error || 'Failed to update profile', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error saving profile modifications', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = () => {
    setServices([
      ...services,
      { name: 'New Service', description: '', durationMinutes: 30, studioPrice: 30, houseCallPrice: 50 },
    ]);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleUpdateService = (index: number, field: keyof ServiceItem, val: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: val };
    setServices(updated);
  };

  const handleUpdateAvailability = (dayIndex: number, field: 'startTime' | 'endTime', val: string) => {
    const existing = availabilities.find((a) => a.dayOfWeek === dayIndex);
    if (existing) {
      setAvailabilities(
        availabilities.map((a) => (a.dayOfWeek === dayIndex ? { ...a, [field]: val } : a))
      );
    } else {
      setAvailabilities([...availabilities, { dayOfWeek: dayIndex, startTime: '09:00', endTime: '17:00', [field]: val }]);
    }
  };

  const handleAddImage = () => {
    if (!newImageObj.imageUrl) return;
    setPortfolioImages([...portfolioImages, { ...newImageObj }]);
    setNewImageObj({ imageUrl: '', caption: '' });
  };

  if (loading) {
    return (
      <PageWrapper>
        <Navbar activeTab="PORTAL" />
        <Container style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <p style={{ color: '#94a3b8' }}>Loading Private Profile Manager...</p>
        </Container>
        <Footer />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar activeTab="PORTAL" />
      <Container>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <Header>
          <div>
            <Title>Private Profile Manager</Title>
            <Subtitle>Configure your public barber profile, dual pricing, services, and working hours</Subtitle>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="outline" size="md" onClick={() => router.push('/providers')}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </Header>

        <form onSubmit={handleSave}>
          {/* General Information */}
          <SectionCard>
            <SectionTitle> General Details & Bio</SectionTitle>
            <FormRow>
              <Input
                label="Provider Display Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Marcus Vance (Master Barber)"
              />
              <Input
                label="Base Studio Address / Location"
                value={baseAddress}
                onChange={(e) => setBaseAddress(e.target.value)}
                placeholder="123 Main St, Salt Lake City, UT"
              />
            </FormRow>

            <FormRow>
              <Input
                label="Max Travel Radius (Miles for House Calls)"
                type="number"
                value={maxTravelRadiusMiles}
                onChange={(e) => setMaxTravelRadiusMiles(e.target.value)}
              />
              <div style={{ alignSelf: 'center' }}>
                <Badge variant="info">Mobile Radius: {maxTravelRadiusMiles} Miles</Badge>
              </div>
            </FormRow>

            <Input
              label="Complete Bio & Experience"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Detailed description of your haircutting background, specialties, and tools used..."
            />

            <ToggleContainer style={{ marginTop: '1rem' }}>
              <ToggleText>
                <ToggleTitle>Auto-Confirm Bookings</ToggleTitle>
                <ToggleSub>
                  Automatically confirm incoming appointment requests if time slot is open in availability schedule
                </ToggleSub>
              </ToggleText>
              <Switch
                checked={autoConfirmBookings}
                onChange={(e) => setAutoConfirmBookings(e.target.checked)}
              />
            </ToggleContainer>
          </SectionCard>

          {/* Services & Dual Pricing */}
          <SectionCard>
            <SectionTitle> Services & Dual Pricing (Studio vs House Call)</SectionTitle>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Define pricing for in-shop studio visits versus mobile house calls to cover travel expenses.
            </p>

            {services.map((srv, idx) => (
              <ServiceRow key={idx}>
                <ServiceInputs>
                  <Input
                    label="Service Name"
                    value={srv.name}
                    onChange={(e) => handleUpdateService(idx, 'name', e.target.value)}
                  />
                  <Input
                    label="Duration (Mins)"
                    type="number"
                    value={srv.durationMinutes}
                    onChange={(e) => handleUpdateService(idx, 'durationMinutes', Number(e.target.value))}
                  />
                  <Input
                    label="Studio Price ($)"
                    type="number"
                    value={srv.studioPrice}
                    onChange={(e) => handleUpdateService(idx, 'studioPrice', Number(e.target.value))}
                  />
                  <Input
                    label="House Call Price ($)"
                    type="number"
                    value={srv.houseCallPrice}
                    onChange={(e) => handleUpdateService(idx, 'houseCallPrice', Number(e.target.value))}
                  />
                </ServiceInputs>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Input
                    label="Description"
                    value={srv.description}
                    onChange={(e) => handleUpdateService(idx, 'description', e.target.value)}
                    placeholder="Short description of what is included..."
                    style={{ flex: 1, marginRight: '1rem' }}
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveService(idx)}
                    style={{ marginTop: '1.2rem' }}
                  >
                    Remove
                  </Button>
                </div>
              </ServiceRow>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={handleAddService} style={{ marginTop: '0.5rem' }}>
              + Add Service
            </Button>
          </SectionCard>

          {/* Working Hours Availability */}
          <SectionCard>
            <SectionTitle> Working Hours Availability</SectionTitle>
            <HoursGrid>
              {DAYS.map((dayName, dayIdx) => {
                const avail = availabilities.find((a) => a.dayOfWeek === dayIdx);
                return (
                  <HourRow key={dayIdx}>
                    <DayName>{dayName}</DayName>
                    <Input
                      type="time"
                      value={avail?.startTime || '09:00'}
                      onChange={(e) => handleUpdateAvailability(dayIdx, 'startTime', e.target.value)}
                    />
                    <Input
                      type="time"
                      value={avail?.endTime || '17:00'}
                      onChange={(e) => handleUpdateAvailability(dayIdx, 'endTime', e.target.value)}
                    />
                  </HourRow>
                );
              })}
            </HoursGrid>
          </SectionCard>

          {/* Portfolio & Gallery */}
          <SectionCard>
            <SectionTitle> Portfolio & Gallery Images</SectionTitle>
            <GalleryGrid>
              {portfolioImages.map((img, idx) => (
                <GalleryCard key={idx}>
                  <GalleryImg src={img.imageUrl} alt={img.caption || 'Haircut Image'} />
                  {img.caption && <GalleryCaption>{img.caption}</GalleryCaption>}
                </GalleryCard>
              ))}
            </GalleryGrid>

            <FormRow style={{ marginTop: '1.25rem' }}>
              <Input
                label="Image URL"
                placeholder="https://images.unsplash.com/photo-..."
                value={newImageObj.imageUrl}
                onChange={(e) => setNewImageObj({ ...newImageObj, imageUrl: e.target.value })}
              />
              <Input
                label="Caption"
                placeholder="Mid taper fade with textured top"
                value={newImageObj.caption}
                onChange={(e) => setNewImageObj({ ...newImageObj, caption: e.target.value })}
              />
            </FormRow>
            <Button type="button" variant="secondary" size="sm" onClick={handleAddImage}>
              + Add Image to Portfolio
            </Button>
          </SectionCard>

          {/* Highlighted Reviews */}
          <SectionCard>
            <SectionTitle> Highlighted Customer Reviews</SectionTitle>
            <ReviewsList>
              <ReviewCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>Alex Mercer</strong>
                  <RatingStars rating={5} />
                </div>
                <p style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                  "Best fade in SLC! Arrived right on time for the house call. Super clean work."
                </p>
              </ReviewCard>

              <ReviewCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>Jordan Rivera</strong>
                  <RatingStars rating={5} />
                </div>
                <p style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                  "Consistent quality every single time. Auto-confirm booking made it effortless to get a spot."
                </p>
              </ReviewCard>
            </ReviewsList>
          </SectionCard>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <Button variant="primary" size="lg" type="submit" disabled={saving}>
              {saving ? 'Saving Profile...' : 'Save All Profile Changes'}
            </Button>
          </div>
        </form>
      </Container>
      <Footer />
    </PageWrapper>
  );
}
