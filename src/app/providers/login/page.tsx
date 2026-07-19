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

export default function ProviderLoginPage() {
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
        if (data.user.role === 'BARBER') {
          setToast({ message: 'Login successful! Redirecting to portal...', type: 'success' });
          setTimeout(() => router.push('/providers'), 1000);
        } else {
          setToast({ message: 'Logged in, but account is not registered as a Provider', type: 'error' });
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
      <Navbar activeTab="PORTAL" />
      <Container>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <AuthCard>
          <AuthHeader>
            <Title>Provider Portal Login</Title>
            <Subtitle>Sign in to manage your appointments and barber profile</Subtitle>
          </AuthHeader>

          <Form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              placeholder="barber@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <ForgotLink type="button" onClick={() => setShowForgotModal(true)}>
              Forgot password?
            </ForgotLink>

            <Button type="submit" variant="primary" size="lg" disabled={loading} fullWidth>
              {loading ? 'Signing In...' : 'Sign In to Provider Dashboard'}
            </Button>
          </Form>

          <AuthFooterText>
            Don't have a provider account yet?{' '}
            <Link href="/providers/register">Become a Provider</Link>
          </AuthFooterText>
        </AuthCard>

        {showForgotModal && (
          <Modal
            isOpen={showForgotModal}
            onClose={() => {
              setShowForgotModal(false);
              setRecoverySent(false);
            }}
            title="Reset Provider Password"
          >
            {recoverySent ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Password reset link sent!
                </p>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  If an account exists for {recoveryEmail}, you will receive instructions to reset your password shortly.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setShowForgotModal(false);
                    setRecoverySent(false);
                  }}
                  style={{ marginTop: '1.5rem' }}
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendRecovery}>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                  Enter your registered provider email address to receive password reset instructions.
                </p>
                <Input
                  label="Provider Email"
                  type="email"
                  placeholder="barber@example.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <Button variant="outline" size="md" onClick={() => setShowForgotModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    Send Reset Link
                  </Button>
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
