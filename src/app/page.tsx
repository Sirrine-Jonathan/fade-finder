'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Compass,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  Scissors,
  Car,
  Home,
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
  const [resettingDb, setResettingDb] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'ALL' | 'HOUSE_CALL' | 'STUDIO'>('ALL');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [maxRadiusFilter, setMaxRadiusFilter] = useState<number>(50);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 40.7608,
    lng: -111.8910, // Default Salt Lake City Downtown for demo
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
    setTimeout(() => setToastMessage(null), 3500);
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

  const handleResetDb = async () => {
    if (!confirm('Scrub database and repopulate with fresh test data?')) return;
    setResettingDb(true);
    try {
      const res = await fetch('/api/reset-db', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        triggerToast('⚡ Database Scrubbed & Seeded Successfully!');
        fetchBarbers();
        fetchAppointments();
      } else {
        alert('DB Reset error: ' + data.error);
      }
    } catch (err) {
      alert('Error connecting to DB reset endpoint');
    } finally {
      setResettingDb(false);
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0b1318', color: '#f8fafc', paddingBottom: '4rem' }}>
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          className="toast-notification glass-panel"
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 150,
            padding: '0.75rem 1.25rem',
            borderRadius: '12px',
            backgroundColor: '#0d9488',
            color: '#fff',
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <Sparkles size={16} /> {toastMessage}
        </div>
      )}

      {/* HEADER NAVBAR */}
      <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand Logo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Fade Finder Logo" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #0d9488' }} />
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                FADE FINDER
                <span style={{ fontSize: '0.65rem', backgroundColor: '#0d9488', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PWA</span>
              </h1>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Local Barbers. On Demand.</p>
            </div>
          </div>

          {/* Navigation Controls (Desktop) */}
          <div className="desktop-header-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', backgroundColor: '#131f26', padding: '0.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => setActiveTab('CLIENT')}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'CLIENT' ? '#0d9488' : 'transparent',
                  color: activeTab === 'CLIENT' ? '#fff' : '#94a3b8',
                }}
              >
                Find Barbers
              </button>
              <button
                onClick={() => setActiveTab('BOOKINGS')}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'BOOKINGS' ? '#0d9488' : 'transparent',
                  color: activeTab === 'BOOKINGS' ? '#fff' : '#94a3b8',
                }}
              >
                Bookings ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('PORTAL')}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'PORTAL' ? '#0d9488' : 'transparent',
                  color: activeTab === 'PORTAL' ? '#fff' : '#94a3b8',
                }}
              >
                Barber Portal
              </button>
            </div>

            {/* DB Reset CLI button */}
            <button
              onClick={handleResetDb}
              disabled={resettingDb}
              title="Scrub and re-seed database with dummy data"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#1e293b',
                color: '#94a3b8',
                border: '1px solid #334155',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={resettingDb ? 'animate-spin' : ''} />
              {resettingDb ? 'Resetting...' : 'Reset DB'}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        
        {activeTab === 'CLIENT' && (
          <>
            {/* HERO & SEARCH BANNER */}
            <div
              style={{
                background: 'linear-gradient(135deg, #131f26 0%, #0d948822 100%)',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                marginBottom: '2rem',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ maxWidth: '750px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(13, 148, 136, 0.15)', color: '#2dd4bf', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  <Sparkles size={14} /> Mobile House Calls & Studio Cuts
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>
                  Book Top Local Barbers to Your Door or Studio
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Compare barbers by travel radius, customer ratings, DOPL license verification, and dual-tier studio vs. house call pricing.
                </p>

                {/* SEARCH CONTROLS */}
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                      <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="text"
                        placeholder="Search barber, service (Fade, Beard), address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#0b1318',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem 0.75rem 2.5rem',
                          color: '#fff',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#0d9488',
                        color: '#fff',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem 1.5rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      Search
                    </button>
                  </div>

                  {/* LOCATION & SERVICE TYPE FILTERS */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    
                    {/* Location Badge & GPS */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} color="#0d9488" />
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Location: <strong>{locationName}</strong></span>
                      <button
                        type="button"
                        onClick={handleUseGPS}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          backgroundColor: '#1e293b',
                          color: '#38bdf8',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Compass size={12} /> GPS
                      </button>
                    </div>

                    {/* Filter Pills */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {(['ALL', 'HOUSE_CALL', 'STUDIO'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setServiceTypeFilter(type)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: serviceTypeFilter === type ? '#0d9488' : '#334155',
                            backgroundColor: serviceTypeFilter === type ? '#0d948822' : 'transparent',
                            color: serviceTypeFilter === type ? '#2dd4bf' : '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          {type === 'ALL' && 'All Types'}
                          {type === 'HOUSE_CALL' && '🚗 House Call'}
                          {type === 'STUDIO' && '💈 In-Studio'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ADVANCED FILTER DROPDOWNS */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>
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
              </div>
            </div>

            {/* BARBER CARDS GRID */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Available Local Barbers ({barbers.length})</span>
              {savedBarberIds.length > 0 && (
                <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
                  ⭐ {savedBarberIds.length} Saved Barbers
                </span>
              )}
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
                <p>Finding available barbers in your area...</p>
              </div>
            ) : barbers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', backgroundColor: '#131f26', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <Scissors size={36} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No barbers match your filters</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>Try clearing your filters or increasing travel radius.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className="glass-panel"
                    style={{
                      borderRadius: '16px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                    }}
                  >
                    <div>
                      {/* BOOKMARK BUTTON */}
                      <button
                        onClick={() => toggleBookmark(barber.id)}
                        title="Save Barber"
                        style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'transparent', border: 'none', color: savedBarberIds.includes(barber.id) ? '#f59e0b' : '#64748b', cursor: 'pointer' }}
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

                          {/* RATING & DISTANCE */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 700 }}>
                              <Star size={13} fill="#f59e0b" /> {barber.rating}
                              <span style={{ color: '#94a3b8', fontWeight: 400 }}>({barber.reviewCount})</span>
                            </div>

                            {barber.distanceMiles !== null && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#38bdf8' }}>
                                <MapPin size={12} /> {barber.distanceMiles} mi away
                              </div>
                            )}
                          </div>

                          {/* VERIFIED BADGE */}
                          {barber.isVerified && (
                            <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Award size={12} /> DOPL License: {barber.licenseNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* BIO */}
                      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                        {barber.bio}
                      </p>

                      {/* PORTFOLIO IMAGES PREVIEW */}
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

                      {/* SERVICE MENU PREVIEW */}
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
                      <button
                        onClick={() => setViewingProfile(barber)}
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#94a3b8',
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.65rem',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <Eye size={14} /> Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBarber(barber);
                          if (barber.services.length > 0) setSelectedService(barber.services[0]);
                        }}
                        style={{
                          backgroundColor: '#0d9488',
                          color: '#fff',
                          fontWeight: 700,
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.65rem',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Calendar size={14} /> Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* BOOKINGS LIST TAB */}
        {activeTab === 'BOOKINGS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Appointment Bookings</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Client appointment history & upcoming bookings.</p>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', backgroundColor: '#131f26', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <Calendar size={36} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No bookings recorded yet</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>Book an appointment from the "Find Barbers" tab!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="glass-panel"
                    style={{
                      borderRadius: '14px',
                      padding: '1.25rem',
                      borderLeft: appt.status === 'CONFIRMED' ? '4px solid #0d9488' : appt.status === 'COMPLETED' ? '4px solid #38bdf8' : '4px solid #f59e0b',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: appt.locationType === 'HOUSE_CALL' ? '#f59e0b' : '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                          {appt.locationType === 'HOUSE_CALL' ? '🚗 Mobile House Call' : '💈 In-Studio Cut'}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.2rem' }}>{appt.service.name}</h4>
                      </div>
                      <span style={{ fontSize: '0.7rem', backgroundColor: appt.status === 'CONFIRMED' ? 'rgba(13, 148, 136, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: appt.status === 'CONFIRMED' ? '#2dd4bf' : '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                        {appt.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem' }}>
                      <div><strong>Barber:</strong> {appt.barber.user.firstName} {appt.barber.user.lastName} ({appt.barber.user.phone})</div>
                      <div><strong>Client:</strong> {appt.client.firstName} {appt.client.lastName} ({appt.client.phone})</div>
                      {appt.clientAddress && <div><strong>Location:</strong> {appt.clientAddress}</div>}
                      <div><strong>Scheduled:</strong> {new Date(appt.startTime).toLocaleString()}</div>
                      <div><strong>Total Price:</strong> <span style={{ color: '#2dd4bf', fontWeight: 700 }}>${appt.totalPrice}</span></div>
                    </div>

                    {appt.notes && (
                      <div style={{ backgroundColor: '#0b1318', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                        Notes: "{appt.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BARBER MANAGEMENT PORTAL TAB */}
        {activeTab === 'PORTAL' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Barber Portal & Status Manager</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Manage incoming client house-call requests and update booking statuses.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
              {appointments.map((appt) => (
                <div key={appt.id} className="glass-panel" style={{ borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#2dd4bf', fontWeight: 700 }}>Appointment #{appt.id.slice(0, 8)}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>{appt.status}</span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{appt.service.name} (${appt.totalPrice})</h4>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.3rem 0 0.75rem 0' }}>
                    Client: {appt.client.firstName} {appt.client.lastName} • <a href={`tel:${appt.client.phone}`} style={{ color: '#38bdf8' }}>{appt.client.phone}</a>
                  </p>

                  {/* STATUS ACTION BUTTONS */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                      style={{ backgroundColor: '#0d9488', color: '#fff', border: 'none', padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                      style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                      style={{ backgroundColor: '#334155', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION DOCK */}
      <div className="mobile-nav-dock">
        <button
          onClick={() => setActiveTab('CLIENT')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', backgroundColor: 'transparent', border: 'none', color: activeTab === 'CLIENT' ? '#0d9488' : '#64748b', fontSize: '0.7rem', fontWeight: 600 }}
        >
          <Search size={18} /> Search
        </button>
        <button
          onClick={() => setActiveTab('BOOKINGS')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', backgroundColor: 'transparent', border: 'none', color: activeTab === 'BOOKINGS' ? '#0d9488' : '#64748b', fontSize: '0.7rem', fontWeight: 600 }}
        >
          <Calendar size={18} /> Bookings
        </button>
        <button
          onClick={() => setActiveTab('PORTAL')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', backgroundColor: 'transparent', border: 'none', color: activeTab === 'PORTAL' ? '#0d9488' : '#64748b', fontSize: '0.7rem', fontWeight: 600 }}
        >
          <Scissors size={18} /> Portal
        </button>
        <button
          onClick={handleResetDb}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', backgroundColor: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}
        >
          <RefreshCw size={18} /> Reset DB
        </button>
      </div>

      {/* BARBER DETAILS MODAL */}
      {viewingProfile && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px', padding: '1.5rem', position: 'relative' }}>
            <button onClick={() => setViewingProfile(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <img src={viewingProfile.avatarUrl} alt={viewingProfile.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d9488' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{viewingProfile.name}</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>📍 {viewingProfile.baseAddress}</p>
                <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.2rem', fontWeight: 600 }}>DOPL License: {viewingProfile.licenseNumber}</p>
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

            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#38bdf8' }}>Customer Reviews ({viewingProfile.reviews.length})</h4>
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
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedBarber && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', borderRadius: '20px', padding: '1.5rem', position: 'relative' }}>
            <button onClick={() => setSelectedBarber(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <img src={selectedBarber.avatarUrl} alt={selectedBarber.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d9488' }} />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Book with {selectedBarber.name}</h3>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selectedBarber.baseAddress}</p>
              </div>
            </div>

            {bookingSuccessMsg ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#2dd4bf' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{bookingSuccessMsg}</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>Closing window...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Select Service</label>
                  <select
                    value={selectedService?.id}
                    onChange={(e) => {
                      const srv = selectedBarber.services.find((s) => s.id === e.target.value);
                      if (srv) setSelectedService(srv);
                    }}
                    style={{ width: '100%', backgroundColor: '#0b1318', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                  >
                    {selectedBarber.services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name} ({srv.durationMinutes}m) — Studio: ${srv.studioPrice} / House Call: ${srv.houseCallPrice}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Location Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setBookingLocationType('HOUSE_CALL')}
                      style={{
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: bookingLocationType === 'HOUSE_CALL' ? '#f59e0b' : '#334155',
                        backgroundColor: bookingLocationType === 'HOUSE_CALL' ? 'rgba(245, 158, 11, 0.15)' : '#0b1318',
                        color: bookingLocationType === 'HOUSE_CALL' ? '#f59e0b' : '#94a3b8',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      🚗 House Call (${selectedService?.houseCallPrice})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingLocationType('STUDIO')}
                      style={{
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: bookingLocationType === 'STUDIO' ? '#0d9488' : '#334155',
                        backgroundColor: bookingLocationType === 'STUDIO' ? 'rgba(13, 148, 136, 0.15)' : '#0b1318',
                        color: bookingLocationType === 'STUDIO' ? '#2dd4bf' : '#94a3b8',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      💈 Barber Studio (${selectedService?.studioPrice})
                    </button>
                  </div>
                </div>

                {bookingLocationType === 'HOUSE_CALL' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>House Call Address</label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Street address, city, zip..."
                      style={{ width: '100%', backgroundColor: '#0b1318', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#0b1318', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Time</label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#0b1318', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Special Notes</label>
                  <input
                    type="text"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Gate code, parking notes, fade preference..."
                    style={{ width: '100%', backgroundColor: '#0b1318', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingBooking}
                  style={{
                    backgroundColor: '#0d9488',
                    color: '#fff',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.8rem',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    marginTop: '0.4rem',
                  }}
                >
                  {submittingBooking ? 'Confirming...' : `Confirm Booking ($${bookingLocationType === 'HOUSE_CALL' ? selectedService?.houseCallPrice : selectedService?.studioPrice})`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE PREVIEW */}
      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', cursor: 'pointer' }}>
          <img src={previewImage} alt="Work preview" style={{ maxWidth: '90%', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
}
