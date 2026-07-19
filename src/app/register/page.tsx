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
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { UserPlus, CheckCircle2, Star, Shield, Calendar } from 'lucide-react';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Container = styled.main`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.25rem;
  gap: 3rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const PitchSection = styled.div`
  @media (max-width: 768px) {
    order: 2;
  }
`;

const PitchTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
  letter-spacing: -0.03em;

  span {
    color: ${({ theme }) => theme.colors.primaryAccent};
  }

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const PitchSub = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const BenefitList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    color: ${({ theme }) => theme.colors.success};
    flex-shrink: 0;
  }
`;

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;

  @media (max-width: 768px) {
    order: 1;
    max-width: 100%;
  }
`;

const AuthHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.35rem;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NameRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const FreeTag = styled.div`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textMuted};

  span {
    color: ${({ theme }) => theme.colors.success};
    font-weight: 700;
  }
`;

const AuthFooterText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    color: ${({ theme }) => theme.colors.primaryAccent};
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    if (password.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, password, role: 'CLIENT' }),
      });
      const data = await res.json();

      if (data.success) {
        setToast({ message: 'Account created! Welcome to Fade Finder.', type: 'success' });
        setTimeout(() => router.push('/'), 1200);
      } else {
        setToast({ message: data.error || 'Registration failed', type: 'error' });
      }
    } catch {
      setToast({ message: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Navbar activeTab="CLIENT" />
      <Container>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <PitchSection>
          <Badge variant="accent" size="sm" style={{ marginBottom: '1rem' }}>
            Free to Join
          </Badge>
          <PitchTitle>
            Find Your <span>Perfect Barber</span> Near You
          </PitchTitle>
          <PitchSub>
            Join thousands of clients who use Fade Finder to book top-rated local barbers for in-studio
            cuts or convenient mobile house calls.
          </PitchSub>

          <BenefitList>
            <BenefitItem>
              <CheckCircle2 size={18} />
              Browse verified, DOPL-licensed barbers in your area
            </BenefitItem>
            <BenefitItem>
              <Star size={18} />
              Read genuine client reviews and ratings
            </BenefitItem>
            <BenefitItem>
              <Calendar size={18} />
              Book studio cuts or mobile house calls on your schedule
            </BenefitItem>
            <BenefitItem>
              <Shield size={18} />
              Secure account with no hidden fees
            </BenefitItem>
          </BenefitList>
        </PitchSection>

        <AuthCard>
          <AuthHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <UserPlus size={24} color="#0d9488" />
              <Title>Create Account</Title>
            </div>
            <Subtitle>Get started — it&apos;s completely free</Subtitle>
          </AuthHeader>

          <Form onSubmit={handleSubmit} id="register-form">
            <NameRow>
              <Input
                label="First Name"
                placeholder="Alex"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                id="register-first-name"
              />
              <Input
                label="Last Name"
                placeholder="Johnson"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                id="register-last-name"
              />
            </NameRow>

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="register-email"
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="(555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              id="register-phone"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="register-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              id="register-confirm-password"
            />

            <Button type="submit" variant="primary" size="lg" disabled={loading} fullWidth id="register-submit">
              {loading ? 'Creating Account...' : 'Create Free Account'}
            </Button>
          </Form>

          <FreeTag>
            <span>✓ Free forever</span> — no credit card required
          </FreeTag>

          <AuthFooterText>
            Already have an account?{' '}
            <Link href="/login">Sign in</Link>
          </AuthFooterText>

          <AuthFooterText>
            Want to list your barber services?{' '}
            <Link href="/providers/register">Become a Provider</Link>
          </AuthFooterText>
        </AuthCard>
      </Container>
      <Footer />
    </PageWrapper>
  );
}
