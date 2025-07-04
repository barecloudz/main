import React from 'react';
import { CloudBackground } from '@/lib/cloudAnimations';
import { ServiceCard } from '@/components/ui/service-card';
import { motion } from 'framer-motion';
import { fadeIn, slideUp } from '@/lib/animationUtils';
import { 
  Megaphone, 
  LineChart, 
  Mail, 
  BarChart 
} from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 bg-sky-500 text-white">
      {/* Cloud animation background */}
      <CloudBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.h1 
            variants={slideUp}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-white bg-[#191919] p-6 rounded-lg inline-block"
          >
            Modern Marketing Solutions for Your Business
          </motion.h1>
          
          <motion.p 
            variants={slideUp}
            className="text-xl text-white font-medium mb-10 bg-[#191919] p-4 rounded-lg inline-block"
          >
            Elevate your brand with our cloud-based marketing strategies that deliver real results.
          </motion.p>
          
          <motion.div 
            variants={slideUp}
            className="flex flex-wrap justify-center gap-4"
          >
            <a 
              href="#contact" 
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#191919] hover:bg-[#313131] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191919] transition"
            >
              Get a Free Consultation
            </a>
            <a 
              href="#services" 
              className="inline-flex items-center px-6 py-3 border border-[#191919] rounded-md text-base font-medium text-[#191919] bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191919] transition"
            >
              Explore Services
            </a>
          </motion.div>
        </motion.div>
        
        {/* Animated service boxes */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ServiceCard
            icon={<Megaphone className="text-white" size={24} />}
            title="Social Media Marketing"
            description="Engage your audience with strategic social campaigns that drive conversions."
            color="bg-accent"
            delay={0}
          />
          
          <ServiceCard
            icon={<LineChart className="text-white" size={24} />}
            title="SEO Optimization"
            description="Boost your rankings with data-driven SEO strategies tailored to your business."
            color="bg-secondary"
            delay={1}
          />
          
          <ServiceCard
            icon={<BarChart className="text-white" size={24} />}
            title="PPC Advertising"
            description="Target the right customers with precision pay-per-click campaigns."
            color="bg-primary"
            delay={2}
          />
          
          <ServiceCard
            icon={<Mail className="text-white" size={24} />}
            title="Email Marketing"
            description="Nurture leads and drive sales with personalized email campaigns."
            color="bg-accent-dark"
            delay={3}
          />
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
    </section>
  );
}
