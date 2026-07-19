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
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { Scissors, User } from 'lucide-react';

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
  max-width: 440px;
  padding: 2.5rem;
`;

const LogoWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const LogoBadge = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primaryAccent};
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
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const ForgotLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primaryAccent};
  font-size: 0.85rem;
  cursor: pointer;
  align-self: flex-end;
  margin-top: -0.5rem;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
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

const Divider = styled.div`
  text-align: center;
  margin: 0.5rem 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.user.role === 'CLIENT') {
          setToast({ message: 'Welcome back! Redirecting...', type: 'success' });
          setTimeout(() => router.push('/'), 1000);
        } else if (data.user.role === 'BARBER') {
          setToast({ message: 'Provider account detected. Redirecting to provider portal...', type: 'success' });
          setTimeout(() => router.push('/providers'), 1000);
        } else {
          setToast({ message: 'Logged in successfully', type: 'success' });
          setTimeout(() => router.push('/'), 1000);
        }
      } else {
        setToast({ message: data.error || 'Invalid credentials', type: 'error' });
      }
    } catch {
      setToast({ message: 'An error occurred during login', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setRecoverySent(true);
  };

  return (
    <PageWrapper>
      <Navbar activeTab="CLIENT" />
      <Container>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <AuthCard>
          <LogoWrap>
            <LogoBadge>
              <User size={28} />
            </LogoBadge>
          </LogoWrap>

          <AuthHeader>
            <Title>Sign In</Title>
            <Subtitle>Access your bookings and saved barbers</Subtitle>
          </AuthHeader>

          <Form onSubmit={handleSubmit} id="login-form">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
            />

            <ForgotLink type="button" onClick={() => setShowForgotModal(true)}>
              Forgot password?
            </ForgotLink>

            <Button type="submit" variant="primary" size="lg" disabled={loading} fullWidth id="login-submit">
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form>

          <Divider>— or —</Divider>

          <AuthFooterText>
            Don&apos;t have an account?{' '}
            <Link href="/register">Create one free</Link>
          </AuthFooterText>

          <AuthFooterText>
            Are you a barber?{' '}
            <Link href="/providers/login">Provider login</Link>
          </AuthFooterText>
        </AuthCard>

        {showForgotModal && (
          <Modal
            isOpen={showForgotModal}
            onClose={() => {
              setShowForgotModal(false);
              setRecoverySent(false);
            }}
            title="Reset Your Password"
          >
            {recoverySent ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Password reset link sent!
                </p>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  If an account exists for {recoveryEmail}, you will receive reset instructions shortly.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => { setShowForgotModal(false); setRecoverySent(false); }}
                  style={{ marginTop: '1.5rem' }}
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendRecovery}>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <Button variant="outline" size="md" onClick={() => setShowForgotModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="md">Send Reset Link</Button>
                </div>
              </form>
            )}
          </Modal>
        )}
      </Container>
      <Footer />
    </PageWrapper>
  );
}
