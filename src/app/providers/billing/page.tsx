'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';

interface Transaction {
  id: string;
  date: string;
  clientName: string;
  serviceName: string;
  amount: number;
  payoutStatus: 'PAID' | 'PENDING' | 'PROCESSING';
}

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Container = styled.main`
  flex: 1;
  max-width: 950px;
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
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0.25rem 0 0;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
`;

const SummaryCard = styled(Card)`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const SummaryLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 0.4rem;
`;

const SummaryValue = styled.span`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primaryAccent};
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

const PayoutMethodBox = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const MethodDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BankIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primaryAccent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
`;

const TxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TxRow = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

export default function ProviderBillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const transactions: Transaction[] = [
    { id: 'tx-101', date: '2026-07-16', clientName: 'Jordan Rivera', serviceName: 'Standard Cut (Studio)', amount: 35.0, payoutStatus: 'PAID' },
    { id: 'tx-102', date: '2026-07-15', clientName: 'Alex Mercer', serviceName: 'Executive Cut & Beard (House Call)', amount: 65.0, payoutStatus: 'PAID' },
    { id: 'tx-103', date: '2026-07-14', clientName: 'Sam Taylor', serviceName: 'Beard Trim & Lineup', amount: 25.0, payoutStatus: 'PAID' },
  ];

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <PageWrapper>
        <Navbar activeTab="PORTAL" />
        <Container style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <p style={{ color: '#94a3b8' }}>Loading Provider Billing...</p>
        </Container>
        <Footer />
      </PageWrapper>
    );
  }

  const totalPayouts = transactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <PageWrapper>
      <Navbar activeTab="PORTAL" />
      <Container>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <Header>
          <div>
            <Title>Provider Billing & Payouts</Title>
            <Subtitle>Manage direct deposit payout methods, fee structures, and transaction statements</Subtitle>
          </div>
          <Button variant="outline" size="md" onClick={() => router.push('/providers')}>
            Back to Dashboard
          </Button>
        </Header>

        <SummaryGrid>
          <SummaryCard>
            <SummaryLabel>Available Balance</SummaryLabel>
            <SummaryValue>$0.00</SummaryValue>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>Transferred daily at 12:00 AM</span>
          </SummaryCard>

          <SummaryCard>
            <SummaryLabel>Total Payouts (Month)</SummaryLabel>
            <SummaryValue>${totalPayouts.toFixed(2)}</SummaryValue>
            <span style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.3rem' }}>3 Completed Appointments</span>
          </SummaryCard>

          <SummaryCard>
            <SummaryLabel>Platform Fee Rate</SummaryLabel>
            <SummaryValue>0.0%</SummaryValue>
            <span style={{ fontSize: '0.8rem', color: '#2dd4bf', marginTop: '0.3rem' }}>MVP Provider Special (Free)</span>
          </SummaryCard>
        </SummaryGrid>

        {/* Direct Deposit Method */}
        <SectionCard>
          <SectionTitle>🏦 Payout Method (Direct Deposit / POS)</SectionTitle>
          <PayoutMethodBox>
            <MethodDetails>
              <BankIcon>🏦</BankIcon>
              <div>
                <strong style={{ fontSize: '1rem', display: 'block' }}>First National Bank •••• 4821</strong>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Direct Deposit (Checking) • Verified</span>
              </div>
            </MethodDetails>
            <Button variant="outline" size="sm" onClick={() => setToast({ message: 'POS & Payout edit functionality coming in V2', type: 'success' })}>
              Update Bank Account
            </Button>
          </PayoutMethodBox>
        </SectionCard>

        {/* Transaction History */}
        <SectionCard>
          <SectionTitle>📄 Recent Payout Transactions</SectionTitle>
          <TxList>
            {transactions.map((tx) => (
              <TxRow key={tx.id}>
                <div>
                  <strong style={{ fontSize: '0.95rem', display: 'block' }}>{tx.clientName}</strong>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {tx.serviceName} • {tx.date}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2dd4bf' }}>
                    +${tx.amount.toFixed(2)}
                  </span>
                  <Badge variant="success">{tx.payoutStatus}</Badge>
                </div>
              </TxRow>
            ))}
          </TxList>
        </SectionCard>
      </Container>
      <Footer />
    </PageWrapper>
  );
}
