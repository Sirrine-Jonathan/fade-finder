'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  UserCheck,
  Award,
  DollarSign,
  ChevronRight,
  Sparkles
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
  status: string;
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
  const [activeTab, setActiveTab] = useState<'CLIENT' | 'BARBER'>('CLIENT');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingDb, setResettingDb] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'ALL' | 'HOUSE_CALL' | 'STUDIO'>('ALL');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 40.7608,
    lng: -111.8910, // Default Salt Lake City Downtown for demo
  });
  const [locationName, setLocationName] = useState('Salt Lake City, UT (Downtown)');

  // Booking Modal State
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingLocationType, setBookingLocationType] = useState<'STUDIO' | 'HOUSE_CALL'>('HOUSE_CALL');
  const [clientAddress, setClientAddress] = useState('789 Foothill Dr, Salt Lake City, UT');
  const [bookingDate, setBookingDate] = useState('2026-07-20');
  const [bookingTime, setBookingTime] = useState('14:00');
  const [bookingNotes, setBookingNotes] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');

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
        setBarbers(data.data);
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
  }, [serviceTypeFilter, userCoords]);

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
          setLocationName('Your Current GPS Location');
        },
        (err) => {
          alert('GPS permission denied or unavailable. Using default SLC location.');
        }
      );
    }
  };

  const handleResetDb = async () => {
    if (!confirm('Scrub database and repopulate with fresh deterministic test data?')) return;
    setResettingDb(true);
    try {
      const res = await fetch('/api/reset-db', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Database scrubbed & seeded successfully!');
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b1318', color: '#f8fafc' }}>
      {/* HEADER NAVBAR */}
      <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand Logo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Fade Finder Logo" style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #0d9488' }} />
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                FADE FINDER
                <span style={{ fontSize: '0.65rem', backgroundColor: '#0d9488', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MVP</span>
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Local Barbers. On Demand.</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                  transition: 'all 0.2s',
                }}
              >
                Find Barbers
              </button>
              <button
                onClick={() => setActiveTab('BARBER')}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'BARBER' ? '#0d9488' : 'transparent',
                  color: activeTab === 'BARBER' ? '#fff' : '#94a3b8',
                  transition: 'all 0.2s',
                }}
              >
                Bookings ({appointments.length})
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
              {resettingDb ? 'Resetting...' : 'Reset & Seed DB'}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {activeTab === 'CLIENT' ? (
          <>
            {/* HERO & SEARCH BANNER */}
            <div
              style={{
                background: 'linear-gradient(135deg, #131f26 0%, #0d948822 100%)',
                borderRadius: '16px',
                padding: '2.5rem 2rem',
                marginBottom: '2.5rem',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ maxWidth: '700px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(13, 148, 136, 0.15)', color: '#2dd4bf', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
                  <Sparkles size={14} /> Mobile House Calls & Studio Cuts
                </div>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
                  Book Top Local Barbers to Your Door or Studio
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1.5rem' }}>
                  Compare barbers by travel radius, customer ratings, DOPL license verification, and dual-tier studio vs. house call pricing.
                </p>

                {/* SEARCH CONTROLS */}
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                      <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="text"
                        placeholder="Search by barber name, service (Fade, Beard), or address..."
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
                        fontWeight: 600,
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    
                    {/* Location Badge & GPS */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} color="#0d9488" />
                      <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Location: <strong>{locationName}</strong></span>
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
                        <Compass size={12} /> Use GPS
                      </button>
                    </div>

                    {/* Filter Pills */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(['ALL', 'HOUSE_CALL', 'STUDIO'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setServiceTypeFilter(type)}
                          style={{
                            padding: '0.35rem 0.75rem',
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
                          {type === 'ALL' && 'All Services'}
                          {type === 'HOUSE_CALL' && '🚗 House Call (Mobile)'}
                          {type === 'STUDIO' && '💈 In-Studio'}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* BARBER CARDS GRID */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Available Local Barbers
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>({barbers.length} found)</span>
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
                <p>Finding available barbers in your area...</p>
              </div>
            ) : barbers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', backgroundColor: '#131f26', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <Scissors size={36} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No barbers found</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>Try adjusting your search filters or radius.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className="glass-panel"
                    style={{
                      borderRadius: '16px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      {/* BARBER HEADER INFO */}
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <img
                          src={barber.avatarUrl}
                          alt={barber.name}
                          style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d9488' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{barber.name}</h4>
                            {barber.isVerified && (
                              <span
                                title={`Verified DOPL License: ${barber.licenseNumber}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  fontSize: '0.7rem',
                                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                  color: '#f59e0b',
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                }}
                              >
                                <Award size={12} /> DOPL Verified
                              </span>
                            )}
                          </div>

                          {/* RATING & DISTANCE */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.3rem', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 700 }}>
                              <Star size={14} fill="#f59e0b" /> {barber.rating}
                              <span style={{ color: '#94a3b8', fontWeight: 400 }}>({barber.reviewCount})</span>
                            </div>

                            {barber.distanceMiles !== null && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#38bdf8' }}>
                                <MapPin size={13} /> {barber.distanceMiles} mi away
                              </div>
                            )}
                          </div>

                          {/* TRAVEL RADIUS BADGE */}
                          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Car size={13} color="#2dd4bf" /> Mobile travel up to <strong>{barber.maxTravelRadiusMiles} miles</strong>
                          </div>
                        </div>
                      </div>

                      {/* BIO */}
                      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem', lineHeight: 1.4 }}>
                        {barber.bio}
                      </p>

                      {/* PORTFOLIO IMAGES PREVIEW */}
                      {barber.portfolio.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Work Gallery</span>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                            {barber.portfolio.slice(0, 3).map((img) => (
                              <img
                                key={img.id}
                                src={img.imageUrl}
                                alt="Barber work"
                                style={{ width: '70px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SERVICE MENU PREVIEW */}
                      <div style={{ backgroundColor: '#0b1318', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Popular Services & Pricing</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                          {barber.services.slice(0, 2).map((srv) => (
                            <div key={srv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                              <div>
                                <strong style={{ color: '#f8fafc' }}>{srv.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{srv.durationMinutes} mins</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ color: '#2dd4bf', fontWeight: 600 }}>💈 Studio: ${srv.studioPrice}</div>
                                <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>🚗 House Call: ${srv.houseCallPrice}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* BOOK BUTTON */}
                    <button
                      onClick={() => {
                        setSelectedBarber(barber);
                        if (barber.services.length > 0) setSelectedService(barber.services[0]);
                      }}
                      style={{
                        width: '100%',
                        backgroundColor: '#0d9488',
                        color: '#fff',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.75rem',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Calendar size={16} /> Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* BARBER DASHBOARD & BOOKINGS TAB */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Appointment Bookings</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Real-time appointment schedule & client house-call requests.</p>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', backgroundColor: '#131f26', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <Calendar size={36} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No bookings recorded yet</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>Book an appointment from the "Find Barbers" tab!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="glass-panel"
                    style={{
                      borderRadius: '14px',
                      padding: '1.25rem',
                      borderLeft: appt.status === 'CONFIRMED' ? '4px solid #0d9488' : '4px solid #f59e0b',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: appt.locationType === 'HOUSE_CALL' ? '#f59e0b' : '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                          {appt.locationType === 'HOUSE_CALL' ? '🚗 House Call (Mobile)' : '💈 In-Studio Cut'}
                        </span>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{appt.service.name}</h4>
                      </div>
                      <span style={{ fontSize: '0.75rem', backgroundColor: appt.status === 'CONFIRMED' ? 'rgba(13, 148, 136, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: appt.status === 'CONFIRMED' ? '#2dd4bf' : '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                        {appt.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                      <div><strong>Barber:</strong> {appt.barber.user.firstName} {appt.barber.user.lastName} ({appt.barber.user.phone})</div>
                      <div><strong>Client:</strong> {appt.client.firstName} {appt.client.lastName} ({appt.client.phone})</div>
                      {appt.clientAddress && <div><strong>Location:</strong> {appt.clientAddress}</div>}
                      <div><strong>Scheduled:</strong> {new Date(appt.startTime).toLocaleString()}</div>
                      <div><strong>Total Price:</strong> <span style={{ color: '#2dd4bf', fontWeight: 700 }}>${appt.totalPrice}</span></div>
                    </div>

                    {appt.notes && (
                      <div style={{ backgroundColor: '#0b1318', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                        Notes: "{appt.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* BOOKING MODAL */}
      {selectedBarber && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', borderRadius: '20px', padding: '2rem', position: 'relative', border: '1px solid rgba(255,255,255,0.15)' }}>
            
            <button
              onClick={() => setSelectedBarber(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', backgroundColor: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <img src={selectedBarber.avatarUrl} alt={selectedBarber.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d9488' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Book with {selectedBarber.name}</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedBarber.baseAddress}</p>
              </div>
            </div>

            {bookingSuccessMsg ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#2dd4bf' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{bookingSuccessMsg}</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>Closing window...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* SERVICE SELECTOR */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Select Service</label>
                  <select
                    value={selectedService?.id}
                    onChange={(e) => {
                      const srv = selectedBarber.services.find((s) => s.id === e.target.value);
                      if (srv) setSelectedService(srv);
                    }}
                    style={{ width: '100%', backgroundColor: '#0b1318', border: '1px solid #334155', borderRadius: '8px', padding: '0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  >
                    {selectedBarber.services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name} ({srv.durationMinutes} mins) — Studio: ${srv.studioPrice} / House Call: ${srv.houseCallPrice}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LOCATION TYPE */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Service Location Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setBookingLocationType('HOUSE_CALL')}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: bookingLocationType === 'HOUSE_CALL' ? '#f59e0b' : '#334155',
                        backgroundColor: bookingLocationType === 'HOUSE_CALL' ? 'rgba(245, 158, 11, 0.15)' : '#0b1318',
                        color: bookingLocationType === 'HOUSE_CALL' ? '#f59e0b' : '#94a3b8',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      🚗 Barber Comes to Me (${selectedService?.houseCallPrice})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingLocationType('STUDIO')}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: bookingLocationType === 'STUDIO' ? '#0d9488' : '#334155',
                        backgroundColor: bookingLocationType === 'STUDIO' ? 'rgba(13, 148, 136, 0.15)' : '#0b1318',
                        color: bookingLocationType === 'STUDIO' ? '#2dd4bf' : '#94a3b8',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      💈 Go to Barber's Studio (${selectedService?.studioPrice})
                    </button>
                  </div>
                </div>

                {/* HOUSE CALL ADDRESS INPUT */}
                {bookingLocationType === 'HOUSE_CALL' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Your Address for House Call</label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Street address, city, zip..."
                      style={{ width: '100%', backgroundColor: '#0b1318', border: '1px solid #334155', borderRadius: '8px', padding: '0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                )}

                {/* DATE & TIME */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#0b1318', border: '1px solid #334155', borderRadius: '8px', padding: '0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Time</label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#0b1318', border: '1px solid #334155', borderRadius: '8px', padding: '0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* NOTES */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Special Instructions / Notes</label>
                  <input
                    type="text"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Gate code, parking notes, fade preference..."
                    style={{ width: '100%', backgroundColor: '#0b1318', border: '1px solid #334155', borderRadius: '8px', padding: '0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={submittingBooking}
                  style={{
                    backgroundColor: '#0d9488',
                    color: '#fff',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.9rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                  }}
                >
                  {submittingBooking ? 'Processing Booking...' : `Confirm Booking ($${bookingLocationType === 'HOUSE_CALL' ? selectedService?.houseCallPrice : selectedService?.studioPrice})`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
