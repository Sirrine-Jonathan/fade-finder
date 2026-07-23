'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.25rem;
`;

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 580px;
  padding: 2.5rem;
`;

const AuthHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const NoticeBox = styled.div`
  background-color: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1rem 1.25rem;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.5;

  strong {
    color: ${({ theme }) => theme.colors.primaryAccent};
  }
`;

const RequirementsLinks = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.25rem;

  a {
    color: ${({ theme }) => theme.colors.primaryAccent};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const AuthFooterText = styled.p`
  text-align: center;
  margin-top: 1.75rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    color: ${({ theme }) => theme.colors.primaryAccent};
    font-weight: 600;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default function ProviderRegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [baseAddress, setBaseAddress] = useState('');
  const [bio, setBio] = useState('');
  const [maxTravelRadiusMiles, setMaxTravelRadiusMiles] = useState('15');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !licenseNumber || !baseAddress) {
      setToast({ message: 'Please complete all required fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'BARBER',
          firstName,
          lastName,
          email,
          password,
          phone,
          licenseNumber,
          baseAddress,
          bio,
          maxTravelRadiusMiles: parseFloat(maxTravelRadiusMiles) || 15.0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({
          message: 'Provider account created! Verification request submitted (PENDING). Redirecting...',
          type: 'success',
        });
        setTimeout(() => router.push('/providers/status'), 1200);
      } else {
        setToast({ message: data.error || 'Failed to create provider account', type: 'error' });
      }
    } catch {
      setToast({ message: 'An error occurred during registration', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Navbar activeTab="PORTAL" />
      <Container>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <AuthCard>
          <AuthHeader>
            <Title>Become a Fade Finder Provider</Title>
            <Subtitle>
              Register your account to receive studio and mobile house-call appointments from local customers.
            </Subtitle>
          </AuthHeader>

          <NoticeBox>
             <strong>Verification Notice:</strong> Account submission creates a provider profile with{' '}
            <code>verificationStatus: PENDING</code>. An administrator will review your license details within 24–48 hours.
          </NoticeBox>

          <Form onSubmit={handleSubmit} style={{ marginTop: '1.25rem' }}>
            <FormRow>
              <Input
                label="First Name *"
                placeholder="Marcus"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name *"
                placeholder="Vance"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </FormRow>

            <FormRow>
              <Input
                label="Email Address *"
                type="email"
                placeholder="marcus@fadefinder.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="(801) 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormRow>

            <Input
              label="Password *"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <FormRow>
              <Input
                label="Barber License # *"
                placeholder="UT-LIC-882941"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                required
              />
              <Input
                label="Max Travel Radius (Miles)"
                type="number"
                placeholder="15"
                value={maxTravelRadiusMiles}
                onChange={(e) => setMaxTravelRadiusMiles(e.target.value)}
              />
            </FormRow>

            <Input
              label="Base Studio Address / City *"
              placeholder="123 Main St, Salt Lake City, UT"
              value={baseAddress}
              onChange={(e) => setBaseAddress(e.target.value)}
              required
            />

            <Input
              label="Short Bio / Introduction"
              placeholder="Master barber with 8+ years specializing in low fades, beards, and razor line-ups."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <RequirementsLinks>
              <Link href="/dopl-standards">
                ℹ️ Verification Requirements
              </Link>
              <Link href="/terms-privacy">
                 Help & FAQs
              </Link>
            </RequirementsLinks>

            <Button type="submit" variant="primary" size="lg" disabled={loading} fullWidth>
              {loading ? 'Submitting Registration...' : 'Submit Verification Request'}
            </Button>
          </Form>

          <AuthFooterText>
            Already have a provider account? <Link href="/providers/login">Log in here</Link>
          </AuthFooterText>
        </AuthCard>
      </Container>
      <Footer />
    </PageWrapper>
  );
}
