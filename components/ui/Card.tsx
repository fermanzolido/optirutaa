import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[var(--color-surface)] rounded-[var(--border-radius-main)] shadow-[5px_5px_10px_var(--color-shadow-dark),_-5px_-5px_10px_var(--color-shadow-light)] border border-[var(--color-shadow-light)] p-4 sm:p-6 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
    return <div className={`pb-4 mb-4 border-b border-[var(--color-border)] ${className}`}>{children}</div>;
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
    return <h3 className={`text-xl font-semibold text-[var(--color-text-strong)] ${className}`}>{children}</h3>;
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
    return <div className={className}>{children}</div>;
}