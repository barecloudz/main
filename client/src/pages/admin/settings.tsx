import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useTheme } from "@/lib/ThemeProvider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Switch
} from "@/components/ui/switch";
import { 
  User, 
  Mail, 
  Key, 
  Globe, 
  Moon,
  Sun,
  BellRing,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

// Form schemas
const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  company: z.string().optional(),
  phone: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function AdminSettings() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Contact information state
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
    hours: '',
    social: ''
  });
  
  // Fetch contact settings
  const { data: contactSettings, isLoading: isLoadingContactSettings } = useQuery({
    queryKey: ['/api/settings/contact'],
    onSuccess: (data) => {
      if (data) {
        setContactInfo({
          email: data.find((s: any) => s.key === 'contact_email')?.value || '',
          phone: data.find((s: any) => s.key === 'contact_phone')?.value || '',
          address: data.find((s: any) => s.key === 'contact_address')?.value || '',
          hours: data.find((s: any) => s.key === 'contact_hours')?.value || '',
          social: data.find((s: any) => s.key === 'contact_social')?.value || '',
        });
      }
    }
  });
  
  // Load contact settings function
  const loadContactSettings = () => {
    if (contactSettings) {
      setContactInfo({
        email: contactSettings.find((s: any) => s.key === 'contact_email')?.value || '',
        phone: contactSettings.find((s: any) => s.key === 'contact_phone')?.value || '',
        address: contactSettings.find((s: any) => s.key === 'contact_address')?.value || '',
        hours: contactSettings.find((s: any) => s.key === 'contact_hours')?.value || '',
        social: contactSettings.find((s: any) => s.key === 'contact_social')?.value || '',
      });
    }
  };
  
  // Save contact info mutation
  const saveContactInfoMutation = useMutation({
    mutationFn: async (contactData: typeof contactInfo) => {
      const settings = [
        { key: 'contact_email', value: contactData.email, category: 'contact' },
        { key: 'contact_phone', value: contactData.phone, category: 'contact' },
        { key: 'contact_address', value: contactData.address, category: 'contact' },
        { key: 'contact_hours', value: contactData.hours, category: 'contact' },
        { key: 'contact_social', value: contactData.social, category: 'contact' },
      ];
      
      const response = await apiRequest('POST', '/api/settings/batch', { settings });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save contact information');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/contact'] });
      toast({
        title: "Success",
        description: "Contact information updated successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('Error saving contact information:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save contact information",
        variant: "destructive",
      });
    },
  });
  
  // Handle saving contact info
  const handleSaveContactInfo = () => {
    saveContactInfoMutation.mutate(contactInfo);
  };

  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      phone: "",
      profileImageUrl: "",
    },
  });

  // Update profile form when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileImage(user.profileImageUrl || null);
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        company: user.company || "",
        phone: user.phone || "",
        profileImageUrl: user.profileImageUrl || "",
      });
    }
  }, [user, profileForm]);
  
  // Handle profile image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        profileForm.setValue("profileImageUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileFormValues) => {
      if (!user || !user.id) {
        throw new Error('User not found');
      }
      const response = await apiRequest('PATCH', `/api/users/${user.id}`, profileData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (passwordData: any) => {
      const response = await apiRequest('PATCH', `/api/users/${user.id}/password`, passwordData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update password');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password updated successfully",
        variant: "default",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Handle password form submission
  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  if (isLoadingUser) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center">
              <Key className="mr-2 h-4 w-4" />
              Password
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <BellRing className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information and settings.
                </CardDescription>
              </CardHeader>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <CardContent className="space-y-6">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative mb-4">
                        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary bg-gray-100 flex items-center justify-center">
                          {profileImage ? (
                            <img 
                              src={profileImage} 
                              alt="Profile" 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white p-1 rounded-full"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Upload a profile photo</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="mr-2" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => profileForm.reset()}>
                      Cancel
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Password Settings */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password for increased security.
                </CardDescription>
              </CardHeader>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                  <CardContent className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 6 characters long.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="mr-2" disabled={updatePasswordMutation.isPending}>
                      {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => passwordForm.reset()}>
                      Cancel
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the appearance of the application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <span className="text-sm font-medium">
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </span>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Control how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm font-medium">Email Notifications</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates.
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm font-medium">SMS Notifications</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive text message alerts for critical updates.
                    </p>
                  </div>
                  <Switch
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-sm font-medium">Two-Factor Authentication</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorAuth}
                    onCheckedChange={setTwoFactorAuth}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => {
                  toast({
                    title: "Settings Saved",
                    description: "Your notification preferences have been updated",
                  });
                }}>
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Google Analytics</CardTitle>
                <CardDescription>
                  Configure Google Analytics tracking for your website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Google Analytics</h3>
                    <p className="text-sm text-muted-foreground">Track website traffic and visitor behavior</p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={!!import.meta.env.VITE_GA_MEASUREMENT_ID}
                    disabled={true}
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="ga-id" className="text-sm font-medium">Measurement ID</label>
                  <div className="mt-2 flex items-center">
                    <Input 
                      id="ga-id" 
                      type="text" 
                      value={import.meta.env.VITE_GA_MEASUREMENT_ID || ''} 
                      disabled={true}
                      className="max-w-xs"
                    />
                    <p className="ml-2 text-xs text-muted-foreground">
                      (Set via environment variable)
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    To change this value, update the VITE_GA_MEASUREMENT_ID environment variable.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Set up contact information displayed on your website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Contact Information Form */}
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-email" className="text-sm font-medium">Email Address</label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="contact@barecloudz.com"
                        className="mt-2"
                        onChange={(e) => setContactInfo((prev) => ({ ...prev, email: e.target.value }))}
                        value={contactInfo.email}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="text-sm font-medium">Phone Number</label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="mt-2"
                        onChange={(e) => setContactInfo((prev) => ({ ...prev, phone: e.target.value }))}
                        value={contactInfo.phone}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-address" className="text-sm font-medium">Address</label>
                    <Textarea
                      id="contact-address"
                      placeholder="123 Main St, City, State, ZIP"
                      className="mt-2"
                      onChange={(e) => setContactInfo((prev) => ({ ...prev, address: e.target.value }))}
                      value={contactInfo.address}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-hours" className="text-sm font-medium">Business Hours</label>
                      <Textarea
                        id="contact-hours"
                        placeholder="Monday-Friday: 9am-5pm"
                        className="mt-2"
                        onChange={(e) => setContactInfo((prev) => ({ ...prev, hours: e.target.value }))}
                        value={contactInfo.hours}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-social" className="text-sm font-medium">Social Media Links</label>
                      <Textarea
                        id="contact-social"
                        placeholder="https://facebook.com/barecloudz&#10;https://instagram.com/barecloudz"
                        className="mt-2"
                        onChange={(e) => setContactInfo((prev) => ({ ...prev, social: e.target.value }))}
                        value={contactInfo.social}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      className="mr-2" 
                      onClick={() => loadContactSettings()}
                      disabled={saveContactInfoMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveContactInfo}
                      disabled={saveContactInfoMutation.isPending}
                    >
                      {saveContactInfoMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}