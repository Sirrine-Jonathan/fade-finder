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
  LayoutDashboard, Settings, FileText, Save,
  Eye, ChevronLeft, RefreshCw, Layout, Scissors, Star, Shield, Car, Zap,
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
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const EditorPane = styled.div``;

const PreviewPane = styled.div`
  position: sticky;
  top: 80px;
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
  line-height: 1.5;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

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

// Preview components
const PreviewCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const PreviewHero = styled.div<{ bg: string }>`
  padding: 2.5rem 1.5rem;
  background: ${({ bg }) => bg || 'linear-gradient(135deg, #0d9488 0%, #131f26 100%)'};
  text-align: center;
`;

const PreviewTitle = styled.h3<{ color: string }>`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${({ color }) => color || '#ffffff'};
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
  line-height: 1.2;
`;

const PreviewSub = styled.p<{ color: string }>`
  color: ${({ color }) => color || 'rgba(255,255,255,0.75)'};
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const PreviewCTA = styled.div`
  display: inline-flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const PreviewBtn = styled.span<{ primary?: boolean }>`
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: ${({ primary }) => primary ? '#0d9488' : 'rgba(255,255,255,0.12)'};
  color: white;
  border: 1px solid ${({ primary }) => primary ? '#0d9488' : 'rgba(255,255,255,0.3)'};
