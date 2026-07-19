'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin as MapPinIcon,
  Compass,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  Scissors,
  Car,
  Home as HomeIcon,
  RefreshCw,
  Phone,
  Mail,
  X,
  Award,
  ChevronRight,
  Sparkles,
  Filter,
  Eye,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Building2,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  Button,
  Card,
  Input,
  Select,
  Badge,
  Modal,
  Navbar,
  Footer,
  MapPin,
  RatingStars,
  Toast,
  Hero,
  InstallPrompt,
  SplashScreen,
} from '@/components/ui';

interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  studioPrice: number;
  houseCallPrice: number;
}

interface PortfolioImage {
  id: string;
  imageUrl: string;
  caption?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface Barber {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  phone: string;
  email: string;
  bio: string;
  licenseNumber: string;
  isVerified: boolean;
  baseAddress: string;
  latitude: number;
  longitude: number;
  maxTravelRadiusMiles: number;
  autoConfirmBookings: boolean;
  rating: number;
  reviewCount: number;
  distanceMiles: number | null;
  isWithinTravelRadius: boolean;
  services: Service[];
  portfolio: PortfolioImage[];
  reviews: Review[];
}

interface Appointment {
  id: string;
  locationType: 'STUDIO' | 'HOUSE_CALL';
  clientAddress?: string;
  startTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  notes?: string;
  service: Service;
  barber: {
    user: {
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
  client: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export default function FadeFinderApp() {
  const [activeTab, setActiveTab] = useState<'CLIENT' | 'BOOKINGS' | 'PORTAL'>('CLIENT');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'ALL' | 'HOUSE_CALL' | 'STUDIO'>('ALL');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [maxRadiusFilter, setMaxRadiusFilter] = useState<number>(50);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 40.7608,
    lng: -111.8910, // Default Salt Lake City Downtown
  });
  const [locationName, setLocationName] = useState('Salt Lake City, UT (Downtown)');

  // Modals & Detail State
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Barber | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [savedBarberIds, setSavedBarberIds] = useState<string[]>([]);

  // Booking Form State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingLocationType, setBookingLocationType] = useState<'STUDIO' | 'HOUSE_CALL'>('HOUSE_CALL');
  const [clientAddress, setClientAddress] = useState('789 Foothill Dr, Salt Lake City, UT');
  const [bookingDate, setBookingDate] = useState('2026-07-20');
  const [bookingTime, setBookingTime] = useState('14:00');
  const [bookingNotes, setBookingNotes] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  const fetchBarbers = async () => {
    setLoading(true);
    try {
      let url = `/api/barbers?type=${serviceTypeFilter}`;
      if (userCoords) {
        url += `&lat=${userCoords.lat}&lng=${userCoords.lng}`;
      }
      if (searchQuery) {
        url += `&query=${encodeURIComponent(searchQuery)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        let filtered: Barber[] = data.data;
        if (minRatingFilter > 0) {
          filtered = filtered.filter((b) => b.rating >= minRatingFilter);
        }
        if (maxRadiusFilter < 50) {
          filtered = filtered.filter((b) => (b.distanceMiles ?? 0) <= maxRadiusFilter);
        }
        setBarbers(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch barbers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  useEffect(() => {
    fetchBarbers();
    fetchAppointments();
  }, [serviceTypeFilter, minRatingFilter, maxRadiusFilter, userCoords]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBarbers();
  };

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationName('Current GPS Location');
          triggerToast('📍 GPS Location Updated');
        },
        () => {
          alert('GPS location permission denied or unavailable. Using default location.');
        }
      );
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarber || !selectedService) return;

    setSubmittingBooking(true);
    setBookingSuccessMsg('');

    try {
      const startTimeStr = `${bookingDate}T${bookingTime}:00Z`;
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: selectedBarber.id,
          serviceId: selectedService.id,
          locationType: bookingLocationType,
          clientAddress: bookingLocationType === 'HOUSE_CALL' ? clientAddress : null,
          startTimeStr,
          notes: bookingNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingSuccessMsg(
          `Booking ${data.data.status === 'CONFIRMED' ? 'Confirmed!' : 'Submitted!'} Total: $${data.data.totalPrice}`
        );
        triggerToast('✅ New Appointment Booked Successfully!');
        setTimeout(() => {
          setSelectedBarber(null);
          setBookingSuccessMsg('');
          fetchAppointments();
        }, 2000);
      } else {
        alert('Booking Error: ' + data.error);
      }
    } catch (err) {
      alert('Error creating appointment');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Status updated to ${newStatus}`);
        fetchAppointments();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const toggleBookmark = (id: string) => {
    if (savedBarberIds.includes(id)) {
      setSavedBarberIds(savedBarberIds.filter((bId) => bId !== id));
      triggerToast('Removed from saved barbers');
    } else {
      setSavedBarberIds([...savedBarberIds, id]);
      triggerToast('Saved to your favorites');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* PWA SPLASH SCREEN */}
      <SplashScreen />

      {/* TOAST NOTIFICATION */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* HEADER NAVBAR */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'CLIENT' | 'BOOKINGS' | 'PORTAL')}
        tabs={[
          { id: 'CLIENT', label: 'Find Barbers' },
          { id: 'BOOKINGS', label: 'Bookings', count: appointments.length },
          { id: 'PORTAL', label: 'Barber Portal' },
        ]}
      />

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1 }}>
        {activeTab === 'CLIENT' && (
          <>
            {/* FULL WIDTH MODERN HERO SECTION */}
            <Hero
              showLogo={true}
              title="Book Top Local Barbers to Your Door or Studio"
              subtitle="Compare barbers by travel radius, customer ratings, DOPL license verification, and dual-tier studio vs. house call pricing."
              badgeText="Mobile House Calls & Studio Cuts"
            >
              {/* SEARCH & FILTER BAR IN HERO */}
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <Input
                      placeholder="Search barber, service (Fade, Beard), address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={<Search size={18} />}
                    />
                  </div>
                  <Button type="submit" variant="primary" size="md">
                    Search
                  </Button>
                </div>

                {/* LOCATION & SERVICE TYPE FILTERS */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPinIcon size={16} color="#0d9488" />
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      Location: <strong>{locationName}</strong>
                    </span>
                    <Button type="button" variant="ghost" size="sm" icon={<Compass size={13} />} onClick={handleUseGPS}>
                      GPS
                    </Button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {(['ALL', 'HOUSE_CALL', 'STUDIO'] as const).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={serviceTypeFilter === type ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setServiceTypeFilter(type)}
                      >
                        {type === 'ALL' && 'All Types'}
                        {type === 'HOUSE_CALL' && '🚗 House Call'}
                        {type === 'STUDIO' && '💈 In-Studio'}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* ADVANCED FILTER DROPDOWNS */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <SlidersHorizontal size={14} /> Min Rating:
                    <select
                      value={minRatingFilter}
                      onChange={(e) => setMinRatingFilter(parseFloat(e.target.value))}
                      style={{ backgroundColor: '#0b1318', border: '1px solid #334155', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}
                    >
                      <option value={0}>Any Rating</option>
                      <option value={4.5}>4.5+ ⭐</option>
                      <option value={4.8}>4.8+ ⭐</option>
                      <option value={5.0}>5.0 ⭐ Only</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <Car size={14} /> Max Travel Distance:
                    <select
                      value={maxRadiusFilter}
                      onChange={(e) => setMaxRadiusFilter(parseInt(e.target.value))}
                      style={{ backgroundColor: '#0b1318', border: '1px solid #334155', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}
                    >
                      <option value={50}>Any Distance</option>
                      <option value={10}>Within 10 miles</option>
                      <option value={15}>Within 15 miles</option>
                      <option value={25}>Within 25 miles</option>
                    </select>
                  </div>
                </div>
              </form>
            </Hero>

            {/* CONTAINER FOR INSTALL PROMPT & CARDS */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem 2rem 1.25rem' }}>
              {/* INLINE DISMISSABLE PWA INSTALL PROMPT */}
              <InstallPrompt />

              {/* BARBER CARDS GRID */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Available Local Barbers ({barbers.length})
                </h3>
                {savedBarberIds.length > 0 && (
                  <Badge variant="accent" icon={<Star size={12} fill="#f59e0b" />}>
                    {savedBarberIds.length} Saved Barbers
                  </Badge>
                )}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                  <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
                  <p>Finding available barbers in your area...</p>
                </div>
              ) : barbers.length === 0 ? (
                <Card variant="solid" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <Scissors size={36} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No barbers match your filters</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Try clearing your filters or increasing travel radius.
                  </p>
                </Card>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                  {barbers.map((barber) => (
                    <Card key={barber.id} variant="glass" interactive style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        {/* BOOKMARK BUTTON */}
                        <button
                          onClick={() => toggleBookmark(barber.id)}
                          title="Save Barber"
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: savedBarberIds.includes(barber.id) ? '#f59e0b' : '#64748b',
                            cursor: 'pointer',
                          }}
                        >
                          {savedBarberIds.includes(barber.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                        </button>

                        {/* BARBER HEADER INFO */}
                        <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '0.85rem', paddingRight: '2rem' }}>
                          <img
                            src={barber.avatarUrl}
                            alt={barber.name}
                            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d9488' }}
                          />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2 }}>{barber.name}</h4>
                            <div style={{ marginTop: '0.25rem' }}>
                              <RatingStars rating={barber.rating} reviewCount={barber.reviewCount} size="sm" />
                            </div>
                            {barber.distanceMiles !== null && (
                              <div style={{ marginTop: '0.25rem' }}>
                                <MapPin distanceMiles={barber.distanceMiles} />
                              </div>
                            )}
                            {barber.isVerified && (
                              <div style={{ marginTop: '0.25rem' }}>
                                <Badge variant="accent" size="sm" icon={<Award size={12} />}>
                                  DOPL: {barber.licenseNumber}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* BIO */}
                        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                          {barber.bio}
                        </p>

                        {/* PORTFOLIO IMAGES */}
                        {barber.portfolio.length > 0 && (
                          <div style={{ marginBottom: '0.85rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              {barber.portfolio.slice(0, 3).map((img) => (
                                <img
                                  key={img.id}
                                  src={img.imageUrl}
                                  alt="Barber work"
                                  onClick={() => setPreviewImage(img.imageUrl)}
                                  style={{ width: '65px', height: '55px', borderRadius: '6px', objectFit: 'cover', cursor: 'pointer' }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SERVICES PREVIEW */}
                        <div style={{ backgroundColor: '#0b1318', padding: '0.65rem', borderRadius: '8px', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {barber.services.slice(0, 2).map((srv) => (
                              <div key={srv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                                <div>
                                  <strong style={{ color: '#f8fafc' }}>{srv.name}</strong>
                                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{srv.durationMinutes} mins</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ color: '#2dd4bf', fontWeight: 600 }}>💈 Studio: ${srv.studioPrice}</div>
                                  <div style={{ color: '#f59e0b', fontSize: '0.7rem', fontWeight: 600 }}>🚗 House Call: ${srv.houseCallPrice}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                        <Button variant="secondary" size="sm" icon={<Eye size={14} />} onClick={() => setViewingProfile(barber)}>
                          Details
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Calendar size={14} />}
                          onClick={() => {
                            setSelectedBarber(barber);
                            if (barber.services.length > 0) setSelectedService(barber.services[0]);
                          }}
                        >
                          Book Cut
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </>
        )}

        {/* BOOKINGS LIST TAB */}
        {activeTab === 'BOOKINGS' && (
          <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.25rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Appointment Bookings</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Client appointment history & upcoming bookings.</p>
            </div>

            {appointments.length === 0 ? (
              <Card variant="solid" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Calendar size={36} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No bookings recorded yet</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Book an appointment from the "Find Barbers" tab!
                </p>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {appointments.map((appt) => (
                  <Card key={appt.id} variant="glass">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                      <div>
                        <Badge variant={appt.locationType === 'HOUSE_CALL' ? 'warning' : 'info'} size="sm">
                          {appt.locationType === 'HOUSE_CALL' ? '🚗 Mobile House Call' : '💈 In-Studio Cut'}
                        </Badge>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.3rem' }}>{appt.service.name}</h4>
                      </div>
                      <Badge variant={appt.status === 'CONFIRMED' ? 'success' : appt.status === 'COMPLETED' ? 'info' : 'warning'} size="sm">
                        {appt.status}
                      </Badge>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem' }}>
                      <div>
                        <strong>Barber:</strong> {appt.barber.user.firstName} {appt.barber.user.lastName} ({appt.barber.user.phone})
                      </div>
                      <div>
                        <strong>Client:</strong> {appt.client.firstName} {appt.client.lastName} ({appt.client.phone})
                      </div>
                      {appt.clientAddress && <div><strong>Location:</strong> {appt.clientAddress}</div>}
                      <div><strong>Scheduled:</strong> {new Date(appt.startTime).toLocaleString()}</div>
                      <div>
                        <strong>Total Price:</strong> <span style={{ color: '#2dd4bf', fontWeight: 700 }}>${appt.totalPrice}</span>
                      </div>
                    </div>

                    {appt.notes && (
                      <div style={{ backgroundColor: '#0b1318', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                        Notes: "{appt.notes}"
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </main>
        )}

        {/* BARBER PORTAL TAB */}
        {activeTab === 'PORTAL' && (
          <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.25rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Barber Portal & Status Manager</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Manage incoming client house-call requests and update booking statuses.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
              {appointments.map((appt) => (
                <Card key={appt.id} variant="glass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#2dd4bf', fontWeight: 700 }}>Appointment #{appt.id.slice(0, 8)}</span>
                    <Badge variant="warning" size="sm">{appt.status}</Badge>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{appt.service.name} (${appt.totalPrice})</h4>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.3rem 0 0.75rem 0' }}>
                    Client: {appt.client.firstName} {appt.client.lastName} • <a href={`tel:${appt.client.phone}`} style={{ color: '#38bdf8' }}>{appt.client.phone}</a>
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', marginTop: '0.5rem' }}>
                    <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}>
                      Confirm
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}>
                      Complete
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </main>
        )}
      </div>

      {/* FOOTER */}
      <Footer />

      {/* MODAL FOR BARBER DETAILS */}
      <Modal isOpen={!!viewingProfile} onClose={() => setViewingProfile(null)} title={viewingProfile?.name}>
        {viewingProfile && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <img
                src={viewingProfile.avatarUrl}
                alt={viewingProfile.name}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d9488' }}
              />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{viewingProfile.name}</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>📍 {viewingProfile.baseAddress}</p>
                <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.2rem', fontWeight: 600 }}>
                  DOPL License: {viewingProfile.licenseNumber}
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>{viewingProfile.bio}</p>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#38bdf8' }}>Complete Service Menu</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {viewingProfile.services.map((srv) => (
                <div key={srv.id} style={{ backgroundColor: '#0b1318', padding: '0.65rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{srv.name}</strong>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{srv.description} ({srv.durationMinutes} mins)</p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                    <div style={{ color: '#2dd4bf', fontWeight: 700 }}>💈 Studio ${srv.studioPrice}</div>
                    <div style={{ color: '#f59e0b', fontWeight: 700 }}>🚗 House Call ${srv.houseCallPrice}</div>
                  </div>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#38bdf8' }}>
              Customer Reviews ({viewingProfile.reviews.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {viewingProfile.reviews.map((rev) => (
                <div key={rev.id} style={{ backgroundColor: '#0b1318', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b', fontWeight: 700, marginBottom: '0.2rem' }}>
                    <span>{rev.reviewer.firstName} {rev.reviewer.lastName}</span>
                    <span>{'★'.repeat(rev.rating)}</span>
                  </div>
                  <p style={{ color: '#cbd5e1' }}>"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL FOR BOOKING */}
      <Modal isOpen={!!selectedBarber} onClose={() => setSelectedBarber(null)} title={selectedBarber ? `Book with ${selectedBarber.name}` : undefined}>
        {selectedBarber && (
          <div>
            {bookingSuccessMsg ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#2dd4bf' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{bookingSuccessMsg}</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>Closing window...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <Select
                    label="Select Service"
                    value={selectedService?.id}
                    onChange={(e) => {
                      const srv = selectedBarber.services.find((s) => s.id === e.target.value);
                      if (srv) setSelectedService(srv);
                    }}
                    options={selectedBarber.services.map((srv) => ({
                      value: srv.id,
                      label: `${srv.name} (${srv.durationMinutes}m) — Studio: $${srv.studioPrice} / House Call: $${srv.houseCallPrice}`,
                    }))}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                    Location Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <Button
                      type="button"
                      variant={bookingLocationType === 'HOUSE_CALL' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setBookingLocationType('HOUSE_CALL')}
                    >
                      🚗 House Call (${selectedService?.houseCallPrice})
                    </Button>
                    <Button
                      type="button"
                      variant={bookingLocationType === 'STUDIO' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setBookingLocationType('STUDIO')}
                    >
                      💈 Barber Studio (${selectedService?.studioPrice})
                    </Button>
                  </div>
                </div>

                {bookingLocationType === 'HOUSE_CALL' && (
                  <Input
                    label="House Call Address"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Street address, city, zip..."
                  />
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <Input label="Date" type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                  <Input label="Time" type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
                </div>

                <Input
                  label="Special Notes"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Gate code, parking notes, fade preference..."
                />

                <Button type="submit" variant="primary" size="lg" fullWidth disabled={submittingBooking}>
                  {submittingBooking
                    ? 'Confirming...'
                    : `Confirm Booking ($${bookingLocationType === 'HOUSE_CALL' ? selectedService?.houseCallPrice : selectedService?.studioPrice})`}
                </Button>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* FULLSCREEN IMAGE PREVIEW */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            cursor: 'pointer',
          }}
        >
          <img src={previewImage} alt="Work preview" style={{ maxWidth: '90%', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
}
