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
import { Badge } from '@/components/ui/Badge';
import {
  LayoutDashboard, Settings, FileText, Save, Eye, Monitor,
  DollarSign, CheckCircle2, Scissors, Car, TrendingUp, Shield,
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
  max-width: 1200px;
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

const TwoPane = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled(Card)`
  padding: 1.5rem;
  margin-bottom: 1.25rem;
`;

const SectionLabel = styled.h2`
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`;

const Label = styled.label`
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.4rem;
`;

const FieldGroup = styled.div`
  margin-bottom: 1rem;
`;

const PreviewPane = styled.div`
  position: sticky;
  top: 80px;
`;

const PreviewCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const PreviewHero = styled.div<{ bg: string }>`
  padding: 2.5rem 1.5rem;
  background: ${({ bg }) => bg};
  text-align: center;
`;

const PreviewTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.5rem;
  line-height: 1.2;
`;

const PreviewSub = styled.p`
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

const PreviewBtn = styled.span`
  display: inline-block;
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: white;
  color: #0d9488;
  margin: 0 0.25rem;
`;

const PreviewBenefits = styled.div`
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const PreviewBenefit = styled.div`
  display: flex;
  gap: 0.5rem;
  font-size: 0.78rem;
  align-items: flex-start;

  svg { color: #0d9488; flex-shrink: 0; margin-top: 0.1rem; }
`;

const PreviewPricing = styled.div`
  padding: 0 1.5rem 1.5rem;
`;

export default function AdminProvidersLandingPage() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  const [heroHeadline, setHeroHeadline] = useState('Grow Your Barbering Business with Fade Finder');
  const [heroSub, setHeroSub] = useState('Join hundreds of licensed barbers earning more — with studio listings or mobile house calls in your area.');
  const [heroBg, setHeroBg] = useState('linear-gradient(135deg, #0d9488 0%, #064e3b 100%)');
  const [heroCta, setHeroCta] = useState('Become a Provider');

  const [ben1, setBen1] = useState('Steady Customer Flow');
  const [ben1Desc, setBen1Desc] = useState('New bookings delivered directly to your dashboard');
  const [ben2, setBen2] = useState('Mobile or Studio');
  const [ben2Desc, setBen2Desc] = useState('Choose to offer house calls, studio cuts, or both');
  const [ben3, setBen3] = useState('Keep Your Earnings');
  const [ben3Desc, setBen3Desc] = useState('No commission cuts — you set your prices, you keep everything');
  const [ben4, setBen4] = useState('DOPL Verification Badge');
  const [ben4Desc, setBen4Desc] = useState('Build trust with customers with a platform-verified license badge');

  const [pricingTitle, setPricingTitle] = useState('Simple, Transparent Pricing');
  const [pricingDesc, setPricingDesc] = useState('No monthly fees, no commission. Fade Finder is free for providers during the beta launch period.');
  const [pricingNote, setPricingNote] = useState('Future paid features will always be opt-in.');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setToast({ message: 'Provider landing page saved', type: 'success' }); }, 700);
  };

  const BenefitIcons = [<Scissors key="s" size={14} />, <Car key="c" size={14} />, <DollarSign key="d" size={14} />, <Shield key="sh" size={14} />];

  return (
    <PageWrapper>
      <Navbar activeTab="PORTAL" />
      <Main>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <PageTitle>
              <Monitor size={26} color="#0d9488" />
              Provider Landing Page
            </PageTitle>
            <PageSubtitle>Edit the barber recruitment page hero, benefits, and pricing</PageSubtitle>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="ghost" size="md" icon={<Eye size={15} />} onClick={() => window.open('/providers/register', '_blank')} id="preview-providers-landing">
              Preview Live
            </Button>
            <Button variant="primary" size="md" icon={<Save size={15} />} onClick={handleSave} disabled={saving} id="save-providers-landing">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <AdminNav>
          <NavPill href="/admin"><LayoutDashboard size={14} /> Overview</NavPill>
          <NavPill href="/admin/settings"><Settings size={14} /> Settings</NavPill>
          <NavPill href="/admin/content" active><FileText size={14} /> Content</NavPill>
        </AdminNav>

        <TwoPane>
          {/* EDITOR */}
          <div>
            <FormSection>
              <SectionLabel>Hero Section</SectionLabel>
              <FieldGroup>
                <Label>Headline</Label>
                <TextArea value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} rows={2} id="providers-hero-headline" />
              </FieldGroup>
              <FieldGroup>
                <Label>Subheadline</Label>
                <TextArea value={heroSub} onChange={(e) => setHeroSub(e.target.value)} rows={3} id="providers-hero-sub" />
              </FieldGroup>
              <FieldGroup>
                <Label>Background Gradient (CSS)</Label>
                <Input value={heroBg} onChange={(e) => setHeroBg(e.target.value)} id="providers-hero-bg" />
              </FieldGroup>
              <FieldGroup>
                <Label>CTA Button Text</Label>
                <Input value={heroCta} onChange={(e) => setHeroCta(e.target.value)} id="providers-hero-cta" />
              </FieldGroup>
            </FormSection>

            <FormSection>
              <SectionLabel>Benefits</SectionLabel>
              {[
                { t: ben1, setT: setBen1, d: ben1Desc, setD: setBen1Desc, k: '1' },
                { t: ben2, setT: setBen2, d: ben2Desc, setD: setBen2Desc, k: '2' },
                { t: ben3, setT: setBen3, d: ben3Desc, setD: setBen3Desc, k: '3' },
                { t: ben4, setT: setBen4, d: ben4Desc, setD: setBen4Desc, k: '4' },
              ].map(({ t, setT, d, setD, k }) => (
                <div key={k} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                    <FieldGroup>
                      <Label>Benefit {k} Title</Label>
                      <Input value={t} onChange={(e) => setT(e.target.value)} id={`provider-ben-${k}-title`} />
                    </FieldGroup>
                    <FieldGroup>
                      <Label>Description</Label>
                      <Input value={d} onChange={(e) => setD(e.target.value)} id={`provider-ben-${k}-desc`} />
                    </FieldGroup>
                  </div>
                </div>
              ))}
            </FormSection>

            <FormSection>
              <SectionLabel>Pricing Section</SectionLabel>
              <FieldGroup>
                <Label>Section Title</Label>
                <Input value={pricingTitle} onChange={(e) => setPricingTitle(e.target.value)} id="providers-pricing-title" />
              </FieldGroup>
              <FieldGroup>
                <Label>Description</Label>
                <TextArea value={pricingDesc} onChange={(e) => setPricingDesc(e.target.value)} rows={3} id="providers-pricing-desc" />
              </FieldGroup>
              <FieldGroup>
                <Label>Footer Note</Label>
                <Input value={pricingNote} onChange={(e) => setPricingNote(e.target.value)} id="providers-pricing-note" />
              </FieldGroup>
            </FormSection>
          </div>

          {/* LIVE PREVIEW */}
          <PreviewPane>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Preview</span>
              <Badge variant="info" size="sm">Real-time</Badge>
            </div>
            <PreviewCard>
              <PreviewHero bg={heroBg}>
                <PreviewTitle>{heroHeadline}</PreviewTitle>
                <PreviewSub>{heroSub}</PreviewSub>
                <PreviewBtn>{heroCta}</PreviewBtn>
              </PreviewHero>

              <PreviewBenefits>
                {[
                  { title: ben1, desc: ben1Desc },
                  { title: ben2, desc: ben2Desc },
                  { title: ben3, desc: ben3Desc },
                  { title: ben4, desc: ben4Desc },
                ].map(({ title, desc }, i) => (
                  <PreviewBenefit key={i}>
                    {BenefitIcons[i]}
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.1rem' }}>{title}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{desc}</div>
                    </div>
                  </PreviewBenefit>
                ))}
              </PreviewBenefits>

              <PreviewPricing>
                <div style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.35rem' }}>{pricingTitle}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>{pricingDesc}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.5rem' }}>{pricingNote}</div>
                </div>
              </PreviewPricing>
            </PreviewCard>
          </PreviewPane>
        </TwoPane>
      </Main>
      <Footer />
    </PageWrapper>
  );
}
