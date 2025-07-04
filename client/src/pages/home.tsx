import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/pages/landing/HeroSection';
import { AboutSection } from '@/pages/landing/AboutSection';
import { GrowthSection } from '@/pages/landing/GrowthSection';
import { ServicesSection } from '@/pages/landing/ServicesSection';
import { ContactSection } from '@/pages/landing/ContactSection';
import { ClientPortalSection } from '@/pages/landing/ClientPortalSection';
import { useAuth } from '@/hooks/useAuth';
import { User } from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with Cloud Animation */}
        <HeroSection />
        
        {/* About Section */}
        <AboutSection />
        
        {/* Growth Section with Lightning Animation */}
        <GrowthSection />
        
        {/* Services Section */}
        <ServicesSection />
        
        {/* Contact Section */}
        <ContactSection />
        
        {/* Client Portal Section */}
        <ClientPortalSection />
      </main>
      
      <Footer />
      
      {/* Client login floating button (mobile only) */}
      {!isAuthenticated && (
        <div className="lg:hidden fixed bottom-6 right-6">
          <a 
            href="/client-portal" 
            className="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition"
          >
            <User size={24} />
          </a>
        </div>
      )}
    </div>
  );
}
