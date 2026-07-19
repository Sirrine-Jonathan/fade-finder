'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CreditCard, Shield, Clock, Info, ExternalLink,
  Lock, DollarSign, CheckCircle2,
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
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.4rem;
  }
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.95rem;
  }
`;

const InfoCard = styled(Card)`
  padding: 2rem;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const FeatureIcon = styled.div`
  color: ${({ theme }) => theme.colors.primaryAccent};
  flex-shrink: 0;
  margin-top: 0.1rem;
`;

const FeatureText = styled.div``;
const FeatureTitle = styled.div`font-weight: 700; font-size: 0.9rem; margin-bottom: 0.2rem;`;
const FeatureDesc = styled.div`font-size: 0.8rem; color: ${({ theme }) => theme.colors.textSecondary};`;

const ComingSoonBanner = styled.div`
  background: linear-gradient(135deg, rgba(13,148,136,0.18) 0%, rgba(19,31,38,0.9) 100%);
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 2.5rem 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const MockPaymentCard = styled(Card)`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  opacity: 0.55;
  cursor: not-allowed;
  margin-bottom: 0.75rem;
`;

const CardChip = styled.div`
  width: 48px;
  height: 36px;
  border-radius: 6px;
  background: linear-gradient(135deg, #b8922f 0%, #f9d78a 50%, #b8922f 100%);
  flex-shrink: 0;
`;

const CardDetails = styled.div`flex: 1;`;
const CardNumber = styled.div`font-weight: 700; font-family: monospace; letter-spacing: 0.12em; font-size: 0.95rem;`;
const CardMeta = styled.div`font-size: 0.8rem; color: ${({ theme }) => theme.colors.textSecondary};`;

const NoticeBox = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(245,158,11,0.12);
  border: 1px solid rgba(245,158,11,0.3);
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 1rem;

  svg { color: #f59e0b; flex-shrink: 0; margin-top: 0.1rem; }
`;

export default function BillingPage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!data.success || !data.user) router.push('/login');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  return (
    <PageWrapper>
      <Navbar activeTab="CLIENT" />
      <Main>
        <PageHeader>
          <h1>
            <CreditCard size={28} color="#0d9488" />
            Billing & Payments
          </h1>
          <p>Manage your payment methods and view transaction history</p>
        </PageHeader>

        {/* COMING SOON */}
        <ComingSoonBanner>
          <Badge variant="accent" size="sm" style={{ marginBottom: '1rem' }}>Coming Soon</Badge>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            In-App Payments Are on the Way
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Fade Finder is building a secure point-of-sale system so you can pay for appointments
            directly in the app — before, during, or after your cut.
          </p>
          <Button variant="outline" size="md" icon={<ExternalLink size={14} />} disabled>
            Notify Me When Available
          </Button>
        </ComingSoonBanner>

        {/* WHAT TO EXPECT */}
        <InfoCard>
          <CardTitle><DollarSign size={14} /> What You&apos;ll Get</CardTitle>
          <FeatureGrid>
            <FeatureItem>
              <FeatureIcon><CreditCard size={18} /></FeatureIcon>
              <FeatureText>
                <FeatureTitle>Saved Payment Methods</FeatureTitle>
                <FeatureDesc>Securely store cards for one-tap checkout at booking</FeatureDesc>
              </FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon><Lock size={18} /></FeatureIcon>
              <FeatureText>
                <FeatureTitle>Secure & Encrypted</FeatureTitle>
                <FeatureDesc>PCI-compliant processing through Stripe</FeatureDesc>
              </FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon><Clock size={18} /></FeatureIcon>
              <FeatureText>
                <FeatureTitle>Flexible Pay Timing</FeatureTitle>
                <FeatureDesc>Pay upfront, on arrival, or after your appointment</FeatureDesc>
              </FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon><CheckCircle2 size={18} /></FeatureIcon>
              <FeatureText>
                <FeatureTitle>Digital Receipts</FeatureTitle>
                <FeatureDesc>Instant email receipts and in-app transaction history</FeatureDesc>
              </FeatureText>
            </FeatureItem>
          </FeatureGrid>
        </InfoCard>

        {/* CURRENT PROCESS */}
        <InfoCard>
          <CardTitle><Info size={14} /> How Payments Work Today</CardTitle>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            Currently, payment is handled directly with your barber at the time of your appointment.
            Each barber sets their own payment preferences — many accept cash, Venmo, Zelle, CashApp,
            or card via their own terminal.
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Pricing for each service is clearly listed on the barber&apos;s profile before you book,
            so there are no surprises.
          </p>

          <NoticeBox>
            <Shield size={16} />
            <span>
              Your payment info is never shared with or stored by Fade Finder until in-app payments are enabled.
            </span>
          </NoticeBox>
        </InfoCard>

        {/* PLACEHOLDER CARD UI */}
        <InfoCard style={{ opacity: 0.65 }}>
          <CardTitle style={{ marginBottom: '1.25rem' }}>
            <CreditCard size={14} /> Saved Payment Methods (Preview)
          </CardTitle>
          <MockPaymentCard>
            <CardChip />
            <CardDetails>
              <CardNumber>•••• •••• •••• 4242</CardNumber>
              <CardMeta>Visa · Expires 12/27</CardMeta>
            </CardDetails>
            <Badge variant="success" size="sm">Default</Badge>
          </MockPaymentCard>
          <MockPaymentCard>
            <CardChip style={{ background: 'linear-gradient(135deg, #1a4890 0%, #5b9ad9 100%)' }} />
            <CardDetails>
              <CardNumber>•••• •••• •••• 8888</CardNumber>
              <CardMeta>Mastercard · Expires 08/26</CardMeta>
            </CardDetails>
          </MockPaymentCard>
          <Button variant="secondary" size="sm" icon={<CreditCard size={14} />} disabled style={{ marginTop: '1rem' }}>
            + Add Payment Method
          </Button>
        </InfoCard>
      </Main>
      <Footer />
    </PageWrapper>
  );
}
