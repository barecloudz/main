import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import logoPath from '@/assets/logo.png';
import { apiRequest } from '@/lib/queryClient';

// Form validation schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function ForgotPasswordPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize form
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  // Form submission handler
  async function onSubmit(values: EmailFormValues) {
    setIsSubmitting(true);
    
    try {
      await fetch('/api/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });
      
      // Always show success even if email doesn't exist (security best practice)
      setIsSubmitted(true);
      toast({
        title: 'Email Sent',
        description: 'If an account exists with that email, you will receive password reset instructions.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was a problem sending the email. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show success message after submission
  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-200 to-sky-300">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="flex flex-col items-center">
            <img src={logoPath} alt="BareCloudz Logo" className="h-16 mb-4" />
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>We've sent password reset instructions to the email address you provided.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-4">
            <p>Please check your inbox and follow the instructions to reset your password.</p>
            <p className="mt-4 text-sm text-gray-500">Didn't receive an email? Check your spam folder or verify your email address.</p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full bg-[#35c677] hover:bg-[#2ca55f]" onClick={() => setIsSubmitted(false)}>
              Try Again
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
              Return to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show request form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-200 to-sky-300">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-col items-center">
          <img src={logoPath} alt="BareCloudz Logo" className="h-16 mb-4" />
          <CardTitle>Forgot Your Password?</CardTitle>
          <CardDescription>Enter your email address and we'll send you instructions to reset your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
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
                    <span className="mr-2">Sending Email</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full"></div>
                  </>
                ) : 'Send Reset Instructions'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" className="text-sm text-gray-500" onClick={() => navigate('/login')}>
            Return to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}