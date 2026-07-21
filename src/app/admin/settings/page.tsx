'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import {
  Settings, LayoutDashboard, FileText, Save,
  Database, RefreshCw, AlertTriangle, Shield, Globe, Bell, Wrench,
} from 'lucide-react';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Main = styled.main`
  flex: 1;
  max-width: 900px;
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
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const SettingsSection = styled(Card)`
  padding: 1.75rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  margin-bottom: 1.25rem;
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  &:last-child { border-bottom: none; }
`;

const ToggleLabel = styled.div``;
const ToggleTitle = styled.div`font-weight: 600; font-size: 0.9rem;`;
const ToggleDesc = styled.div`font-size: 0.8rem; color: ${({ theme }) => theme.colors.textSecondary};`;

const Toggle = styled.button<{ on: boolean }>`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: ${({ on, theme }) => on ? theme.colors.primary : theme.colors.border};
  border: none;
  cursor: pointer;
  position: relative;
  transition: background ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${({ on }) => on ? '23px' : '3px'};
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    transition: left ${({ theme }) => theme.transitions.fast};
  }
`;

const DangerSection = styled(SettingsSection)`
  border-color: rgba(239, 68, 68, 0.35);
`;

export default function AdminSettingsPage() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [resetModal, setResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Platform settings (would be backed by DB / env vars in production)
  const [maxTravelRadius, setMaxTravelRadius] = useState('50');
  const [requireVerification, setRequireVerification] = useState(true);
  const [allowHouseCalls, setAllowHouseCalls] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newRegistrations, setNewRegistrations] = useState(true);
  const [adminEmail, setAdminEmail] = useState('admin@fadefinder.com');
  const [siteName, setSiteName] = useState('Fade Finder');
  const [siteTagline, setSiteTagline] = useState('Local Barbers. On Demand.');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setToast({ message: 'Platform settings saved', type: 'success' });
    }, 700);
  };

  const handleDbReset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset-db', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setToast({ message: ' Database reset and reseeded successfully', type: 'success' });
        setResetModal(false);
      } else {
        setToast({ message: data.error || 'Reset failed', type: 'error' });
      }
    } catch {
      setToast({ message: 'Reset failed — see console', type: 'error' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <PageWrapper>
      <Navbar activeTab="PORTAL" />
      <Main>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <PageTitle>
          <Settings size={28} color="#0d9488" />
          Platform Settings
        </PageTitle>
        <PageSubtitle>Configure site-wide settings and platform behavior</PageSubtitle>

        <AdminNav>
          <NavPill href="/admin">
            <LayoutDashboard size={14} /> Overview
          </NavPill>
          <NavPill href="/admin/settings" active>
            <Settings size={14} /> Settings
          </NavPill>
          <NavPill href="/admin/content">
            <FileText size={14} /> Content
          </NavPill>
        </AdminNav>

        {/* SITE IDENTITY */}
        <SettingsSection>
          <SectionTitle><Globe size={14} /> Site Identity</SectionTitle>
          <FormGrid>
            <Input
              label="Site Name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              id="site-name"
            />
            <Input
              label="Tagline"
              value={siteTagline}
              onChange={(e) => setSiteTagline(e.target.value)}
              id="site-tagline"
            />
            <Input
              label="Admin Email"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              id="admin-email"
            />
          </FormGrid>
        </SettingsSection>

        {/* PLATFORM RULES */}
        <SettingsSection>
          <SectionTitle><Shield size={14} /> Platform Rules</SectionTitle>
          <Input
            label="Default Max Travel Radius (miles)"
            type="number"
            value={maxTravelRadius}
            onChange={(e) => setMaxTravelRadius(e.target.value)}
            style={{ marginBottom: '1rem' }}
            id="max-travel-radius"
          />

          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>Require Barber Verification</ToggleTitle>
              <ToggleDesc>New barbers must be admin-approved before appearing in search</ToggleDesc>
            </ToggleLabel>
            <Toggle on={requireVerification} onClick={() => setRequireVerification(!requireVerification)} id="toggle-verification" />
          </ToggleRow>

          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>Allow House Calls</ToggleTitle>
              <ToggleDesc>Barbers can offer mobile/house-call services platform-wide</ToggleDesc>
            </ToggleLabel>
            <Toggle on={allowHouseCalls} onClick={() => setAllowHouseCalls(!allowHouseCalls)} id="toggle-house-calls" />
          </ToggleRow>

          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>Allow New Registrations</ToggleTitle>
              <ToggleDesc>New barber and customer accounts can be created</ToggleDesc>
            </ToggleLabel>
            <Toggle on={newRegistrations} onClick={() => setNewRegistrations(!newRegistrations)} id="toggle-registrations" />
          </ToggleRow>
        </SettingsSection>

        {/* NOTIFICATIONS */}
        <SettingsSection>
          <SectionTitle><Bell size={14} /> Admin Notifications</SectionTitle>
          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>New Verification Requests</ToggleTitle>
              <ToggleDesc>Email admin when a new barber submits for verification</ToggleDesc>
            </ToggleLabel>
            <Toggle on={true} onClick={() => {}} id="toggle-notif-verification" />
          </ToggleRow>
          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>Platform Errors</ToggleTitle>
              <ToggleDesc>Alert admin when API errors occur above threshold</ToggleDesc>
            </ToggleLabel>
            <Toggle on={true} onClick={() => {}} id="toggle-notif-errors" />
          </ToggleRow>
        </SettingsSection>

        {/* MAINTENANCE */}
        <SettingsSection>
          <SectionTitle><Wrench size={14} /> Maintenance</SectionTitle>
          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>Maintenance Mode</ToggleTitle>
              <ToggleDesc>Show a maintenance page to all non-admin users</ToggleDesc>
            </ToggleLabel>
            <Toggle on={maintenanceMode} onClick={() => setMaintenanceMode(!maintenanceMode)} id="toggle-maintenance" />
          </ToggleRow>
        </SettingsSection>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <Button variant="primary" size="md" icon={<Save size={15} />} onClick={handleSave} disabled={saving} id="save-settings">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {/* DANGER ZONE */}
        <DangerSection>
          <SectionTitle style={{ color: 'rgba(239,68,68,0.7)' }}>
            <AlertTriangle size={14} /> Danger Zone
          </SectionTitle>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700 }}>Reset & Reseed Database</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Wipes all user-generated data and repopulates with seed data. <strong style={{ color: '#ef4444' }}>Cannot be undone.</strong>
              </div>
            </div>
            <Button
              variant="danger" size="md" icon={<Database size={15} />}
              onClick={() => setResetModal(true)}
              id="db-reset-btn"
            >
              Reset Database
            </Button>
          </div>
        </DangerSection>
      </Main>

      {/* RESET CONFIRMATION MODAL */}
      <Modal
        isOpen={resetModal}
        onClose={() => setResetModal(false)}
        title=" Confirm Database Reset"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            This will <strong style={{ color: '#ef4444' }}>permanently delete</strong> all appointments, barber profiles,
            user accounts, and reviews — then repopulate from the seed file.
          </p>
          <p style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" size="md" onClick={() => setResetModal(false)}>Cancel</Button>
            <Button
              variant="danger" size="md" icon={<RefreshCw size={15} />}
              onClick={handleDbReset} disabled={resetting}
              id="confirm-reset"
            >
              {resetting ? 'Resetting...' : 'Yes, Reset Everything'}
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </PageWrapper>
  );
}
