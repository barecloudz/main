import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface AvatarCardProps {
  name: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function AvatarCard({
  name,
  subtitle,
  description,
  imageUrl,
  icon,
  className = '',
}: AvatarCardProps) {
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 mb-4">
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt={name} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(name)}
              </AvatarFallback>
            )}
          </Avatar>
          
          {icon && <div className="mb-4">{icon}</div>}
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{name}</h3>
          
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{subtitle}</p>
          )}
          
          {description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
