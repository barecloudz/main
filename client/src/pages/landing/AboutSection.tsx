import React from 'react';
import { motion } from 'framer-motion';
import { AnimateWhenVisible } from '@/lib/animationUtils';
import { slideLeft, slideRight } from '@/lib/animationUtils';

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-[#191919] relative overflow-hidden">
      {/* Floating boxes background */}
      <div className="absolute inset-0 z-0">
        <div className="floating-box box1"></div>
        <div className="floating-box box2"></div>
        <div className="floating-box box3"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimateWhenVisible>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Revolutionize Your Marketing Strategy
            </h2>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              BareCloudz delivers cutting-edge digital marketing solutions designed to help your business thrive in today's competitive landscape.
            </p>
          </div>
        </AnimateWhenVisible>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimateWhenVisible variants={slideRight}>
            <div>
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="Digital marketing team collaborating"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </AnimateWhenVisible>
          
          <AnimateWhenVisible variants={slideLeft}>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Data-Driven Approach</h3>
                <p className="text-gray-300">We analyze your market, competition, and audience to create strategies based on real insights, not guesswork.</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Custom Solutions</h3>
                <p className="text-gray-300">Every business is unique. We create tailored marketing plans that align with your specific goals and challenges.</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Continuous Optimization</h3>
                <p className="text-gray-300">Our team constantly monitors performance and makes data-backed adjustments to maximize your ROI.</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Transparent Reporting</h3>
                <p className="text-gray-300">Access real-time analytics and comprehensive reports to see exactly how your campaigns are performing.</p>
              </div>
              
              <a
                href="#contact"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#191919] hover:bg-[#313131] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191919] transition"
              >
                Learn More About Our Process
              </a>
            </div>
          </AnimateWhenVisible>
        </div>
      </div>
    </section>
  );
}
