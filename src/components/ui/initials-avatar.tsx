import React from 'react';
import { cn } from '@/lib/utils';

interface InitialsAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  backgroundColor?: string;
  textColor?: string;
}

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name,
  size = 'md',
  className,
  backgroundColor = '#1e40af',
  textColor = '#ffffff'
}) => {
  // Extraire les initiales du nom
  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2); // Limiter à 2 initiales maximum
  };

  const initials = getInitials(name);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl'
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold shadow-md',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor,
        color: textColor
      }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default InitialsAvatar;
