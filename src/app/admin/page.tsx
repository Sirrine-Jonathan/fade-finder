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
import { Modal } from '@/components/ui/Modal';
import {
  LayoutDashboard, Users, ShieldCheck, Settings, FileText,
  CheckCircle2, XCircle, Clock, RefreshCw, ChevronRight,
  Eye, Award, Mail, Phone, MapPin, Scissors, Calendar, TrendingUp,
} from 'lucide-react';

interface PendingBarber {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  licenseNumber: string;
  bio: string;
  baseAddress: string;
  verificationStatus: string;
  createdAt: string;
  services: Array<{ id: string; name: string; studioPrice: number; houseCallPrice: number }>;
}

interface StatsData {
  totalBarbers: number;
  pendingVerifications: number;
  totalAppointments: number;
  totalClients: number;
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
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PageSubtitle = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
`;

const StatCard = styled(Card)`
  padding: 1.5rem;
`;

const StatValue = styled.div`
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: ${({ theme }) => theme.colors.primaryAccent};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const AdminNav = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const NavPill = styled(Link)<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  background: ${({ active, theme }) => active ? theme.colors.primaryLight : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.primaryAccent : theme.colors.textSecondary};
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.textPrimary}; }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h2 {
    font-size: 1.15rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const VerificationCard = styled(Card)`
  padding: 1.25rem;
  margin-bottom: 0.85rem;
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const BarberAvatar = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const BarberDetails = styled.div`flex: 1; min-width: 200px;`;
const BarberName = styled.div`font-weight: 700; font-size: 1rem; margin-bottom: 0.25rem;`;
const BarberMeta = styled.div`font-size: 0.8rem; color: ${({ theme }) => theme.colors.textSecondary}; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.35rem;`;
const BarberBio = styled.p`font-size: 0.82rem; color: ${({ theme }) => theme.colors.textSecondary}; line-height: 1.4; margin: 0.5rem 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  font-size: 0.88rem;

  &:last-child { border-bottom: none; }
`;

export default function AdminPage() {
  const router = useRouter();
  const [pendingBarbers, setPendingBarbers] = useState<PendingBarber[]>([]);
  const [stats, setStats] = useState<StatsData>({ totalBarbers: 0, pendingVerifications: 0, totalAppointments: 0, totalClients: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<PendingBarber | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verifications');
      const data = await res.json();

      if (res.status === 403) {
        router.push('/');
        return;
      }
      if (data.success) {
        setPendingBarbers(data.data || []);
        setStats((prev) => ({ ...prev, pendingVerifications: data.count ?? 0 }));
      }
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerification = async (barberProfileId: string, action: 'APPROVE' | 'REJECT') => {
    setProcessing(barberProfileId);
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberProfileId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({
          message: action === 'APPROVE'
            ? ` Barber verified successfully`
            : ` Verification rejected`,
          type: action === 'APPROVE' ? 'success' : 'error',
        });
        setPendingBarbers((prev) => prev.filter((b) => b.id !== barberProfileId));
        setSelectedBarber(null);
      } else {
        setToast({ message: data.error || 'Action failed', type: 'error' });
      }
    } catch {
      setToast({ message: 'An error occurred', type: 'error' });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <PageWrapper>
      <Navbar activeTab="PORTAL" />
      <Main>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <PageTitle>
          <LayoutDashboard size={28} color="#0d9488" />
          Admin Dashboard
        </PageTitle>
        <PageSubtitle>Manage verifications, platform settings, and content</PageSubtitle>

        {/* ADMIN NAV */}
        <AdminNav>
          <NavPill href="/admin" active>
            <LayoutDashboard size={14} /> Overview
          </NavPill>
          <NavPill href="/admin/settings">
            <Settings size={14} /> Settings
          </NavPill>
          <NavPill href="/admin/content">
            <FileText size={14} /> Content
          </NavPill>
        </AdminNav>

        {/* STATS */}
        <StatsGrid>
          <StatCard variant="glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <ShieldCheck size={20} color="#0d9488" />
              <TrendingUp size={14} color="#64748b" />
            </div>
            <StatValue>{stats.pendingVerifications}</StatValue>
            <StatLabel><Clock size={12} /> Pending Verifications</StatLabel>
          </StatCard>
          <StatCard variant="glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <Scissors size={20} color="#0d9488" />
            </div>
            <StatValue>{stats.totalBarbers || '—'}</StatValue>
            <StatLabel><Award size={12} /> Total Barbers</StatLabel>
          </StatCard>
          <StatCard variant="glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <Users size={20} color="#0d9488" />
            </div>
            <StatValue>{stats.totalClients || '—'}</StatValue>
            <StatLabel>Total Customers</StatLabel>
          </StatCard>
          <StatCard variant="glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <Calendar size={20} color="#0d9488" />
            </div>
            <StatValue>{stats.totalAppointments || '—'}</StatValue>
            <StatLabel>Total Appointments</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* PENDING VERIFICATIONS */}
        <section>
          <SectionHeader>
            <h2>
              <ShieldCheck size={18} color="#0d9488" />
              Pending Barber Verifications
              {pendingBarbers.length > 0 && (
                <Badge variant="warning" size="sm">{pendingBarbers.length}</Badge>
              )}
            </h2>
            <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={loadData} id="refresh-btn">
              Refresh
            </Button>
          </SectionHeader>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
              Loading verifications...
            </div>
          ) : pendingBarbers.length === 0 ? (
            <EmptyState>
              <CheckCircle2 size={36} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.35 }} />
              <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>All clear!</p>
              <p style={{ fontSize: '0.85rem' }}>No pending barber verifications at this time.</p>
            </EmptyState>
          ) : (
            pendingBarbers.map((barber) => (
              <VerificationCard key={barber.id} variant="solid">
                <BarberAvatar src={barber.avatarUrl || '/logo.png'} alt={barber.name} />

                <BarberDetails>
                  <BarberName>{barber.name}</BarberName>
                  <BarberMeta><Mail size={12} /> {barber.email}</BarberMeta>
                  <BarberMeta><Phone size={12} /> {barber.phone}</BarberMeta>
                  <BarberMeta><Award size={12} /> License: {barber.licenseNumber}</BarberMeta>
                  <BarberMeta><MapPin size={12} /> {barber.baseAddress}</BarberMeta>
                  <BarberBio>{barber.bio}</BarberBio>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Applied: {new Date(barber.createdAt).toLocaleDateString()}
                    {' · '}{barber.services.length} service{barber.services.length !== 1 ? 's' : ''} listed
                  </div>
                </BarberDetails>

                <ActionButtons>
                  <Button
                    variant="ghost" size="sm" icon={<Eye size={14} />}
                    onClick={() => setSelectedBarber(barber)}
                    id={`view-barber-${barber.id}`}
                  >
                    Details
                  </Button>
                  <Button
                    variant="danger" size="sm" icon={<XCircle size={14} />}
                    disabled={processing === barber.id}
                    onClick={() => handleVerification(barber.id, 'REJECT')}
                    id={`reject-barber-${barber.id}`}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary" size="sm" icon={<CheckCircle2 size={14} />}
                    disabled={processing === barber.id}
                    onClick={() => handleVerification(barber.id, 'APPROVE')}
                    id={`approve-barber-${barber.id}`}
                  >
                    {processing === barber.id ? 'Processing...' : 'Approve'}
                  </Button>
                </ActionButtons>
              </VerificationCard>
            ))
          )}
        </section>
      </Main>

      {/* DETAIL MODAL */}
      {selectedBarber && (
        <Modal
          isOpen={!!selectedBarber}
          onClose={() => setSelectedBarber(null)}
          title={`Review: ${selectedBarber.name}`}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            <BarberAvatar src={selectedBarber.avatarUrl || '/logo.png'} alt={selectedBarber.name} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedBarber.name}</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{selectedBarber.email}</div>
            </div>
          </div>

          <DetailRow>
            <span style={{ color: '#94a3b8' }}>License Number</span>
            <span style={{ fontWeight: 700 }}>{selectedBarber.licenseNumber}</span>
          </DetailRow>
          <DetailRow>
            <span style={{ color: '#94a3b8' }}>Base Address</span>
            <span>{selectedBarber.baseAddress}</span>
          </DetailRow>
          <DetailRow>
            <span style={{ color: '#94a3b8' }}>Phone</span>
            <span>{selectedBarber.phone}</span>
          </DetailRow>
          <DetailRow>
            <span style={{ color: '#94a3b8' }}>Applied</span>
            <span>{new Date(selectedBarber.createdAt).toLocaleString()}</span>
          </DetailRow>

          {selectedBarber.bio && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.35rem' }}>BIO</div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{selectedBarber.bio}</p>
            </div>
          )}

          {selectedBarber.services.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.5rem' }}>SERVICES</div>
              {selectedBarber.services.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span>{s.name}</span>
                  <span style={{ color: '#0d9488' }}>Studio ${s.studioPrice} / House ${s.houseCallPrice}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button variant="danger" size="md" icon={<XCircle size={15} />} onClick={() => handleVerification(selectedBarber.id, 'REJECT')} disabled={processing === selectedBarber.id}>
              Reject
            </Button>
            <Button variant="primary" size="md" icon={<CheckCircle2 size={15} />} onClick={() => handleVerification(selectedBarber.id, 'APPROVE')} disabled={processing === selectedBarber.id}>
              {processing === selectedBarber.id ? 'Processing...' : 'Approve & Verify'}
            </Button>
          </div>
        </Modal>
      )}

      <Footer />
    </PageWrapper>
  );
}