`;

const PreviewFeatures = styled.div`
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const PreviewFeature = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  font-size: 0.78rem;

  svg { color: #0d9488; flex-shrink: 0; margin-top: 0.1rem; }
`;

const FeatureIcons: Record<string, React.ReactNode> = {
  'Find Barbers': <Scissors size={14} />,
  'Top Rated': <Star size={14} />,
  'DOPL Verified': <Shield size={14} />,
  'House Calls': <Car size={14} />,
  'Instant Book': <Zap size={14} />,
};

export default function AdminContentLandingPage() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  // Hero
  const [heroHeadline, setHeroHeadline] = useState('Find Your Perfect Barber');
  const [heroSub, setHeroSub] = useState('Book top-rated, DOPL-licensed barbers near you — for in-studio cuts or convenient house calls.');
  const [heroBg, setHeroBg] = useState('linear-gradient(135deg, #0d9488 0%, #131f26 100%)');
  const [heroTextColor, setHeroTextColor] = useState('#ffffff');
  const [heroSubColor, setHeroSubColor] = useState('rgba(255,255,255,0.75)');
  const [ctaPrimary, setCtaPrimary] = useState('Find a Barber Near Me');
  const [ctaSecondary, setCtaSecondary] = useState('List Your Services');

  // Features
  const [feat1Title, setFeat1Title] = useState('Browse Barbers');
  const [feat1Desc, setFeat1Desc] = useState('Filter by rating, distance, and service type');
  const [feat2Title, setFeat2Title] = useState('Top Rated');
  const [feat2Desc, setFeat2Desc] = useState('Real reviews from verified clients');
  const [feat3Title, setFeat3Title] = useState('DOPL Verified');
  const [feat3Desc, setFeat3Desc] = useState('Only licensed professionals on the platform');
  const [feat4Title, setFeat4Title] = useState('House Calls');
  const [feat4Desc, setFeat4Desc] = useState('Barbers that come to you');

  const handleSave = () => {
    setSaving(true);
    // In production, this would persist to DB/CMS
    setTimeout(() => {
      setSaving(false);
      setToast({ message: 'Landing page content saved', type: 'success' });
    }, 700);
  };

  return (
    <PageWrapper>
      <Navbar activeTab="PORTAL" />
      <Main>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <PageTitle>
              <Layout size={26} color="#0d9488" />
              Consumer Landing Page
            </PageTitle>
            <PageSubtitle>Edit the homepage hero, CTAs, and feature highlights</PageSubtitle>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button variant="ghost" size="md" icon={<Eye size={15} />} onClick={() => window.open('/', '_blank')} id="preview-landing">
              Preview Live
            </Button>
            <Button variant="primary" size="md" icon={<Save size={15} />} onClick={handleSave} disabled={saving} id="save-landing">
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
          <EditorPane>
            <FormSection>
              <SectionLabel>Hero Section</SectionLabel>

              <FieldGroup>
                <Label>Headline</Label>
                <TextArea value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} id="hero-headline" rows={2} />
              </FieldGroup>

              <FieldGroup>
                <Label>Subheadline</Label>
                <TextArea value={heroSub} onChange={(e) => setHeroSub(e.target.value)} id="hero-sub" rows={3} />
              </FieldGroup>

              <FieldGroup>
                <Label>Background Gradient (CSS value)</Label>
                <Input value={heroBg} onChange={(e) => setHeroBg(e.target.value)} id="hero-bg" />
              </FieldGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FieldGroup>
                  <Label>Headline Color</Label>
                  <Input value={heroTextColor} onChange={(e) => setHeroTextColor(e.target.value)} id="hero-text-color" />
                </FieldGroup>
                <FieldGroup>
                  <Label>Subheadline Color</Label>
                  <Input value={heroSubColor} onChange={(e) => setHeroSubColor(e.target.value)} id="hero-sub-color" />
                </FieldGroup>
              </div>
            </FormSection>

            <FormSection>
              <SectionLabel>CTA Buttons</SectionLabel>
              <FieldGroup>
                <Label>Primary Button Text</Label>
                <Input value={ctaPrimary} onChange={(e) => setCtaPrimary(e.target.value)} id="cta-primary" />
              </FieldGroup>
              <FieldGroup>
                <Label>Secondary Button Text</Label>
                <Input value={ctaSecondary} onChange={(e) => setCtaSecondary(e.target.value)} id="cta-secondary" />
              </FieldGroup>
            </FormSection>

            <FormSection>
              <SectionLabel>Feature Highlights</SectionLabel>
              {[
                { titleVal: feat1Title, setTitle: setFeat1Title, descVal: feat1Desc, setDesc: setFeat1Desc, key: '1' },
                { titleVal: feat2Title, setTitle: setFeat2Title, descVal: feat2Desc, setDesc: setFeat2Desc, key: '2' },
                { titleVal: feat3Title, setTitle: setFeat3Title, descVal: feat3Desc, setDesc: setFeat3Desc, key: '3' },
                { titleVal: feat4Title, setTitle: setFeat4Title, descVal: feat4Desc, setDesc: setFeat4Desc, key: '4' },
              ].map(({ titleVal, setTitle, descVal, setDesc, key }) => (
                <div key={key} style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <FieldGroup>
                      <Label>Feature {key} Title</Label>
                      <Input value={titleVal} onChange={(e) => setTitle(e.target.value)} id={`feat-${key}-title`} />
                    </FieldGroup>
                    <FieldGroup>
                      <Label>Description</Label>
                      <Input value={descVal} onChange={(e) => setDesc(e.target.value)} id={`feat-${key}-desc`} />
                    </FieldGroup>
                  </div>
                </div>
              ))}
            </FormSection>
          </EditorPane>

          {/* LIVE PREVIEW */}
          <PreviewPane>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Live Preview
              </span>
              <Badge variant="info" size="sm">Real-time</Badge>
            </div>
            <PreviewCard>
              <PreviewHero bg={heroBg}>
                <PreviewTitle color={heroTextColor}>{heroHeadline}</PreviewTitle>
                <PreviewSub color={heroSubColor}>{heroSub}</PreviewSub>
                <PreviewCTA>
                  <PreviewBtn primary>{ctaPrimary}</PreviewBtn>
                  <PreviewBtn>{ctaSecondary}</PreviewBtn>
                </PreviewCTA>
              </PreviewHero>
              <PreviewFeatures>
                {[
                  { title: feat1Title, desc: feat1Desc },
                  { title: feat2Title, desc: feat2Desc },
                  { title: feat3Title, desc: feat3Desc },
                  { title: feat4Title, desc: feat4Desc },
                ].map(({ title, desc }, i) => (
                  <PreviewFeature key={i}>
                    {FeatureIcons[title] || <Scissors size={14} />}
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.1rem' }}>{title}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{desc}</div>
                    </div>
                  </PreviewFeature>
                ))}
              </PreviewFeatures>
            </PreviewCard>
          </PreviewPane>
        </TwoPane>
      </Main>
      <Footer />
    </PageWrapper>
  );
}
