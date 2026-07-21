'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { MapPin } from '@/components/ui/MapPin';
import { RatingStars } from '@/components/ui/RatingStars';
import { Toast } from '@/components/ui/Toast';
import {
  Search, SlidersHorizontal, Compass, Car, Home as HomeIcon,
  RefreshCw, Scissors, Grid3X3, List, Star, Bookmark, BookmarkCheck,
  Award, Calendar, Eye, X, Lock, LogIn, UserPlus,
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  studioPrice: number;
  houseCallPrice: number;
  description: string;
}

interface Barber {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  licenseNumber: string;
  isVerified: boolean;
  baseAddress: string;
  rating: number;
  reviewCount: number;
  distanceMiles: number | null;
  maxTravelRadiusMiles: number;
  isWithinTravelRadius: boolean;
  services: Service[];
  slug: string;
}

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const FilterBar = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 1rem 1.25rem;
  position: sticky;
  top: 65px;
  z-index: 40;
`;

const FilterInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const SearchRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FilterSelect = styled.select`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 0.3rem 0.6rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.82rem;
  cursor: pointer;

  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const ServiceTypeButtons = styled.div`
  display: flex;
  gap: 0.35rem;
`;

const TypeBtn = styled.button<{ active: boolean }>`
  padding: 0.3rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.82rem;
  font-weight: 600;
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  background: ${({ active, theme }) => active ? theme.colors.primaryLight : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.primaryAccent : theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
`;

const LocationChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 0.3rem 0.75rem;
  cursor: pointer;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const Main = styled.main`
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 3rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const ResultCount = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.35rem;
`;

const ToggleBtn = styled.button<{ active: boolean }>`
  padding: 0.4rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  background: ${({ active, theme }) => active ? theme.colors.primaryLight : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.primaryAccent : theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.transitions.fast};
`;

const GridView = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
`;

const ListView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BarberCard = styled(Card)<{ list?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: ${({ list }) => list ? 'row' : 'column'};
  gap: ${({ list }) => list ? '1.25rem' : '0'};
  padding: 1.25rem;
  align-items: ${({ list }) => list ? 'flex-start' : 'stretch'};
  transition: transform ${({ theme }) => theme.transitions.fast}, box-shadow ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CardHeader = styled.div`
  display: flex;
  gap: 0.85rem;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const BioSnippet = styled.p`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
  margin: 0.5rem 0 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ServicePriceRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const ServicePrice = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaryAccent};
`;

