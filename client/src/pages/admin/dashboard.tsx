import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  CreditCard, 
  MailOpen, 
  BarChart, 
  PieChart, 
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { DataCard } from '@/components/ui/data-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTheme } from '@/lib/ThemeProvider';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  
  // Fetch traffic stats
  const { data: trafficStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/traffic-stats'],
  });
  
  // Fetch contacts (most recent)
  const { data: contacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['/api/contacts'],
  });
  
  // Fetch clients
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/users/clients'],
  });
  
  // Fetch recent invoices
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['/api/invoices'],
  });
  
  // Reset traffic stats mutation
  const resetTrafficStatsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/traffic-stats/reset', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reset traffic statistics');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Statistics Reset",
        description: "Traffic statistics have been reset successfully.",
      });
      
      // Invalidate and refetch traffic stats
      queryClient.invalidateQueries({ queryKey: ['/api/traffic-stats'] });
      setIsResetConfirmOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset traffic statistics",
        variant: "destructive",
      });
      setIsResetConfirmOpen(false);
    }
  });
  
  // Demo data for charts
  const trafficData = trafficStats || [
    { date: '2023-01-01', pageViews: 1200, uniqueVisitors: 800 },
    { date: '2023-01-02', pageViews: 1300, uniqueVisitors: 900 },
    { date: '2023-01-03', pageViews: 1400, uniqueVisitors: 950 },
    { date: '2023-01-04', pageViews: 1500, uniqueVisitors: 1000 },
    { date: '2023-01-05', pageViews: 1700, uniqueVisitors: 1200 },
    { date: '2023-01-06', pageViews: 1600, uniqueVisitors: 1100 },
    { date: '2023-01-07', pageViews: 1800, uniqueVisitors: 1300 }
  ];
  
  const sourceData = [
    { name: 'Direct', value: 400 },
    { name: 'Organic Search', value: 300 },
    { name: 'Social Media', value: 200 },
    { name: 'Referral', value: 100 },
    { name: 'Email', value: 50 }
  ];
  
  const conversionData = [
    { name: 'Jan', conversions: 20 },
    { name: 'Feb', conversions: 30 },
    { name: 'Mar', conversions: 25 },
    { name: 'Apr', conversions: 40 },
    { name: 'May', conversions: 35 },
    { name: 'Jun', conversions: 50 },
  ];
  
  const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard.</p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <DataCard
          title="Total Clients"
          value={clients?.length || 0}
          icon={<Users className="h-5 w-5" />}
          change={{ value: 12, isPositive: true }}
          loading={isLoadingClients}
        />
        
        <DataCard
          title="Active Invoices"
          value={`$${invoices?.filter(i => i.status === 'unpaid').reduce((total, inv) => total + parseFloat(inv.amount), 0).toFixed(2) || '0.00'}`}
          icon={<CreditCard className="h-5 w-5" />}
          change={{ value: 8, isPositive: true }}
          loading={isLoadingInvoices}
        />
        
        <DataCard
          title="New Messages"
          value={contacts?.filter(c => !c.isRead && !c.isSpam).length || 0}
          icon={<MailOpen className="h-5 w-5" />}
          change={{ value: 5, isPositive: false }}
          loading={isLoadingContacts}
        />
        
        <DataCard
          title="Total Traffic"
          value={trafficStats?.reduce((sum, stat) => sum + stat.pageViews, 0) || 0}
          icon={<BarChart className="h-5 w-5" />}
          change={{ value: 15, isPositive: true }}
          loading={isLoadingStats}
        />
      </div>
      
      {/* Traffic Overview Chart */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Traffic Overview</CardTitle>
            <CardDescription>Daily page views and unique visitors</CardDescription>
          </div>
          
          <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden md:inline">Reset Data</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Traffic Statistics</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all traffic statistics data.
                  Are you sure you want to reset all traffic data to zero?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => resetTrafficStatsMutation.mutate()}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={resetTrafficStatsMutation.isPending}
                >
                  {resetTrafficStatsMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Yes, Reset Data"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trafficData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
                <XAxis 
                  dataKey="date" 
                  stroke={isDark ? "#aaa" : "#666"}
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke={isDark ? "#aaa" : "#666"} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? "#1f2937" : "#fff",
                    borderColor: isDark ? "#374151" : "#e5e7eb",
                    color: isDark ? "#fff" : "#000"
                  }} 
                />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.5}
                  name="Page Views"
                />
                <Area
                  type="monotone"
                  dataKey="uniqueVisitors"
                  stackId="2"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.5}
                  name="Unique Visitors"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-900/30"
              onClick={() => setIsResetConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden md:inline">Reset Data</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? "#1f2937" : "#fff",
                      borderColor: isDark ? "#374151" : "#e5e7eb",
                      color: isDark ? "#fff" : "#000"
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    formatter={(value) => <span style={{ color: isDark ? "#fff" : "#000" }}>{value}</span>}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Conversions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Form Conversions</CardTitle>
              <CardDescription>Monthly form submissions</CardDescription>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-900/30"
              onClick={() => setIsResetConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden md:inline">Reset Data</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={conversionData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
                  <XAxis dataKey="name" stroke={isDark ? "#aaa" : "#666"} />
                  <YAxis stroke={isDark ? "#aaa" : "#666"} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? "#1f2937" : "#fff",
                      borderColor: isDark ? "#374151" : "#e5e7eb",
                      color: isDark ? "#fff" : "#000"
                    }} 
                  />
                  <Bar dataKey="conversions" fill="#F59E0B" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest form submissions and client activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoadingContacts ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : contacts && contacts.length > 0 ? (
              contacts.slice(0, 5).map((contact, index) => (
                <div key={contact.id || index} className="flex items-start space-x-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className={`rounded-full p-2 ${contact.isRead ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary/10'}`}>
                    <MailOpen className={`h-4 w-4 ${contact.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{contact.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{contact.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(contact.createdAt).toLocaleDateString()} at {new Date(contact.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${contact.isSpam 
                        ? 'bg-destructive/10 text-destructive' 
                        : !contact.isRead 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
                    >
                      {contact.isSpam ? 'Spam' : contact.isRead ? 'Read' : 'New'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No recent activity found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
