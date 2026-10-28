import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating Component:
 * Human-crafted star rating display and interactive rating picker (1 to 5)
 */
export function StarRating({ rating = 0, interactive = false, onRate, size = 18 }) {
  const [hoverRating, setHoverRating] = useState(0);

  const starLabels = {
    1: '1 ★ Poor Experience',
    2: '2 ★ Fair / Average',
    3: '3 ★ Good & Satisfactory',
    4: '4 ★ Very Good Shop',
    5: '5 ★ Exceptional & Highly Recommended!',
  };

  if (!interactive) {
    const numRating = Number(rating) || 0;
    return (
      <div className="stars-display" title={`${numRating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = starIndex <= Math.round(numRating);
          return (
            <Star
              key={starIndex}
              size={size}
              fill={filled ? '#eab308' : 'none'}
              stroke={filled ? '#ca8a04' : '#d8d0c2'}
              strokeWidth={filled ? 1 : 1.5}
            />
          );
        })}
      </div>
    );
  }

  // Interactive picker
  const activeRating = hoverRating || rating;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="star-picker">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = starIndex <= activeRating;
          return (
            <button
              key={starIndex}
              type="button"
              className={`star-btn ${filled ? 'filled' : ''}`}
              onClick={() => onRate && onRate(starIndex)}
              onMouseEnter={() => setHoverRating(starIndex)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${starIndex} out of 5 stars`}
            >
              <Star
                size={size || 36}
                fill={filled ? '#eab308' : 'none'}
                stroke={filled ? '#ca8a04' : '#d8d0c2'}
                strokeWidth={filled ? 1 : 1.5}
              />
            </button>
          );
        })}
      </div>
      <div
        style={{
          marginTop: '0.4rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: activeRating ? 'var(--primary)' : 'var(--text-dim)',
          background: activeRating ? 'var(--primary-light)' : '#f3efe6',
          padding: '0.25rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          transition: 'all 0.15s ease',
        }}
      >
        {starLabels[activeRating] || 'Tap a star to rate from 1 to 5'}
      </div>
    </div>
  );
}
