import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DataCard } from '@/components/ui/data-card';
import { 
  Users, 
  FileText, 
  CreditCard, 
  Activity, 
  ArrowUpRight, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { format, subDays, differenceInDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

// Type definitions
interface TrafficData {
  date: string;
  visitors: number;
  pageViews: number;
  bounceRate: number;
}

interface InvoiceData {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
}

interface ContactData {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isSpam: boolean;
}

// Mock data generators
const generateTrafficData = (days: number): TrafficData[] => {
  const data: TrafficData[] = [];
  const startDate = subDays(new Date(), days - 1);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      visitors: Math.floor(Math.random() * 500) + 100,
      pageViews: Math.floor(Math.random() * 1200) + 300,
      bounceRate: Math.floor(Math.random() * 35) + 30,
    });
  }
  
  return data;
};

const calculateTrafficStats = (data: TrafficData[]) => {
  if (!data || data.length === 0) return { totalVisitors: 0, totalPageViews: 0, avgBounceRate: 0 };
  
  const totalVisitors = data.reduce((sum, item) => sum + item.visitors, 0);
  const totalPageViews = data.reduce((sum, item) => sum + item.pageViews, 0);
  const avgBounceRate = parseFloat((data.reduce((sum, item) => sum + item.bounceRate, 0) / data.length).toFixed(1));
  
  return { totalVisitors, totalPageViews, avgBounceRate };
};

// Traffic source data
const trafficSourceData = [
  { name: 'Google', value: 45 },
  { name: 'Direct', value: 25 },
  { name: 'Social', value: 15 },
  { name: 'Referral', value: 10 },
  { name: 'Other', value: 5 },
];