const BarberAvatar = styled.img<{ list?: boolean }>`
  width: ${({ list }) => list ? '80px' : '60px'};
  height: ${({ list }) => list ? '80px' : '60px'};
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const BarberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const BarberName = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const BarberBio = styled.p`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
  margin: 0.5rem 0 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceTag = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.primaryAccent};
  font-weight: 600;
  margin-top: 0.25rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const BookmarkBtn = styled.button<{ saved: boolean }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: ${({ saved }) => saved ? '#f59e0b' : '#64748b'};
  cursor: pointer;
  padding: 0.25rem;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover { color: #f59e0b; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FavoritesToggle = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.82rem;
  font-weight: 600;
  border: 1px solid ${({ active }) => active ? '#f59e0b' : 'rgba(255,255,255,0.12)'};
  background: ${({ active }) => active ? 'rgba(245,158,11,0.15)' : 'transparent'};
  color: ${({ active }) => active ? '#f59e0b' : '#94a3b8'};
  cursor: pointer;
  transition: all 0.15s ease;
`;

const AuthGateOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3.5rem 2rem;
  margin: 3rem auto;
  max-width: 580px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.xl};
  backdrop-filter: blur(12px);
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const AuthGateIconCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primaryAccent};
  margin-bottom: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.glow};
`;

const AuthGateTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 0.75rem;
`;

const AuthGateSubtitle = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 460px;
`;

const AuthGateActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
`;

export default function SearchPage() {
  const router = useRouter();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState<'ALL' | 'HOUSE_CALL' | 'STUDIO'>('ALL');
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [locationName, setLocationName] = useState('Salt Lake City, UT');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 40.7608, lng: -111.891 });
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');

  const fetchBarbers = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      let url = `/api/barbers?type=${serviceType}&lat=${userCoords.lat}&lng=${userCoords.lng}`;
      if (searchQuery) url += `&query=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        let results: Barber[] = data.data;
        if (minRating > 0) results = results.filter((b) => b.rating >= minRating);
        if (maxDistance < 50) results = results.filter((b) => (b.distanceMiles ?? 999) <= maxDistance);

        // Sort
        results = [...results].sort((a, b) => {
          if (sortBy === 'distance') return (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999);
          if (sortBy === 'rating') return b.rating - a.rating;
          if (sortBy === 'price') {
            const aMin = Math.min(...a.services.map((s) => s.studioPrice), 999);
            const bMin = Math.min(...b.services.map((s) => s.studioPrice), 999);
            return aMin - bMin;
          }
          return 0;
        });

        setBarbers(results);
      }
    } catch (err) {
      console.error('Failed to fetch barbers:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, serviceType, minRating, maxDistance, userCoords, searchQuery, sortBy]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBarbers();
    }
  }, [isAuthenticated, fetchBarbers]);

  const handleGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationName('Current GPS Location');
          setToast(' Location updated');
        },
        () => setToast(' GPS permission denied')
      );
    }
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      if (prev.includes(id)) {
        setToast('Removed from saved barbers');
        return prev.filter((x) => x !== id);
      }
      setToast('Saved to favorites');
      return [...prev, id];
    });
  };

  const displayedBarbers = showFavoritesOnly ? barbers.filter((b) => savedIds.includes(b.id)) : barbers;

  return (
    <PageWrapper>
      <Navbar activeTab="CLIENT" />

      {authLoading ? (
        <Main>
          <LoadingState>
            <RefreshCw size={28} style={{ margin: '0 auto 1rem' }} />
            <p>Verifying client authentication...</p>
          </LoadingState>
        </Main>
      ) : !isAuthenticated ? (
        <Main>
          <AuthGateOverlay id="search-auth-gate">
            <AuthGateIconCircle>
              <Lock size={34} />
            </AuthGateIconCircle>
            <AuthGateTitle>Authentication Required</AuthGateTitle>
            <AuthGateSubtitle>
              Searching local barbers, filtering by travel radius, DOPL license verification, and booking haircuts requires an active client account.
            </AuthGateSubtitle>
            <AuthGateActions>
              <Button variant="primary" size="lg" onClick={() => router.push('/login?redirect=/search')} id="auth-gate-login">
                <LogIn size={18} /> Log In to Search
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/register?redirect=/search')} id="auth-gate-register">
                <UserPlus size={18} /> Create Free Account
              </Button>
            </AuthGateActions>
          </AuthGateOverlay>
        </Main>
      ) : (
        <>
          <FilterBar>
            <FilterInner>
              <SearchRow>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <Input
                    placeholder="Search barber name, style, neighborhood..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search size={16} />}
                    id="search-query"
                  />
                </div>
                <Button variant="primary" size="md" onClick={fetchBarbers} id="search-submit">
                  Search
                </Button>
                {searchQuery && (
                  <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={() => { setSearchQuery(''); fetchBarbers(); }}>
                    Clear
                  </Button>
                )}
              </SearchRow>

              <FiltersRow>
                <ServiceTypeButtons>
                  {(['ALL', 'HOUSE_CALL', 'STUDIO'] as const).map((t) => (
                    <TypeBtn key={t} active={serviceType === t} onClick={() => setServiceType(t)}>
                      {t === 'ALL' ? 'All' : t === 'HOUSE_CALL' ? ' House Call' : ' Studio'}
                    </TypeBtn>
                  ))}
                </ServiceTypeButtons>

                <FilterGroup>
                  <SlidersHorizontal size={13} /> Rating:
                  <FilterSelect value={minRating} onChange={(e) => setMinRating(parseFloat(e.target.value))} id="filter-rating">
                    <option value={0}>Any</option>
                    <option value={4}>4.0+</option>
                    <option value={4.5}>4.5+</option>
                    <option value={4.8}>4.8+</option>
                  </FilterSelect>
                </FilterGroup>

                <FilterGroup>
                  <Car size={13} /> Distance:
                  <FilterSelect value={maxDistance} onChange={(e) => setMaxDistance(parseInt(e.target.value))} id="filter-distance">
                    <option value={50}>Any</option>
                    <option value={5}>5 mi</option>
                    <option value={10}>10 mi</option>
                    <option value={25}>25 mi</option>
                  </FilterSelect>
                </FilterGroup>

                <FilterGroup>
                  Sort:
                  <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} id="filter-sort">
                    <option value="distance">Nearest First</option>
                    <option value="rating">Top Rated</option>
                    <option value="price">Lowest Price</option>
                  </FilterSelect>
                </FilterGroup>

                <LocationChip onClick={handleGPS} id="gps-button">
                  <Compass size={13} /> {locationName}
                </LocationChip>

                <FavoritesToggle
                  active={showFavoritesOnly}
                  onClick={() => setShowFavoritesOnly((v) => !v)}
                  id="favorites-toggle"
                >
                  <Star size={13} fill={showFavoritesOnly ? '#f59e0b' : 'none'} />
                  Favorites {savedIds.length > 0 ? `(${savedIds.length})` : ''}
                </FavoritesToggle>
              </FiltersRow>
            </FilterInner>
          </FilterBar>

          <Main>
            <ResultsHeader>
              <ResultCount>
                {loading ? 'Searching...' : `${displayedBarbers.length} Barbers Found`}
                {showFavoritesOnly && savedIds.length === 0 && (
                  <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                    — no saved barbers yet
                  </span>
                )}
              </ResultCount>
              <ViewToggle>
                <ToggleBtn active={view === 'grid'} onClick={() => setView('grid')} title="Grid view" id="view-grid">
                  <Grid3X3 size={16} />
                </ToggleBtn>
                <ToggleBtn active={view === 'list'} onClick={() => setView('list')} title="List view" id="view-list">
                  <List size={16} />
                </ToggleBtn>
              </ViewToggle>
            </ResultsHeader>

            {loading ? (
              <LoadingState>
                <RefreshCw size={28} style={{ margin: '0 auto 1rem', display: 'block' }} />
                <p>Finding barbers near you...</p>
              </LoadingState>
            ) : displayedBarbers.length === 0 ? (
              <LoadingState>
                <Scissors size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  No barbers match your filters
                </h3>
                <p style={{ fontSize: '0.9rem' }}>Try expanding your distance, lowering the minimum rating, or clearing filters.</p>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => { setMinRating(0); setMaxDistance(50); setServiceType('ALL'); setShowFavoritesOnly(false); }}
                  style={{ marginTop: '1.5rem' }}
                >
                  Clear All Filters
                </Button>
              </LoadingState>
            ) : view === 'grid' ? (
              <GridView>
                {displayedBarbers.map((barber) => (
                  <BarberCard key={barber.id}>
                    <CardHeader>
                      <BarberAvatar src={barber.avatarUrl || '/logo.png'} alt={barber.name} />
                      <BarberInfo>
                        <BarberName>{barber.name}</BarberName>
                        <RatingStars rating={barber.rating} reviewCount={barber.reviewCount} size="sm" />
                      </BarberInfo>
                    </CardHeader>

                    {barber.isVerified && (
                      <Badge variant="accent" size="sm" icon={<Award size={11} />} style={{ marginBottom: '0.5rem' }}>
                        DOPL Verified · {barber.licenseNumber}
                      </Badge>
                    )}

                    <BioSnippet>{barber.bio}</BioSnippet>

                    {barber.services[0] && (
                      <ServicePriceRow style={{ margin: '0.5rem 0' }}>
                        <ServicePrice> ${barber.services[0].studioPrice}</ServicePrice>
                      </ServicePriceRow>
                    )}

                    <CardActions>
                      <Button
                        variant="secondary" size="sm" icon={<Eye size={13} />}
                        onClick={() => router.push(`/${barber.slug || barber.id}`)}
                        id={`view-profile-${barber.id}`}
                      >
                        Profile
                      </Button>
                      <Button
                        variant="primary" size="sm" icon={<Calendar size={13} />}
                        onClick={() => router.push(`/booking/${barber.slug || barber.id}`)}
                        id={`book-${barber.id}`}
                      >
                        Book Appointment
                      </Button>
                    </CardActions>
                  </BarberCard>
                ))}
              </GridView>
            ) : (
              <ListView>
                {displayedBarbers.map((barber) => (
                  <BarberCard key={barber.id} list>
                    <BarberAvatar src={barber.avatarUrl || '/logo.png'} alt={barber.name} list />
                    <BarberInfo>
                      <BarberName>{barber.name}</BarberName>
                      <RatingStars rating={barber.rating} reviewCount={barber.reviewCount} size="sm" />
                      <BioSnippet>{barber.bio}</BioSnippet>
                      <CardActions style={{ marginTop: '0.5rem' }}>
                        <Button
                          variant="secondary" size="sm" icon={<Eye size={13} />}
                          onClick={() => router.push(`/${barber.slug || barber.id}`)}
                        >
                          Profile
                        </Button>
                        <Button
                          variant="primary" size="sm" icon={<Calendar size={13} />}
                          onClick={() => router.push(`/booking/${barber.slug || barber.id}`)}
                        >
                          Book Appointment
                        </Button>
                      </CardActions>
                    </BarberInfo>
                  </BarberCard>
                ))}
              </ListView>
            )}
          </Main>
        </>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <Footer />
    </PageWrapper>
  );
}
