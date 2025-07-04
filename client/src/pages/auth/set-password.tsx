import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import logoPath from '@/assets/logo.png';

// Form validation schema
const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SetPasswordPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Extract token from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    
    if (!tokenParam) {
      toast({
        title: 'Invalid Request',
        description: 'No token provided. Please use the link from your email.',
        variant: 'destructive',
      });
      setIsValidating(false);
      return;
    }
    
    setToken(tokenParam);
    
    // Validate token
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/password/token-valid?token=${tokenParam}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (data.valid) {
          setIsTokenValid(true);
        } else {
          toast({
            title: 'Invalid or Expired Token',
            description: 'This password reset link is invalid or has expired. Please request a new one.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to validate token. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsValidating(false);
      }
    };
    
    validateToken();
  }, [toast]);

  // Form submission handler
  async function onSubmit(values: PasswordFormValues) {
    if (!token) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success!',
          description: 'Your password has been set. You can now log in.',
          variant: 'default',
        });
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to set password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set password. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading state
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-200 to-sky-300">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center">
            <img src={logoPath} alt="BareCloudz Logo" className="h-16 mb-4" />
            <CardTitle>Validating your request</CardTitle>
            <CardDescription>Please wait while we validate your password reset link...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#35c677]"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show invalid token message
  if (!isTokenValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-200 to-sky-300">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center">
            <img src={logoPath} alt="BareCloudz Logo" className="h-16 mb-4" />
            <CardTitle>Invalid or Expired Link</CardTitle>
            <CardDescription>This password reset link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-4">
            <p>Please request a new password reset link or contact support for assistance.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button className="bg-[#35c677] hover:bg-[#2ca55f]" onClick={() => navigate('/login')}>
              Return to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show password setup form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-200 to-sky-300">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-col items-center">
          <img src={logoPath} alt="BareCloudz Logo" className="h-16 mb-4" />
          <CardTitle>Set Your Password</CardTitle>
          <CardDescription>Please create a secure password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-[#35c677] hover:bg-[#2ca55f]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Setting Password</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full"></div>
                  </>
                ) : 'Set Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>Need help? Contact our support team.</p>
        </CardFooter>
      </Card>
    </div>
  );
}