import React from 'react';
import { AnimateWhenVisible } from '@/lib/animationUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { Link } from 'wouter';

export function ClientPortalSection() {
  return (
    <section id="client-login" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateWhenVisible>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Client Portal
            </h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
              Access your marketing dashboard, reports, and plan details.
            </p>
          </div>
        </AnimateWhenVisible>
        
        <AnimateWhenVisible>
          <div className="max-w-md mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary mb-4">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Client Login</h3>
                </div>
                
                <div className="space-y-6">
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Log in to access your marketing dashboard, view your plans, and check your invoices.
                  </p>
                  
                  <Link href="/client-portal">
                    <Button className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>Need help accessing your account? <a href="#contact" className="font-medium text-primary hover:text-primary-dark">Contact us</a></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimateWhenVisible>
        
        <AnimateWhenVisible className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Real-Time Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">Access up-to-date performance metrics and campaign results.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Marketing Plans</h3>
              <p className="text-gray-600 dark:text-gray-400">View your customized marketing strategies and campaign details.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Invoice Management</h3>
              <p className="text-gray-600 dark:text-gray-400">Download and manage invoices, track payment status.</p>
            </div>
          </div>
        </AnimateWhenVisible>
        
        <AnimateWhenVisible className="mt-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Start Your Marketing Journey Today</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Not a client yet? Contact us to discuss how we can help your business grow with our tailored marketing solutions.
            </p>
            <a href="#contact" className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition">
              Get Started
            </a>
          </div>
        </AnimateWhenVisible>
      </div>
    </section>
  );
}