// Colors for charts
const COLORS = ['#35c677', '#1E364B', '#FF8042', '#9B5DE5', '#0088FE'];

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days'>('30days');
  const [activeTimeTab, setActiveTimeTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeTab, setActiveTab] = useState('traffic');
  
  // API calls for real data
  const { data: trafficData } = useQuery({
    queryKey: ['/api/traffic-stats'],
  });
  
  const { data: invoices } = useQuery({
    queryKey: ['/api/invoices'],
  });
  
  const { data: contacts } = useQuery({
    queryKey: ['/api/contacts'],
  });
  
  // Filter invoices based on status
  const paidInvoices = Array.isArray(invoices) ? invoices.filter((invoice: any) => invoice.status === 'paid') : [];
  const unpaidInvoices = Array.isArray(invoices) ? invoices.filter((invoice: any) => invoice.status === 'unpaid') : [];
  
  // Calculate total revenue
  const totalRevenue = Array.isArray(paidInvoices) 
    ? paidInvoices.reduce((sum: number, invoice: any) => sum + parseFloat(invoice.amount), 0)
    : 0;
  
  // Generate traffic data based on selected date range
  const getDaysFromRange = () => {
    switch (dateRange) {
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      default: return 30;
    }
  };
  
  // Process traffic data from API
  const processedTrafficData = useMemo(() => {
    if (!Array.isArray(trafficData) || trafficData.length === 0) {
      return [];
    }
    
    // Sort by date
    const sortedData = [...trafficData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Filter based on selected date range
    const today = new Date();
    const startDate = subDays(today, getDaysFromRange());
    
    return sortedData
      .filter(item => new Date(item.date) >= startDate)
      .map(item => ({
        date: format(new Date(item.date), 'yyyy-MM-dd'),
        visitors: item.visitors,
        pageViews: item.pageViews,
        bounceRate: parseFloat(item.bounceRate),
      }));
  }, [trafficData, dateRange]);
  
  // Calculate traffic statistics
  const { totalVisitors, totalPageViews, avgBounceRate } = calculateTrafficStats(processedTrafficData);
  
  // Count recent form submissions
  const recentContacts = Array.isArray(contacts) 
    ? contacts.filter((contact: any) => {
        const contactDate = new Date(contact.createdAt);
        const thirtyDaysAgo = subDays(new Date(), 30);
        return contactDate >= thirtyDaysAgo;
      })
    : [];
    
  // Count unread form submissions  
  const unreadContacts = Array.isArray(contacts)
    ? contacts.filter((contact: any) => !contact.isRead)
    : [];
    
  // Function to generate traffic data for the past 30 days
  const generateAndAddTrafficData = async () => {
    try {
      const today = new Date();
      const promises = [];
      
      // Generate data for the past 30 days
      for (let i = 0; i < 30; i++) {
        const date = subDays(today, i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        // Generate realistic but random data
        const visitors = Math.floor(Math.random() * 100) + 50; // Between 50-150 visitors
        const pageViews = visitors * (Math.floor(Math.random() * 3) + 2); // 2-5 pages per visitor
        const bounceRate = (Math.random() * 30 + 20).toFixed(2); // 20-50% bounce rate
        
        // Create traffic stat object
        const trafficStat = {
          date: formattedDate,
          visitors,
          pageViews,
          bounceRate,
          avgSessionDuration: Math.floor(Math.random() * 180) + 60, // 1-4 minutes
          sources: JSON.stringify({
            direct: Math.floor(visitors * 0.4),
            organic: Math.floor(visitors * 0.3),
            social: Math.floor(visitors * 0.2),
            referral: Math.floor(visitors * 0.1)
          })
        };
        
        // Add to database
        promises.push(
          fetch('/api/traffic-stats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(trafficStat)
          })
        );
      }
      
      await Promise.all(promises);
      
      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Error generating traffic data:', error);
      alert('Failed to generate traffic data. Please try again.');
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Analyze website performance and traffic.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={generateAndAddTrafficData}
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate Traffic Data
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <TabsList>
            <TabsTrigger
              value="7days"
              onClick={() => setDateRange('7days')}
              className={dateRange === '7days' ? 'bg-primary text-primary-foreground' : ''}
            >
              Last 7 Days
            </TabsTrigger>
            <TabsTrigger
              value="30days"
              onClick={() => setDateRange('30days')}
              className={dateRange === '30days' ? 'bg-primary text-primary-foreground' : ''}
            >
              Last 30 Days
            </TabsTrigger>
            <TabsTrigger
              value="90days"
              onClick={() => setDateRange('90days')}
              className={dateRange === '90days' ? 'bg-primary text-primary-foreground' : ''}
            >
              Last 90 Days
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DataCard
          title="Total Visitors"
          value={totalVisitors.toString()}
          icon={<Users className="h-5 w-5 text-primary" />}
          change={{
            value: 12.5,
            isPositive: true
          }}
        />
        <DataCard
          title="Page Views"
          value={totalPageViews.toString()}
          icon={<Activity className="h-5 w-5 text-primary" />}
          change={{
            value: 8.2,
            isPositive: true
          }}
        />
        <DataCard
          title="Form Submissions"
          value={recentContacts.length.toString()}
          icon={<FileText className="h-5 w-5 text-primary" />}
          change={{
            value: 5.1,
            isPositive: true
          }}
        />
        <DataCard
          title="Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={<CreditCard className="h-5 w-5 text-primary" />}
          change={{
            value: 18.3,
            isPositive: true
          }}
        />
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        <Tabs defaultValue="traffic" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b mb-4">
            <TabsList>
              <TabsTrigger value="traffic" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Traffic
              </TabsTrigger>
              <TabsTrigger value="sources" className="flex items-center">
                <PieChartIcon className="mr-2 h-4 w-4" />
                Sources
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center">
                <LineChartIcon className="mr-2 h-4 w-4" />
                Revenue
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Traffic Tab */}
          <TabsContent value="traffic">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <CardTitle>Website Traffic</CardTitle>
                    <CardDescription>Traffic trends over time</CardDescription>
                  </div>
                  <Tabs value={activeTimeTab} onValueChange={setActiveTimeTab as any} className="mt-3 sm:mt-0">
                    <TabsList>
                      <TabsTrigger value="daily">Daily</TabsTrigger>
                      <TabsTrigger value="weekly">Weekly</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={processedTrafficData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 30,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                      />
                      <YAxis />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'bounceRate') return [`${value}%`, 'Bounce Rate'];
                        return [value, name === 'pageViews' ? 'Page Views' : 'Visitors'];
                      }} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="visitors"
                        stroke="#35c677"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="pageViews"
                        stroke="#1E364B"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="bounceRate"
                        stroke="#FF8042"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Sources Tab */}
          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trafficSourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {trafficSourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Source Breakdown</h3>
                    <div className="space-y-6">
                      {trafficSourceData.map((source, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{source.name}</span>
                            <span className="text-sm font-medium">{source.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div 
                              className="h-2.5 rounded-full" 
                              style={{ 
                                width: `${source.value}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Financial performance and invoice status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                        <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Invoices</div>
                        <div className="text-3xl font-bold">{Array.isArray(invoices) ? invoices.length : 0}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span>Paid</span>
                        </div>
                        <span className="font-medium">{paidInvoices.length} invoices</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                          <span>Unpaid</span>
                        </div>
                        <span className="font-medium">{unpaidInvoices.length} invoices</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/admin/invoices">
                        View All Invoices
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { month: 'Jan', revenue: 3200 },
                          { month: 'Feb', revenue: 4500 },
                          { month: 'Mar', revenue: 3800 },
                          { month: 'Apr', revenue: 5100 },
                          { month: 'May', revenue: 6200 },
                          { month: 'Jun', revenue: 7500 },
                        ]}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="#35c677" />
                      </BarChart>
                    </ResponsiveContainer>
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