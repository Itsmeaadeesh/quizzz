import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  variant?: 'light' | 'dark' | 'icon-only' | 'auto';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'auto',
  className = '',
  size = 'md',
  asLink = true,
}) => {
  const { theme } = useTheme();

  const heightClasses = {
    sm: 'h-7',
    md: 'h-9 md:h-10',
    lg: 'h-12 md:h-14',
  };

  const effectiveVariant = variant === 'auto' ? theme : variant;

  const imageSrc =
    effectiveVariant === 'icon-only'
      ? '/favicon.png'
      : effectiveVariant === 'dark'
      ? '/stayaheadd-logo-dark.png'
      : '/stayaheadd-logo-light.png';

  const content = (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={imageSrc}
        alt="StayAheadd Logo"
        className={`${heightClasses[size]} w-auto object-contain transition-transform duration-200 hover:scale-[1.02]`}
        loading="eager"
      />
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg transition-opacity hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
};
