import React, { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudBackground } from '@/lib/cloudAnimations';
import { motion } from 'framer-motion';
import { fadeIn, slideUp } from '@/lib/animationUtils';
import { useToast } from '@/hooks/use-toast';
import logoWhite from '@assets/logo-white-png.png';
import { useAuth } from '@/hooks/useAuth';

// Form schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        setLocation('/admin/dashboard');
      } else {
        setLocation('/client/dashboard');
      }
    }
  }, [isAuthenticated, user, setLocation]);

  // Form setup
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Redirect based on role
      if (data.role === 'admin') {
        setLocation('/admin/dashboard');
      } else {
        setLocation('/client/dashboard');
      }
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please check your credentials and try again',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <CloudBackground className="absolute inset-0 z-0" />
      
      <div className="flex-1 flex items-center justify-center z-10 px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-md w-full"
        >
          <motion.div variants={slideUp} className="flex justify-center mb-8">
            <img src={logoWhite} alt="BareCloudz Logo" className="h-24" />
          </motion.div>
          
          <Card className="bg-black/80 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-center">Log In</CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your@email.com" 
                            {...field} 
                            className="bg-gray-900 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="bg-gray-900 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#35c677] hover:bg-[#2ba362] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Log in'}
                  </Button>
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3 items-center">
              <Button 
                variant="link" 
                className="text-[#35c677] hover:text-[#2ba362] p-0 h-auto"
                onClick={() => setLocation('/forgot-password')}
              >
                Forgot your password?
              </Button>
              <p className="text-sm text-gray-400">
                Having trouble logging in? Contact your administrator
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}