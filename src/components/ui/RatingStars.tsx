'use client';

import React from 'react';
import styled from 'styled-components';
import { Star } from 'lucide-react';

export interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
}

const StarContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const StarButton = styled.button<{ interactive?: boolean }>`
  background: transparent;
  border: none;
  padding: 0;
  cursor: ${({ interactive }) => (interactive ? 'pointer' : 'default')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;

  &:hover {
    transform: ${({ interactive }) => (interactive ? 'scale(1.2)' : 'none')};
  }
`;

const RatingText = styled.span<{ size?: 'sm' | 'md' | 'lg' }>`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ size }) => (size === 'lg' ? '1.1rem' : size === 'sm' ? '0.75rem' : '0.85rem')};
  margin-left: 0.2rem;
`;

const ReviewCount = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 400;
  font-size: 0.75rem;
`;

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  size = 'md',
  interactive = false,
  onRatingChange,
}) => {
  const iconSize = size === 'lg' ? 20 : size === 'sm' ? 12 : 15;

  return (
    <StarContainer>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = rating >= star;
        const isHalf = !isFilled && rating >= star - 0.5;

        return (
          <StarButton
            key={star}
            interactive={interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            type="button"
            aria-label={`${star} Star`}
          >
            <Star
              size={iconSize}
              fill={isFilled || isHalf ? '#f59e0b' : 'transparent'}
              color={isFilled || isHalf ? '#f59e0b' : '#64748b'}
            />
          </StarButton>
        );
      })}
      <RatingText size={size}>{rating.toFixed(1)}</RatingText>
      {reviewCount !== undefined && <ReviewCount>({reviewCount})</ReviewCount>}
    </StarContainer>
  );
};

export default RatingStars;
