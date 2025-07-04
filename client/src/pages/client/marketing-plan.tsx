import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CalendarIcon,
  Clock,
  FileText,
  BarChart2,
  Check,
  ChevronRight,
  Flag,
  ListChecks,
  BarChart,
  PieChart,
  TrendingUp,
  Megaphone,
  Mail,
  Search,
  Target,
  Users,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTheme } from '@/lib/ThemeProvider';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

export default function ClientMarketingPlan() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  
  // Fetch marketing plans for the user
  const { data: marketingPlans, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/marketing-plans`],
  });

  // Chart colors
  const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];
  
  // Demo data for results charts
  const performanceData = [
    { month: 'Jan', actual: 4000, target: 4500 },
    { month: 'Feb', actual: 5000, target: 4500 },
    { month: 'Mar', actual: 6000, target: 5000 },
    { month: 'Apr', actual: 7000, target: 5500 },
    { month: 'May', actual: 7500, target: 6000 },
    { month: 'Jun', actual: 8200, target: 6500 },
  ];
  
  const trafficSourceData = [
    { name: 'Organic Search', value: 35 },
    { name: 'Social Media', value: 25 },
    { name: 'Paid Ads', value: 20 },
    { name: 'Referral', value: 15 },
    { name: 'Direct', value: 5 },
  ];
  
  // Function to render plan status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'paused':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Function to calculate days remaining for a plan
  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return 'Ongoing';
    
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? `${diffDays} days remaining` : 'Completed';
  };
  
  // Function to calculate progress percentage
  const calculateProgress = (startDate: string, endDate: string) => {
    if (!endDate) return 0;
    
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const today = new Date().getTime();
    
    if (today <= start) return 0;
    if (today >= end) return 100;
    
    const total = end - start;
    const current = today - start;
    return Math.round((current / total) * 100);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Marketing Plans</h1>
        <p className="text-muted-foreground">
          View and track your marketing strategies and campaigns.
        </p>
      </div>

      <Tabs defaultValue="active" className="mt-6">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="active">Active Plans</TabsTrigger>
          <TabsTrigger value="completed">Completed Plans</TabsTrigger>
          <TabsTrigger value="all">All Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {renderPlans(
            marketingPlans?.filter((plan: any) => plan.status === 'active') || [], 
            isLoading,
            setSelectedPlan,
            setIsViewingDetails,
            renderStatusBadge,
            getDaysRemaining,
            calculateProgress
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {renderPlans(
            marketingPlans?.filter((plan: any) => plan.status === 'completed') || [], 
            isLoading,
            setSelectedPlan,
            setIsViewingDetails,
            renderStatusBadge,
            getDaysRemaining,
            calculateProgress
          )}
        </TabsContent>
        
        <TabsContent value="all">
          {renderPlans(
            marketingPlans || [], 
            isLoading,
            setSelectedPlan,
            setIsViewingDetails,
            renderStatusBadge,
            getDaysRemaining,
            calculateProgress
          )}
        </TabsContent>
      </Tabs>
      
      {/* Marketing Plan Details Dialog */}
      <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Marketing Plan Details</DialogTitle>
            <DialogDescription>
              Detailed information about your marketing strategy and results.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedPlan.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>
                        {format(new Date(selectedPlan.startDate), 'MMM d, yyyy')} - 
                        {selectedPlan.endDate ? format(new Date(selectedPlan.endDate), 'MMM d, yyyy') : 'Ongoing'}
                      </span>
                    </div>
                    <div>{renderStatusBadge(selectedPlan.status)}</div>
                  </div>
                </div>
                <div>
                  {selectedPlan.budget && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Budget: </span>
                      <span className="font-medium">${parseFloat(selectedPlan.budget).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
              </div>
              
              {/* Plan Details Accordion */}
              <Accordion type="single" collapsible defaultValue="services">
                {/* Services */}
                <AccordionItem value="services">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Megaphone className="h-4 w-4 mr-2" />
                      Marketing Services
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {selectedPlan.services?.map((service: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-background rounded-md border">
                          <Check className="h-4 w-4 text-primary" />
                          <span>{service}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Goals */}
                <AccordionItem value="goals">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Campaign Goals
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {selectedPlan.goals ? (
                      <div className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Goal</TableHead>
                              <TableHead>Target</TableHead>
                              <TableHead>Timeline</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(selectedPlan.goals).map(([key, value]: [string, any]) => (
                              <TableRow key={key}>
                                <TableCell className="font-medium">{key}</TableCell>
                                <TableCell>{value.target}</TableCell>
                                <TableCell>{value.timeline || 'End of campaign'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No specific goals have been set for this campaign.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
                
                {/* Results */}
                <AccordionItem value="results">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Campaign Results
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {selectedPlan.results ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium mb-3">Performance vs. Targets</h4>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsBarChart
                                data={performanceData}
                                margin={{
                                  top: 5,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
                                <XAxis dataKey="month" stroke={isDark ? "#aaa" : "#666"} />
                                <YAxis stroke={isDark ? "#aaa" : "#666"} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: isDark ? "#1f2937" : "#fff",
                                    borderColor: isDark ? "#374151" : "#e5e7eb",
                                    color: isDark ? "#fff" : "#000"
                                  }} 
                                />
                                <Legend />
                                <Bar dataKey="actual" name="Actual" fill="#3B82F6" />
                                <Bar dataKey="target" name="Target" fill="#8B5CF6" />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-3">Traffic Sources</h4>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={trafficSourceData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {trafficSourceData.map((entry, index) => (
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
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Results will be available as your campaign progresses.</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewingDetails(false)}>Close</Button>
            <Button>Download Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to render marketing plans
function renderPlans(
  plans: any[], 
  isLoading: boolean,
  setSelectedPlan: (plan: any) => void,
  setIsViewingDetails: (isViewing: boolean) => void,
  renderStatusBadge: (status: string) => JSX.Element,
  getDaysRemaining: (endDate: string) => string,
  calculateProgress: (startDate: string, endDate: string) => number
) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Marketing Plans Found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            You don't have any marketing plans in this category. Contact your account manager to set up a marketing strategy.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle>{plan.name}</CardTitle>
              {renderStatusBadge(plan.status)}
            </div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {format(new Date(plan.startDate), 'MMM d, yyyy')} - 
                  {plan.endDate ? format(new Date(plan.endDate), 'MMM d, yyyy') : 'Ongoing'}
                </span>
              </div>
              
              {plan.services && (
                <div className="flex flex-wrap gap-2">
                  {plan.services.slice(0, 3).map((service: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-primary/5">
                      {service}
                    </Badge>
                  ))}
                  {plan.services.length > 3 && (
                    <Badge variant="outline" className="bg-primary/5">
                      +{plan.services.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              
              {plan.endDate && plan.status === 'active' && (
                <div>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{getDaysRemaining(plan.endDate)}</span>
                  </div>
                  <Progress value={calculateProgress(plan.startDate, plan.endDate)} className="h-2" />
                </div>
              )}
              
              {plan.budget && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Budget: </span>
                  <span className="font-medium">${parseFloat(plan.budget).toLocaleString()}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="default" 
              onClick={() => {
                setSelectedPlan(plan);
                setIsViewingDetails(true);
              }}
              className="w-full"
            >
              View Details
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
