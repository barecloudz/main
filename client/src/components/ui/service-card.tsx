import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { robotBoxFill, floatAnimation } from '@/lib/animationUtils';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
  delay?: number;
  className?: string;
}

export function ServiceCard({
  icon,
  title,
  description,
  color = 'bg-primary',
  delay = 0,
  className = '',
}: ServiceCardProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={floatAnimation(delay)}
      className={className}
    >
      <Card className="overflow-hidden bg-[#191919] backdrop-blur-sm rounded-xl border border-white/20 shadow-xl relative h-full">
        <div className="relative z-10">
          <CardContent className="p-6">
            <div className={`h-12 w-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
              {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-blue-100">{description}</p>
          </CardContent>
        </div>
        
        <motion.div 
          className="absolute inset-0 bg-primary/10 z-0"
          variants={robotBoxFill}
        />
      </Card>
    </motion.div>
  );
}
