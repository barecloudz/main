import React from 'react';

interface CloudAnimationProps {
  className?: string;
}

export const CloudBackground: React.FC<CloudAnimationProps> = ({ className }) => {
  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <div className="clouds-container">
        {Array.from({ length: 10 }).map((_, index) => (
          <div 
            key={index} 
            className={`cloud cloud-${index + 1}`}
            style={{
              '--delay': `${index * 3}s`,
              '--duration': `${30 + Math.random() * 20}s`,
              '--scale': `${0.5 + Math.random() * 0.8}`,
              '--top': `${Math.random() * 50}%`,
            } as React.CSSProperties}
          ></div>
        ))}
      </div>
    </div>
  );
};
