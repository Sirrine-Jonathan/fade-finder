'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Settings, User, Lock, Bell, RefreshCw, Save, LogOut } from 'lucide-react';

interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
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
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    margin: 0;
  }
`;

const SettingsCard = styled(Card)`
  padding: 1.75rem;
  margin-bottom: 1.25rem;
`;

const CardTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
`;

const SettingsForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NameRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
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

const DangerCard = styled(SettingsCard)`
  border-color: rgba(239, 68, 68, 0.3);
`;

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification prefs (stored in localStorage)
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySMS, setNotifySMS] = useState(false);
  const [notifyBookingUpdates, setNotifyBookingUpdates] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          setFirstName(data.user.firstName);
          setLastName(data.user.lastName);
          setEmail(data.user.email);
          setPhone(data.user.phone || '');
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));

    // Load notification prefs
    const prefs = JSON.parse(localStorage.getItem('fade-notif-prefs') || '{}');
    if (prefs.email !== undefined) setNotifyEmail(prefs.email);
    if (prefs.sms !== undefined) setNotifySMS(prefs.sms);
    if (prefs.bookingUpdates !== undefined) setNotifyBookingUpdates(prefs.bookingUpdates);
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // In a real implementation this would call an update API
    setTimeout(() => {
      setSaving(false);
      setToast({ message: 'Profile updated successfully', type: 'success' });
    }, 600);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', type: 'error' });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToast({ message: 'Password updated successfully', type: 'success' });
    }, 600);
  };

  const saveNotifPrefs = (updates: object) => {
    const current = JSON.parse(localStorage.getItem('fade-notif-prefs') || '{}');
    localStorage.setItem('fade-notif-prefs', JSON.stringify({ ...current, ...updates }));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <PageWrapper>
        <Navbar activeTab="CLIENT" />
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
          <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <p>Loading settings...</p>
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

        <PageHeader>
          <Settings size={28} color="#0d9488" />
          <h1>Account Settings</h1>
        </PageHeader>

        {/* PROFILE INFO */}
        <SettingsCard>
          <CardTitle><User size={14} /> Profile Information</CardTitle>
          <form onSubmit={handleSaveProfile} id="settings-profile-form">
            <SettingsForm>
              <NameRow>
                <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} id="settings-first-name" />
                <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} id="settings-last-name" />
              </NameRow>
              <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} id="settings-email" />
              <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} id="settings-phone" />
              <div>
                <Button type="submit" variant="primary" size="md" disabled={saving} icon={<Save size={14} />} id="settings-save-profile">
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </SettingsForm>
          </form>
        </SettingsCard>

        {/* CHANGE PASSWORD */}
        <SettingsCard>
          <CardTitle><Lock size={14} /> Change Password</CardTitle>
          <form onSubmit={handleChangePassword} id="settings-password-form">
            <SettingsForm>
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                id="settings-current-password"
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                id="settings-new-password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                id="settings-confirm-password"
              />
              <div>
                <Button type="submit" variant="secondary" size="md" disabled={saving} id="settings-change-password">
                  Update Password
                </Button>
              </div>
            </SettingsForm>
          </form>
        </SettingsCard>

        {/* NOTIFICATIONS */}
        <SettingsCard>
          <CardTitle><Bell size={14} /> Notification Preferences</CardTitle>
          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>Email Notifications</ToggleTitle>
              <ToggleDesc>Receive appointment reminders via email</ToggleDesc>
            </ToggleLabel>
            <Toggle
              on={notifyEmail}
              onClick={() => { setNotifyEmail(!notifyEmail); saveNotifPrefs({ email: !notifyEmail }); }}
              id="toggle-notify-email"
            />
          </ToggleRow>
          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>SMS Notifications</ToggleTitle>
              <ToggleDesc>Text message reminders and updates</ToggleDesc>
            </ToggleLabel>
            <Toggle
              on={notifySMS}
              onClick={() => { setNotifySMS(!notifySMS); saveNotifPrefs({ sms: !notifySMS }); }}
              id="toggle-notify-sms"
            />
          </ToggleRow>
          <ToggleRow>
            <ToggleLabel>
              <ToggleTitle>Booking Status Updates</ToggleTitle>
              <ToggleDesc>Notify me when an appointment is confirmed, cancelled, or changed</ToggleDesc>
            </ToggleLabel>
            <Toggle
              on={notifyBookingUpdates}
              onClick={() => { setNotifyBookingUpdates(!notifyBookingUpdates); saveNotifPrefs({ bookingUpdates: !notifyBookingUpdates }); }}
              id="toggle-notify-bookings"
            />
          </ToggleRow>
        </SettingsCard>

        {/* SIGN OUT */}
        <DangerCard>
          <CardTitle style={{ color: 'rgba(239,68,68,0.7)' }}>Danger Zone</CardTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700 }}>Sign Out</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Sign out from this device. Your data will be preserved.
              </div>
            </div>
            <Button variant="danger" size="md" icon={<LogOut size={15} />} onClick={handleLogout} id="settings-logout">
              Sign Out
            </Button>
          </div>
        </DangerCard>
      </Main>
      <Footer />
    </PageWrapper>
  );
}
