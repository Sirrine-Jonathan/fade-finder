'use client';

import React from 'react';
import styled from 'styled-components';
import { Sparkles } from 'lucide-react';

export interface HeroProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  showLogo?: boolean;
  children?: React.ReactNode;
}

const HeroWrapper = styled.section`
  width: 100%;
  background: linear-gradient(135deg, #0b1318 0%, #131f26 40%, rgba(13, 148, 136, 0.25) 100%);
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 3rem 1.5rem 3.5rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const LogoWrapper = styled.div`
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const ProminentLogo = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadows.glow};
  object-fit: cover;
  transition: transform ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: scale(1.08) rotate(3deg);
  }
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primaryAccent};
  padding: 0.4rem 1rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  border: 1px solid rgba(13, 148, 136, 0.3);
`;

const Title = styled.h2`
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  line-height: 1.15;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  max-width: 850px;
  letter-spacing: -0.02em;

  span {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primaryAccent}, ${({ theme }) => theme.colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(0.95rem, 2vw, 1.15rem);
  max-width: 700px;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const ChildrenContainer = styled.div`
  width: 100%;
  max-width: 900px;
`;

export const Hero: React.FC<HeroProps> = ({
  title = 'Book Top Local Barbers to Your Door or Studio',
  subtitle = 'Compare barbers by travel radius, customer ratings, DOPL license verification, and dual-tier studio vs. house call pricing.',
  badgeText = 'Mobile House Calls & Studio Cuts',
  showLogo = true,
  children,
}) => {
  return (
    <HeroWrapper>
      <HeroContainer>
        {showLogo && (
          <LogoWrapper>
            <ProminentLogo src="/logo.png" alt="Fade Finder Logo" />
          </LogoWrapper>
        )}
        {badgeText && (
          <Badge>
            <Sparkles size={16} /> {badgeText}
          </Badge>
        )}
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        {children && <ChildrenContainer>{children}</ChildrenContainer>}
      </HeroContainer>
    </HeroWrapper>
  );
};

export default Hero;
