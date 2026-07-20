'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/ui/RatingStars';
import { MapPin } from '@/components/ui/MapPin';
import { Toast } from '@/components/ui/Toast';
import {
  Award, Calendar, Bookmark, BookmarkCheck, Star,
  MapPin as MapPinIcon, Phone, Mail, Scissors, ChevronLeft, RefreshCw,
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  studioPrice: number;
  houseCallPrice: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: { firstName: string; lastName: string };
}

interface PortfolioImage {
  id: string;
  imageUrl: string;
  caption?: string;
}

interface Barber {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string;
  bio: string;
  licenseNumber: string;
  isVerified: boolean;
  baseAddress: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  distanceMiles: number | null;
  maxTravelRadiusMiles: number;
  services: Service[];
  reviews: Review[];
  portfolio: PortfolioImage[];
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
  max-width: 1000px;
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

const ProfileHero = styled.div`
  background: linear-gradient(135deg, rgba(13,148,136,0.18) 0%, rgba(19,31,38,0.9) 100%);
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1.75rem;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const ProfileMeta = styled.div`
  flex: 1;
  min-width: 220px;
`;

const BarberName = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
`;

const Bio = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0.75rem 0;
`;

const ContactRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ProfileActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: flex-start;
  flex-shrink: 0;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const ServiceCard = styled(Card)`
  padding: 1.25rem;
`;

const ServiceName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const ServiceDesc = styled.p`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.75rem;
  line-height: 1.4;
`;

const PriceRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const Price = styled.div<{ type: 'studio' | 'housecall' }>`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ type }) => type === 'studio' ? '#2dd4bf' : '#f59e0b'};
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
`;

const GalleryImg = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover { transform: scale(1.03); }
`;

const ReviewCard = styled(Card)`
  padding: 1.25rem;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ReviewerName = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
`;

const ReviewDate = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ReviewText = styled.p`
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const StarRow = styled.div`
  display: flex;
  gap: 0.15rem;
  margin-bottom: 0.5rem;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CTACard = styled(Card)`
  padding: 1.75rem;
  background: linear-gradient(135deg, rgba(13,148,136,0.2) 0%, rgba(19,31,38,0.8) 100%);
  border-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const LoadingWrap = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const NotFound = styled.div`
  text-align: center;
  padding: 5rem 2rem;
