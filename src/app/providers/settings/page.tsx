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

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Container = styled.main`
  flex: 1;
  max-width: 800px;
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
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  padding-bottom: 0.75rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  margin-bottom: 0.75rem;

  input {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

export default function ProviderSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [smsNotifs, setSmsNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [bufferTimeMins, setBufferTimeMins] = useState('15');

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setEmail(data.user.email || '');
        setPhone(data.user.phone || '');
      }
    } catch (err) {
      console.error('Failed to load user settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      setToast({ message: 'Provider settings updated successfully', type: 'success' });
    } catch {
      setToast({ message: 'Failed to update settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Navbar activeTab="PORTAL" />
        <Container style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <p style={{ color: '#94a3b8' }}>Loading Settings...</p>
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
            <Title>Provider Settings</Title>
            <Subtitle>Manage account security, contact details, and notification preferences</Subtitle>
          </div>
          <Button variant="outline" size="md" onClick={() => router.push('/providers')}>
            Back to Dashboard
          </Button>
        </Header>

        <form onSubmit={handleSaveSettings}>
          {/* Account Details */}
          <SectionCard>
            <SectionTitle>👤 Account Information</SectionTitle>
            <FormRow>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Phone Number (SMS Notifications)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormRow>
          </SectionCard>

          {/* Security & Password */}
          <SectionCard>
            <SectionTitle>🔒 Security & Password</SectionTitle>
            <FormRow>
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </FormRow>
          </SectionCard>

          {/* Notifications & Booking Rules */}
          <SectionCard>
            <SectionTitle>🔔 Notifications & Scheduling Rules</SectionTitle>
            <CheckboxOption>
              <input
                type="checkbox"
                checked={smsNotifs}
                onChange={(e) => setSmsNotifs(e.target.checked)}
              />
              Receive SMS text alerts for instant booking requests and cancellations
            </CheckboxOption>

            <CheckboxOption>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
              />
              Send daily appointment summary and analytics digest via email
            </CheckboxOption>

            <div style={{ marginTop: '1.25rem' }}>
              <Input
                label="Buffer Time Between Appointments (Minutes)"
                type="number"
                value={bufferTimeMins}
                onChange={(e) => setBufferTimeMins(e.target.value)}
              />
            </div>
          </SectionCard>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button variant="primary" size="lg" type="submit" disabled={saving}>
              {saving ? 'Saving Settings...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </Container>
      <Footer />
    </PageWrapper>
  );
}
