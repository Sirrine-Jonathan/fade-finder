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
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

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
  review?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
}

export default function FadeFinderApp() {
  const { user } = useAuth();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'CLIENT' | 'BOOKINGS' | 'PORTAL'>('CLIENT');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Review state & handler
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewingApptId, setReviewingApptId] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const handleReviewSubmit = async (e: React.FormEvent, apptId: string) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: apptId, rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast('Review submitted successfully!');
        setReviewingApptId(null);
        setReviewComment('');
        setReviewRating(5);
        fetchAppointments();
      } else {
        alert('Error: ' + data.error);
      }
    } catch {
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

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
  }, [serviceTypeFilter, minRatingFilter, maxRadiusFilter, userCoords, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchResults(true);
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
          triggerToast(' GPS Location Updated');
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
        triggerToast(' New Appointment Booked Successfully!');
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

      {/* HEADER NAVBAR / MINIMAL HEADER */}
      {!user ? (
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#131f26',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          padding: '0.9rem 1.25rem'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <img src="/logo.png" alt="Fade Finder Logo" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #0d9488' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>FADE FINDER</h1>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Local Barbers. On Demand.</p>
              </div>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="md">Log In</Button>
            </Link>
          </div>
        </header>
      ) : (
        <Navbar />
      )}

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1 }}>
        {!user ? (
          /* LOGGED OUT LANDING PAGE */
          <>
            <Hero
              showLogo={true}
              title="Book Top Local Barbers to Your Door or Studio"
              subtitle="Compare barbers by travel radius, customer ratings, DOPL license verification, and dual-tier studio vs. house call pricing."
              badgeText="Mobile House Calls & Studio Cuts"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
                {/* CALL TO ACTION BUTTONS */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', paddingTop: '0.5rem' }}>
                  <Link href="/register">
                    <Button variant="primary" size="lg">Get Started</Button>
                  </Link>
                  <Link href="/providers/register">
                    <Button variant="outline" size="lg">Become a Provider</Button>
                  </Link>
                </div>
              </div>
            </Hero>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.25rem' }}>
              <InstallPrompt />

              {/* VALUE PROPOSITION PITCH GRID */}
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Why Book With Fade Finder?
                </h2>
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
                  The premier platform connecting customers with licensed mobile and studio barbers.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <Card variant="glass" style={{ padding: '1.5rem', textAlign: 'left' }}>
                    <Car size={32} color="#2dd4bf" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Mobile House Calls</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      Get a haircut delivered to your house, office, or hotel. Your barber arrives equipped with standard sanitation and tools.
                    </p>
                  </Card>

                  <Card variant="glass" style={{ padding: '1.5rem' }}>
                    <Award size={32} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>DOPL Vetted & Verified</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      Every provider's Utah DOPL barber license and standing is verified before they take appointments.
                    </p>
                  </Card>

                  <Card variant="glass" style={{ padding: '1.5rem' }}>
                    <Building2 size={32} color="#38bdf8" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Transparent Dual Pricing</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      Compare side-by-side rates for in-studio chair cuts versus mobile travel house calls upfront.
                    </p>
                  </Card>
                </div>
              </div>

              {/* HOW IT WORKS SECTION */}
              <div style={{ backgroundColor: '#0b1318', padding: '2.5rem 1.5rem', borderRadius: '16px', border: '1px solid #1e293b', marginBottom: '3rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>How It Works</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0d9488', color: '#fff', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>1</div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.4rem' }}>Find Local Barbers</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Filter by location, ratings, services, or travel radius.</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0d9488', color: '#fff', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>2</div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.4rem' }}>Choose Studio or Travel</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Select an in-studio slot or request a mobile house call to your door.</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0d9488', color: '#fff', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>3</div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.4rem' }}>Book & Get Fresh</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Receive real-time confirmation and enjoy your professional cut.</p>
                  </div>
                </div>
              </div>

              {/* FEATURED BARBERS SHOWCASE */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Featured Top Rated Barbers</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Licensed barbers ready to service your area</p>
                  </div>
                  <Link href="/register" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" size="sm">
                      Sign Up to Explore
                    </Button>
                  </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {barbers.slice(0, 3).map((barber) => (
                    <Card key={barber.id} variant="glass">
                      <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '0.85rem' }}>
                        <img
                          src={barber.avatarUrl}
                          alt={barber.name}
                          style={{ width: '55px', height: '55px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d9488' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{barber.name}</h4>
                          <RatingStars rating={barber.rating} reviewCount={barber.reviewCount} size="sm" />
                          {barber.isVerified && (
                            <span style={{ fontSize: '0.75rem', color: '#2dd4bf', fontWeight: 600 }}>DOPL Licensed</span>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1rem', height: '2.5em', overflow: 'hidden' }}>
                        {barber.bio}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <Button variant="secondary" size="sm" onClick={() => setViewingProfile(barber)}>
                          Details
                        </Button>
                        <Link href="/login" style={{ textDecoration: 'none' }}>
                          <Button variant="primary" size="sm" fullWidth>
                            Sign In to Book
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </main>
          </>
        ) : (
          /* LOGGED IN USER DASHBOARD */
          <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome back, {user.firstName}!</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Manage your appointments and bookings in one place.</p>
              </div>
              <Link href="/search" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="md" icon={<Search size={16} />}>
                  Search Barbers
                </Button>
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
              {/* LEFT COLUMN: APPOINTMENTS & ACTIVITY */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* UPCOMING APPOINTMENTS */}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} /> Upcoming Appointments
                  </h3>
                  {appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length === 0 ? (
                    <Card variant="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No upcoming appointments scheduled.</p>
                      <Link href="/search" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '0.75rem' }}>
                        <Button variant="outline" size="sm">Book a Cut</Button>
                      </Link>
                    </Card>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').map(appt => (
                        <Card key={appt.id} variant="glass" style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{appt.service.name}</h4>
                              <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                                with {appt.barber.user.firstName} {appt.barber.user.lastName}
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                {new Date(appt.startTime).toLocaleString()}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <Badge variant={appt.status === 'CONFIRMED' ? 'success' : 'warning'} size="sm">
                                {appt.status}
                              </Badge>
                              <div style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                ${appt.totalPrice}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* RECENT ACTIVITY & REVIEW PROMPTS */}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Scissors size={18} /> Recent Activity
                  </h3>
                  {appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED').length === 0 ? (
                    <Card variant="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No past appointments recorded.</p>
                    </Card>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED').map(appt => {
                        const needsReview = appt.status === 'COMPLETED' && !appt.review;
                        return (
                          <Card key={appt.id} variant="glass" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div>
                                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {appt.service.name}
                                  <Badge variant={appt.status === 'COMPLETED' ? 'info' : 'danger'} size="sm">
                                    {appt.status}
                                  </Badge>
                                </h4>
                                <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                                  with {appt.barber.user.firstName} {appt.barber.user.lastName}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                  {new Date(appt.startTime).toLocaleString()}
                                </p>
                              </div>

                              {needsReview && reviewingApptId !== appt.id && (
                                <Button variant="primary" size="sm" onClick={() => setReviewingApptId(appt.id)}>
                                  Rate & Review
                                </Button>
                              )}
                            </div>

                            {/* REVIEW SUBMISSION FORM INLINE */}
                            {needsReview && reviewingApptId === appt.id && (
                              <form onSubmit={(e) => handleReviewSubmit(e, appt.id)} style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Your Rating:</span>
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: star <= reviewRating ? '#f59e0b' : '#64748b', fontSize: '1.25rem', padding: 0 }}
                                      >
                                        ★
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <textarea
                                  placeholder="Write your review here..."
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  required
                                  style={{ width: '100%', height: '80px', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b1318', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                  <Button variant="outline" size="sm" type="button" onClick={() => setReviewingApptId(null)}>Cancel</Button>
                                  <Button variant="primary" size="sm" type="submit" disabled={submittingReview}>
                                    {submittingReview ? 'Submitting...' : 'Submit'}
                                  </Button>
                                </div>
                              </form>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: SAVED BARBERS & QUICK LINKS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* FAVORITED BARBERS */}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={18} fill="#f59e0b" color="#f59e0b" /> Saved Barbers
                  </h3>
                  {barbers.filter(b => savedBarberIds.includes(b.id)).length === 0 ? (
                    <Card variant="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>You don't have any saved barbers yet.</p>
                      <Link href="/search" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '0.75rem' }}>
                        <Button variant="outline" size="sm">Browse Barbers</Button>
                      </Link>
                    </Card>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {barbers.filter(b => savedBarberIds.includes(b.id)).map(barber => (
                        <Card key={barber.id} variant="glass" style={{ padding: '0.85rem', position: 'relative' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <img src={barber.avatarUrl} alt={barber.name} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #0d9488' }} />
                            <div>
                              <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>{barber.name}</h4>
                              <RatingStars rating={barber.rating} reviewCount={barber.reviewCount} size="sm" />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                            <Button variant="secondary" size="sm" onClick={() => setViewingProfile(barber)} fullWidth>Details</Button>
                            <Button variant="primary" size="sm" onClick={() => { setSelectedBarber(barber); if (barber.services.length > 0) setSelectedService(barber.services[0]); }} fullWidth>Book</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* QUICK ACTIONS */}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>Quick Actions</h3>
                  <Card variant="glass" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <Link href="/search" style={{ textDecoration: 'none' }}>
                      <Button variant="outline" size="md" fullWidth style={{ justifyContent: 'flex-start' }}>🔍 Search & Book cuts</Button>
                    </Link>
                    <Link href="/history" style={{ textDecoration: 'none' }}>
                      <Button variant="outline" size="md" fullWidth style={{ justifyContent: 'flex-start' }}>📅 My Booking History</Button>
                    </Link>
                    <Link href="/profile" style={{ textDecoration: 'none' }}>
                      <Button variant="outline" size="md" fullWidth style={{ justifyContent: 'flex-start' }}>👤 Manage Profile</Button>
                    </Link>
                    <Link href="/settings" style={{ textDecoration: 'none' }}>
                      <Button variant="outline" size="md" fullWidth style={{ justifyContent: 'flex-start' }}>⚙️ Settings</Button>
                    </Link>
                  </Card>
                </div>
              </div>
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
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}> {viewingProfile.baseAddress}</p>
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
                    <div style={{ color: '#2dd4bf', fontWeight: 700 }}> Studio ${srv.studioPrice}</div>
                    <div style={{ color: '#f59e0b', fontWeight: 700 }}> House Call ${srv.houseCallPrice}</div>
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
                    <RatingStars rating={rev.rating} size="sm" />
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
                       House Call (${selectedService?.houseCallPrice})
                    </Button>
                    <Button
                      type="button"
                      variant={bookingLocationType === 'STUDIO' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setBookingLocationType('STUDIO')}
                    >
                       Barber Studio (${selectedService?.studioPrice})
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
