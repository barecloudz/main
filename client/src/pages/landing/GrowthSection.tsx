import React from 'react';
import { motion } from 'framer-motion';
import { AnimateWhenVisible } from '@/lib/animationUtils';
import { lightningAnimation, fadeIn, slideUp } from '@/lib/animationUtils';

export function GrowthSection() {
  return (
    <section id="growth" className="py-20 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
      {/* Lightning animation overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-transparent to-amber-500/5"
        initial="initial"
        animate="animate"
        variants={lightningAnimation}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimateWhenVisible>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-4">
              More Growth, More Clients Guaranteed
            </h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
              Our proven strategies have helped businesses across industries achieve remarkable growth.
            </p>
          </div>
        </AnimateWhenVisible>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Case Study 1 */}
          <AnimateWhenVisible variants={fadeIn}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden transition transform hover:scale-105 duration-300">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                alt="Business growth analytics"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">E-Commerce Growth</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Helped an online retailer increase sales by 157% through strategic PPC and email campaigns.
                </p>
                <div className="flex items-center text-primary font-medium">
                  <span>See case study</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </AnimateWhenVisible>
          
          {/* Case Study 2 */}
          <AnimateWhenVisible variants={fadeIn}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden transition transform hover:scale-105 duration-300">
              <img
                src="https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                alt="Business team celebrating success"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">SaaS Client Acquisition</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Boosted lead generation by 83% for a software company through content marketing and SEO.
                </p>
                <div className="flex items-center text-primary font-medium">
                  <span>See case study</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </AnimateWhenVisible>
          
          {/* Case Study 3 */}
          <AnimateWhenVisible variants={fadeIn}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden transition transform hover:scale-105 duration-300">
              <img
                src="https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                alt="Marketing analytics dashboard"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Local Business Expansion</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Helped a local service provider expand to 3 new locations with targeted local SEO and social media.
                </p>
                <div className="flex items-center text-primary font-medium">
                  <span>See case study</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </AnimateWhenVisible>
        </div>
        
        <AnimateWhenVisible variants={slideUp}>
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Our Results Speak for Themselves
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md">
                <div className="text-4xl font-extrabold text-primary mb-2">250+</div>
                <div className="text-gray-600 dark:text-gray-400">Happy Clients</div>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md">
                <div className="text-4xl font-extrabold text-secondary mb-2">92%</div>
                <div className="text-gray-600 dark:text-gray-400">Client Retention</div>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md">
                <div className="text-4xl font-extrabold text-accent mb-2">183%</div>
                <div className="text-gray-600 dark:text-gray-400">Average ROI</div>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md">
                <div className="text-4xl font-extrabold text-primary-dark mb-2">48hr</div>
                <div className="text-gray-600 dark:text-gray-400">Response Time</div>
              </div>
            </div>
          </div>
        </AnimateWhenVisible>
      </div>
    </section>
  );
}
