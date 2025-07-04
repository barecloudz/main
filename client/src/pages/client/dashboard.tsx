import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataCard } from '@/components/ui/data-card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  LineChart, 
  FileText,
  Mail,
  CreditCard, 
  ArrowRight,
  Calendar,
  CheckCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@/lib/ThemeProvider';
import { Link } from 'wouter';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Fetch marketing plans for the user
  const { data: marketingPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: [`/api/users/${user?.id}/marketing-plans`],
  });

  // Fetch invoices for the user
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: [`/api/users/${user?.id}/invoices`],
  });

  // Demo performance data for charts (in a real app, this would come from the API)
  const performanceData = [
    { date: '2023-06-01', visitors: 1200, conversion: 5.2 },
    { date: '2023-06-08', visitors: 1350, conversion: 5.8 },
    { date: '2023-06-15', visitors: 1500, conversion: 6.1 },
    { date: '2023-06-22', visitors: 1750, conversion: 6.5 },
    { date: '2023-06-29', visitors: 1900, conversion: 7.0 },
    { date: '2023-07-06', visitors: 2100, conversion: 7.3 },
    { date: '2023-07-13', visitors: 2300, conversion: 7.8 },
  ];

  // Calculate stats from marketing plans
  const activeMarketingPlans = marketingPlans?.filter((plan: any) => plan.status === 'active') || [];
  const activePlanCount = activeMarketingPlans.length;
  
  // Calculate stats from invoices
  const unpaidInvoices = invoices?.filter((invoice: any) => invoice.status === 'unpaid' || invoice.status === 'overdue') || [];
  const unpaidInvoiceCount = unpaidInvoices.length;
  const unpaidAmount = unpaidInvoices.reduce((total: number, inv: any) => total + parseFloat(inv.amount), 0).toFixed(2);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Welcome, {user?.firstName || 'Client'}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your marketing performance and account information.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <DataCard
          title="Active Marketing Plans"
          value={activePlanCount.toString()}
          icon={<FileText className="h-5 w-5" />}
          change={{ value: 0, isPositive: true }}
          loading={isLoadingPlans}
        />
        
        <DataCard
          title="Unpaid Invoices"
          value={unpaidInvoiceCount.toString()}
          icon={<CreditCard className="h-5 w-5" />}
          change={{ value: 0, isPositive: true }}
          loading={isLoadingInvoices}
        />
        
        <DataCard
          title="Outstanding Balance"
          value={`$${unpaidAmount}`}
          icon={<Mail className="h-5 w-5" />}
          change={{ value: 0, isPositive: true }}
          loading={isLoadingInvoices}
        />
      </div>

      {/* Performance Chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Marketing Performance</CardTitle>
          <CardDescription>Website traffic and conversion rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={performanceData}
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
                <YAxis 
                  yAxisId="left" 
                  stroke={isDark ? "#aaa" : "#666"} 
                  domain={[0, 'auto']}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke={isDark ? "#aaa" : "#666"} 
                  domain={[0, 10]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? "#1f2937" : "#fff",
                    borderColor: isDark ? "#374151" : "#e5e7eb",
                    color: isDark ? "#fff" : "#000"
                  }} 
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="visitors"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  name="Website Visitors"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="conversion"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  name="Conversion Rate (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Plans and Invoices Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Marketing Plans Section */}
        <Card>
          <CardHeader>
            <CardTitle>Active Marketing Plans</CardTitle>
            <CardDescription>Your current marketing strategies and campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingPlans ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : marketingPlans && marketingPlans.length > 0 ? (
              <div className="space-y-4">
                {activeMarketingPlans.slice(0, 3).map((plan: any) => (
                  <div key={plan.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {plan.description}
                      </p>
                      <div className="flex items-center mt-2 text-sm">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(plan.startDate).toLocaleDateString()} - 
                          {plan.endDate ? new Date(plan.endDate).toLocaleDateString() : 'Ongoing'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-2">
                  <Link href="/client/marketing-plan">
                    <Button variant="outline" className="w-full">
                      View All Marketing Plans
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active marketing plans</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Contact your account manager to set up your marketing strategy
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoices Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Your billing history and payment status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInvoices ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : invoices && invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.slice(0, 3).map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">Invoice #{invoice.invoiceNumber}</h3>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="font-semibold mr-4">${parseFloat(invoice.amount).toFixed(2)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                          : invoice.status === 'overdue'
                          ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-2">
                  <Link href="/client/invoices">
                    <Button variant="outline" className="w-full">
                      View All Invoices
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No invoices found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You don't have any invoices in your account yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/client/marketing-plan">
              <Button variant="outline" className="w-full h-auto py-4 px-4 flex flex-col items-center justify-center space-y-2">
                <FileText className="h-6 w-6" />
                <span>View Marketing Plans</span>
              </Button>
            </Link>
            
            <Link href="/client/invoices">
              <Button variant="outline" className="w-full h-auto py-4 px-4 flex flex-col items-center justify-center space-y-2">
                <CreditCard className="h-6 w-6" />
                <span>Manage Invoices</span>
              </Button>
            </Link>
            
            <Link href="#contact-support">
              <Button variant="outline" className="w-full h-auto py-4 px-4 flex flex-col items-center justify-center space-y-2">
                <Mail className="h-6 w-6" />
                <span>Contact Support</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
