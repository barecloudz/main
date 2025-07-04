import React from 'react';
import { AnimateWhenVisible } from '@/lib/animationUtils';
import { Megaphone, Search, BarChart, Mail, PenTool, LineChart } from 'lucide-react';

export function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateWhenVisible>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Our Comprehensive Marketing Services
            </h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
              From strategy to execution, we provide end-to-end digital marketing solutions to help your business thrive online.
            </p>
          </div>
        </AnimateWhenVisible>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Service Details 1 */}
          <AnimateWhenVisible>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&h=500"
                alt="Social media marketing specialist"
                className="rounded-xl shadow-lg w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent rounded-xl flex items-end">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Digital Marketing Strategy</h3>
                  <p className="text-gray-200">Comprehensive marketing plans tailored to your business goals, audience, and industry.</p>
                </div>
              </div>
            </div>
          </AnimateWhenVisible>
          
          {/* Service Details 2 */}
          <AnimateWhenVisible>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&h=500"
                alt="Software developer coding"
                className="rounded-xl shadow-lg w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent rounded-xl flex items-end">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Website Development & SEO</h3>
                  <p className="text-gray-200">Custom websites designed for conversion and optimized for search engines.</p>
                </div>
              </div>
            </div>
          </AnimateWhenVisible>
          
          {/* Service List */}
          <AnimateWhenVisible className="md:col-span-2 mt-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Service Item */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <Megaphone size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Social Media Marketing</h4>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Strategic social campaigns that engage your target audience.</p>
                  </div>
                </div>
                
                {/* Service Item */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-secondary text-white">
                      <Search size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">SEO Optimization</h4>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Improve your search rankings with data-driven strategies.</p>
                  </div>
                </div>
                
                {/* Service Item */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent text-white">
                      <BarChart size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">PPC Campaigns</h4>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Targeted advertising to reach potential customers.</p>
                  </div>
                </div>
                
                {/* Service Item */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-dark text-white">
                      <Mail size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Email Marketing</h4>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Nurture leads and drive conversions with personalized campaigns.</p>
                  </div>
                </div>
                
                {/* Service Item */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-secondary-dark text-white">
                      <PenTool size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Content Marketing</h4>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Engage your audience with valuable, relevant content.</p>
                  </div>
                </div>
                
                {/* Service Item */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent-dark text-white">
                      <LineChart size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Analytics & Reporting</h4>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Track performance and make data-driven decisions.</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimateWhenVisible>
        </div>
      </div>
    </section>
  );
}