`;

export default function BarberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params['barber-slug'] as string;

  const [barber, setBarber] = useState<Barber | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/barbers/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBarber(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    const saved = JSON.parse(localStorage.getItem('fade-favorites') || '[]');
    setIsFavorited(saved.includes(slug));
  }, [slug]);

  const toggleFavorite = () => {
    const saved: string[] = JSON.parse(localStorage.getItem('fade-favorites') || '[]');
    if (isFavorited) {
      localStorage.setItem('fade-favorites', JSON.stringify(saved.filter((s) => s !== slug)));
      setIsFavorited(false);
      setToast('Removed from favorites');
    } else {
      localStorage.setItem('fade-favorites', JSON.stringify([...saved, slug]));
      setIsFavorited(true);
      setToast('Added to favorites ');
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Navbar activeTab="CLIENT" />
        <LoadingWrap>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <p>Loading barber profile...</p>
        </LoadingWrap>
        <Footer />
      </PageWrapper>
    );
  }

  if (!barber) {
    return (
      <PageWrapper>
        <Navbar activeTab="CLIENT" />
        <NotFound>
          <Scissors size={40} style={{ opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Barber Not Found</h2>
          <p style={{ color: '#94a3b8' }}>This profile may have moved or been removed.</p>
          <Button variant="outline" size="md" onClick={() => router.push('/search')} style={{ marginTop: '1.5rem' }}>
            Browse Barbers
          </Button>
        </NotFound>
        <Footer />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar activeTab="CLIENT" />
      <Main>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}

        <BackLink onClick={() => router.back()}>
          <ChevronLeft size={16} /> Back to results
        </BackLink>

        {/* HERO */}
        <ProfileHero>
          <Avatar src={barber.avatarUrl} alt={barber.name} />

          <ProfileMeta>
            <BarberName>{barber.name}</BarberName>

            <RatingStars rating={barber.rating} reviewCount={barber.reviewCount} />

            {barber.isVerified && (
              <Badge variant="accent" size="sm" icon={<Award size={12} />} style={{ marginTop: '0.5rem' }}>
                DOPL License: {barber.licenseNumber}
              </Badge>
            )}

            <Bio>{barber.bio}</Bio>

            <ContactRow>
              <ContactItem>
                <MapPinIcon size={14} color="#0d9488" />
                {barber.baseAddress}
              </ContactItem>
              {barber.distanceMiles !== null && (
                <ContactItem>
                  <MapPin distanceMiles={barber.distanceMiles} />
                </ContactItem>
              )}
              {barber.phone && (
                <ContactItem>
                  <Phone size={14} />
                  <a href={`tel:${barber.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {barber.phone}
                  </a>
                </ContactItem>
              )}
              {barber.email && (
                <ContactItem>
                  <Mail size={14} />
                  {barber.email}
                </ContactItem>
              )}
            </ContactRow>
          </ProfileMeta>

          <ProfileActions>
            <Button
              variant={isFavorited ? 'outline' : 'secondary'}
              size="md"
              icon={isFavorited ? <BookmarkCheck size={16} color="#f59e0b" /> : <Bookmark size={16} />}
              onClick={toggleFavorite}
              id="favorite-btn"
            >
              {isFavorited ? 'Saved' : 'Save'}
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Calendar size={16} />}
              onClick={() => router.push(`/booking/${barber.slug || barber.id}`)}
              id="book-btn"
            >
              Book Appointment
            </Button>
          </ProfileActions>
        </ProfileHero>

        {/* SERVICES */}
        {barber.services.length > 0 && (
          <Section>
            <SectionTitle><Scissors size={18} /> Services & Pricing</SectionTitle>
            <ServicesGrid>
              {barber.services.map((s) => (
                <ServiceCard key={s.id} variant="solid">
                  <ServiceName>{s.name}</ServiceName>
                  <ServiceDesc>{s.description} · {s.durationMinutes} min</ServiceDesc>
                  <PriceRow>
                    <Price type="studio"> Studio ${s.studioPrice}</Price>
                    <Price type="housecall"> House Call ${s.houseCallPrice}</Price>
                  </PriceRow>
                </ServiceCard>
              ))}
            </ServicesGrid>
          </Section>
        )}

        {/* GALLERY */}
        {barber.portfolio.length > 0 && (
          <Section>
            <SectionTitle>Gallery</SectionTitle>
            <GalleryGrid>
              {barber.portfolio.map((img) => (
                <GalleryImg
                  key={img.id}
                  src={img.imageUrl}
                  alt={img.caption || 'Portfolio work'}
                  onClick={() => setPreviewImg(img.imageUrl)}
                />
              ))}
            </GalleryGrid>
          </Section>
        )}

        {/* REVIEWS */}
        {barber.reviews.length > 0 && (
          <Section>
            <SectionTitle>
              <Star size={18} />
              Reviews ({barber.reviews.length})
            </SectionTitle>
            <ReviewsList>
              {barber.reviews.map((rev) => (
                <ReviewCard key={rev.id} variant="solid">
                  <ReviewHeader>
                    <ReviewerName>{rev.reviewer.firstName} {rev.reviewer.lastName}</ReviewerName>
                    <ReviewDate>{new Date(rev.createdAt).toLocaleDateString()}</ReviewDate>
                  </ReviewHeader>
                  <StarRow>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < rev.rating ? '#f59e0b' : 'none'} color={i < rev.rating ? '#f59e0b' : '#475569'} />
                    ))}
                  </StarRow>
                  <ReviewText>&ldquo;{rev.comment}&rdquo;</ReviewText>
                </ReviewCard>
              ))}
            </ReviewsList>
          </Section>
        )}

        {/* BOOKING CTA BANNER */}
        <CTACard>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Ready to book with {barber.name}?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {barber.maxTravelRadiusMiles > 0
                ? `Available for studio cuts and house calls up to ${barber.maxTravelRadiusMiles} miles.`
                : 'Available for in-studio appointments.'}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={<Calendar size={18} />}
            onClick={() => router.push(`/booking/${barber.slug || barber.id}`)}
            id="book-cta-btn"
          >
            Book Now
          </Button>
        </CTACard>
      </Main>

      {/* IMAGE PREVIEW OVERLAY */}
      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
        >
          <img src={previewImg} alt="Preview" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }} />
        </div>
      )}

      <Footer />
    </PageWrapper>
  );
}
