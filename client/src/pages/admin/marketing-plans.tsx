import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { generateMarketingPlanPDF, downloadMarketingPlan, shareMarketingPlan } from '@/lib/marketingPlanGenerator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUpload } from '@/components/ui/file-upload';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Plus, 
  FileText, 
  Download, 
  Share,
  Target,
  TrendingUp,
  Calendar,
  Users,
  Search,
  Filter,
  ChevronRight,
  Sparkles,
  Megaphone,
  Building,
  BarChart,
  Hash,
  MessageSquare,
  Mail,
  Clipboard,
  CheckCircle,
  Eye,
  Trash,
  AlertTriangle,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  Lightbulb,
  Info,
  HeartPulse,
  MousePointerClick,
  CheckSquare,
  PlayCircle,
  Pencil,
  Save,
  X,
  LineChart,
  CalendarDays,
  DollarSign,
  Layers
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Plan generation form schema
const planGenerationSchema = z.object({
  userId: z.string().min(1, { message: "Client is required" }),
  businessType: z.string().min(1, { message: "Business type is required" }),
  goalsPrimary: z.string().min(1, { message: "Primary goal is required" }),
  audience: z.string().min(1, { message: "Target audience is required" }),
  budget: z.string().min(1, { message: "Budget range is required" }),
  timeline: z.string().min(1, { message: "Timeline is required" }),
  competitors: z.string().optional(),
  additionalInfo: z.string().optional(),
  includeSocialMedia: z.boolean().default(true),
  includeContentMarketing: z.boolean().default(true),
  includeSEO: z.boolean().default(true),
  includeEmailMarketing: z.boolean().default(false),
  includePaidAdvertising: z.boolean().default(false),
});

// Mock data for business types
const businessTypes = [
  "Local Retail Store",
  "E-commerce Business", 
  "Restaurant/Food Service", 
  "Professional Service", 
  "Healthcare Provider",
  "Travel/Tourism Business",
  "Real Estate",
  "Educational Institution",
  "Non-profit Organization",
  "Software/Tech Company",
  "Other"
];

// Mock data for primary marketing goals
const marketingGoals = [
  "Increase Brand Awareness",
  "Generate More Leads", 
  "Boost Online Sales", 
  "Improve Customer Retention", 
  "Launch New Product/Service",
  "Expand to New Market",
  "Increase Website Traffic",
  "Establish Industry Authority",
  "Improve Social Media Presence",
  "Other"
];

// Mock data for target audiences
const targetAudiences = [
  "Local Community",
  "Young Professionals", 
  "Families", 
  "Business Professionals", 
  "Students",
  "Retirees/Seniors",
  "High-Income Individuals",
  "Small to Medium Businesses",
  "Enterprise Organizations",
  "Other"
];

// Mock data for budget ranges
const budgetRanges = [
  "$1,000 - $5,000",
  "$5,000 - $10,000", 
  "$10,000 - $25,000", 
  "$25,000 - $50,000", 
  "$50,000 - $100,000",
  "$100,000+"
];

// Mock data for timeline options
const timelineOptions = [
  "1-3 months (Short-term campaign)",
  "3-6 months (Mid-term strategy)", 
  "6-12 months (Long-term plan)", 
  "12+ months (Comprehensive growth plan)"
];

export default function AdminMarketingPlans() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isViewingPlan, setIsViewingPlan] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<any>(null);
  const [strategiesEditMode, setStrategiesEditMode] = useState(false);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [deletingPdf, setDeletingPdf] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch all marketing plans
  const { data: marketingPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['/api/marketing-plans'],
  });
  
  // Fetch all clients
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/users/clients'],
  });
  
  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest('PATCH', `/api/marketing-plans/${id}/status`, { status });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update plan status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-plans'] });
      toast({
        title: "Status Updated",
        description: "The marketing plan status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  });
  
  // Share plan mutation
  const sharePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      setIsSharing(true);
      const response = await apiRequest('POST', `/api/marketing-plans/${id}/share`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to share marketing plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-plans'] });
      toast({
        title: "Plan Shared",
        description: "Marketing plan has been shared with the client",
      });
      setIsSharing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to share marketing plan",
        variant: "destructive",
      });
      setIsSharing(false);
    }
  });
  
  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/marketing-plans/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete marketing plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-plans'] });
      setIsDeleting(false);
      setPlanToDelete(null);
      toast({
        title: "Plan Deleted",
        description: "Marketing plan has been permanently deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete marketing plan",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  });

  // Upload PDF mutation
  const uploadPdfMutation = useMutation({
    mutationFn: async ({ id, file }: { id: number, file: File }) => {
      setUploadingPdf(true);
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await fetch(`/api/marketing-plans/${id}/pdf`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload PDF');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/admin_barecloudz_1/documents'] });
      setUploadingPdf(false);
      setSelectedPdf(null);
      setSelectedPlan(data); // Update selected plan with new PDF info
      toast({
        title: "PDF Uploaded",
        description: "The PDF has been uploaded and linked to this marketing plan.",
      });
    },
    onError: (error: any) => {
      setUploadingPdf(false);
      toast({
        title: "Error",
        description: error.message || "Failed to upload PDF",
        variant: "destructive",
      });
    }
  });
  
  // Delete PDF mutation
  const deletePdfMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeletingPdf(true);
      const response = await apiRequest('DELETE', `/api/marketing-plans/${id}/pdf`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete PDF');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/admin_barecloudz_1/documents'] });
      setDeletingPdf(false);
      setSelectedPlan(data); // Update selected plan with PDF info removed
      toast({
        title: "PDF Deleted",
        description: "The PDF has been removed from this marketing plan.",
      });
    },
    onError: (error: any) => {
      setDeletingPdf(false);
      toast({
        title: "Error",
        description: error.message || "Failed to delete PDF",
        variant: "destructive",
      });
    }
  });
  
  // Get client name for selected plan
  const getClientName = (clientId: string) => {
    const client = clients?.find((c: any) => c.id === clientId);
    return client ? `${client.firstName || ''} ${client.lastName || ''}` : 'Unknown Client';
  };

  // Handler functions for buttons
  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };
  
  const handleShareWithClient = (plan: any) => {
    sharePlanMutation.mutate(plan.id);
  };
  
  // View marketing plan and parse strategies
  const handleViewPlan = (plan: any) => {
    setSelectedPlan(plan);
    setIsViewingPlan(true);
    setEditedNotes(plan.additionalInfo || '');
    
    // Parse the content or use default strategies
    try {
      if (plan.content) {
        const parsedContent = JSON.parse(plan.content);
        if (parsedContent && Array.isArray(parsedContent.strategies)) {
          setStrategies(parsedContent.strategies);
          return;
        }
      }
    } catch (error) {
      console.error("Error parsing plan content:", error);
    }
    
    // Fallback to default strategies based on plan options
    const defaultStrategies = [];
    
    if (plan.includeSocialMedia) {
      defaultStrategies.push({
        type: "social",
        title: "Social Media Engagement and Growth",
        description: "Build and maintain a strong social media presence across platforms where your target audience is most active.",
        tasks: ["Create platform-specific content calendars", "Develop engaging multimedia content", "Implement community management strategy", "Run targeted ad campaigns"],
        timeline: "Ongoing, with quarterly strategy reviews",
        metrics: ["Follower growth rate", "Engagement rates", "Click-through rates", "Conversion from social"]
      });
    }
    
    if (plan.includeContentMarketing) {
      defaultStrategies.push({
        type: "content",
        title: "Content Marketing and SEO Enhancement",
        description: "Develop high-quality, relevant content that attracts, engages, and converts your target audience while improving search rankings.",
        tasks: ["Conduct keyword research", "Create SEO-optimized website content", "Develop a blog content strategy", "Produce lead-generating assets"],
        timeline: "2-4 months initial implementation, then ongoing maintenance",
        metrics: ["Organic search traffic growth", "Keyword rankings", "Content engagement", "Lead generation"]
      });
    }
    
    if (plan.includeEmailMarketing) {
      defaultStrategies.push({
        type: "email",
        title: "Email and SMS Campaigns",
        description: "Build relationships with prospects and customers through personalized, targeted email and SMS marketing campaigns.",
        tasks: ["Create segmented email lists", "Design email templates", "Develop automated workflows", "Craft conversion-focused messaging"],
        timeline: "1-2 months setup, then ongoing campaigns",
        metrics: ["Open rates", "Click-through rates", "Conversion rates", "Revenue attribution"]
      });
    }
    
    if (plan.includePaidAdvertising) {
      defaultStrategies.push({
        type: "paid",
        title: "Targeted Paid Media Campaigns",
        description: "Implement strategic paid advertising campaigns across digital channels to reach ideal customers with tailored messaging.",
        tasks: ["Identify top-performing channels", "Create compelling ad creative", "Set up conversion tracking", "Develop retargeting strategy"],
        timeline: "2-3 months initial testing, then scale successful channels",
        metrics: ["Return on ad spend (ROAS)", "Cost per acquisition", "Conversion rates", "Attribution by channel"]
      });
    }
    
    if (plan.includeSEO) {
      defaultStrategies.push({
        type: "seo",
        title: "SEO Optimization Strategy",
        description: "Enhance your online visibility through technical SEO improvements, on-page optimization, and content strategy.",
        tasks: ["Conduct technical SEO audit", "Optimize website structure and speed", "Implement local SEO tactics", "Build quality backlinks"],
        timeline: "3-6 months for initial results, ongoing maintenance",
        metrics: ["Organic traffic growth", "Page 1 keyword rankings", "Domain authority improvement", "Conversion from organic traffic"]
      });
    }
    
    setStrategies(defaultStrategies);
  };
  
  // Strategy editing functions
  const handleUpdateStrategy = (index: number, field: string, value: any) => {
    const newStrategies = [...strategies];
    newStrategies[index] = {
      ...newStrategies[index],
      [field]: value
    };
    setStrategies(newStrategies);
  };
  
  const handleUpdateStrategyTask = (strategyIndex: number, taskIndex: number, value: string) => {
    const newStrategies = [...strategies];
    if (newStrategies[strategyIndex].tasks && Array.isArray(newStrategies[strategyIndex].tasks)) {
      newStrategies[strategyIndex].tasks[taskIndex] = value;
      setStrategies(newStrategies);
    }
  };
  
  const handleUpdateStrategyMetric = (strategyIndex: number, metricIndex: number, value: string) => {
    const newStrategies = [...strategies];
    if (newStrategies[strategyIndex].metrics && Array.isArray(newStrategies[strategyIndex].metrics)) {
      newStrategies[strategyIndex].metrics[metricIndex] = value;
      setStrategies(newStrategies);
    }
  };
  
  const handleAddTask = (strategyIndex: number) => {
    const newStrategies = [...strategies];
    if (!newStrategies[strategyIndex].tasks || !Array.isArray(newStrategies[strategyIndex].tasks)) {
      newStrategies[strategyIndex].tasks = [];
    }
    newStrategies[strategyIndex].tasks.push("New task");
    setStrategies(newStrategies);
  };
  
  const handleRemoveTask = (strategyIndex: number, taskIndex: number) => {
    const newStrategies = [...strategies];
    if (newStrategies[strategyIndex].tasks && Array.isArray(newStrategies[strategyIndex].tasks)) {
      newStrategies[strategyIndex].tasks = newStrategies[strategyIndex].tasks.filter((_, i) => i !== taskIndex);
      setStrategies(newStrategies);
    }
  };
  
  const handleAddMetric = (strategyIndex: number) => {
    const newStrategies = [...strategies];
    if (!newStrategies[strategyIndex].metrics || !Array.isArray(newStrategies[strategyIndex].metrics)) {
      newStrategies[strategyIndex].metrics = [];
    }
    newStrategies[strategyIndex].metrics.push("New success metric");
    setStrategies(newStrategies);
  };
  
  const handleRemoveMetric = (strategyIndex: number, metricIndex: number) => {
    const newStrategies = [...strategies];
    if (newStrategies[strategyIndex].metrics && Array.isArray(newStrategies[strategyIndex].metrics)) {
      newStrategies[strategyIndex].metrics = newStrategies[strategyIndex].metrics.filter((_, i) => i !== metricIndex);
      setStrategies(newStrategies);
    }
  };
  
  const handleAddStrategy = () => {
    setStrategies([
      ...strategies, 
      {
        type: "social",
        title: "New Strategy",
        description: "Description of the new strategy",
        tasks: ["Add tasks here"],
        timeline: "Timeline for implementation",
        metrics: ["Success metrics"]
      }
    ]);
  };
  
  const handleRemoveStrategy = (index: number) => {
    setStrategies(strategies.filter((_, i) => i !== index));
  };
  
  const handleEditStrategy = (index: number) => {
    setStrategiesEditMode(true);
  };
  
  const handleSaveStrategies = async () => {
    if (!selectedPlan || !selectedPlan.id) return;
    
    try {
      // Create updated content with strategies
      const updatedContent = JSON.stringify({ strategies });
      
      const response = await apiRequest('PATCH', `/api/marketing-plans/${selectedPlan.id}`, {
        content: updatedContent
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save strategies');
      }
      
      // Update the local plan data
      setSelectedPlan({
        ...selectedPlan,
        content: updatedContent
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-plans'] });
      
      toast({
        title: "Success",
        description: "Marketing plan strategies saved successfully",
      });
      
      setStrategiesEditMode(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save strategies",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveNotes = async () => {
    if (!selectedPlan || !selectedPlan.id) return;
    
    try {
      const response = await apiRequest('PATCH', `/api/marketing-plans/${selectedPlan.id}`, {
        additionalInfo: editedNotes
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save notes');
      }
      
      // Update the local plan data
      setSelectedPlan({
        ...selectedPlan,
        additionalInfo: editedNotes
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-plans'] });
      
      toast({
        title: "Success",
        description: "Notes saved successfully",
      });
      
      setEditingNotes(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save notes",
        variant: "destructive",
      });
    }
  };
  
  const handleDownloadPDF = async (plan: any) => {
    try {
      // Get client details
      const client = clients?.find((c: any) => c.id === plan.userId);
      
      if (!client) {
        toast({
          title: "Error",
          description: "Could not find client details",
          variant: "destructive",
        });
        return;
      }
      
      // Generate PDF
      const updatedPlan = {
        ...plan,
        strategies: strategies
      };
      
      const pdfBlob = generateMarketingPlanPDF({ plan: updatedPlan, client });
      
      // Download the PDF
      downloadMarketingPlan(pdfBlob, `marketing-plan-${plan.id}.pdf`);
      
      toast({
        title: "Success",
        description: "Marketing plan PDF has been downloaded",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download PDF",
        variant: "destructive",
      });
    }
  };
  
  // Create marketing plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      setIsGeneratingPlan(true);
      
      // Simulate AI plan generation with a delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const response = await apiRequest('POST', '/api/marketing-plans', planData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create marketing plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-plans'] });
      toast({
        title: "Success",
        description: "Marketing plan generated successfully",
        variant: "default",
      });
      setIsCreatingPlan(false);
      setIsGeneratingPlan(false);
    },
    onError: (error: any) => {
      console.error('Error creating marketing plan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate marketing plan",
        variant: "destructive",
      });
      setIsGeneratingPlan(false);
    },
  });
  
  // Form for creating a marketing plan
  const form = useForm<z.infer<typeof planGenerationSchema>>({
    resolver: zodResolver(planGenerationSchema),
    defaultValues: {
      userId: "",
      businessType: "",
      goalsPrimary: "",
      audience: "",
      budget: "",
      timeline: "",
      competitors: "",
      additionalInfo: "",
      includeSocialMedia: true,
      includeContentMarketing: true,
      includeSEO: true,
      includeEmailMarketing: false,
      includePaidAdvertising: false,
    },
  });
  
  // Filter marketing plans based on search query and active tab
  const filteredPlans = marketingPlans?.filter((plan: any) => {
    // Filter by tab (status)
    if (activeTab !== 'all' && plan.status !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const client = clients?.find((c: any) => c.id === plan.userId);
      const clientName = client 
        ? `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase() 
        : '';
      const clientEmail = client?.email?.toLowerCase() || '';
      
      return (
        plan.title.toLowerCase().includes(query) ||
        clientName.includes(query) ||
        clientEmail.includes(query)
      );
    }
    
    // Filter by selected client
    if (selectedClient && selectedClient !== 'all' && plan.userId !== selectedClient) {
      return false;
    }
    
    return true;
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof planGenerationSchema>) => {
    // Get selected client details for plan title
    const client = clients?.find((c: any) => c.id === data.userId);
    const clientName = client 
      ? `${client.firstName || ''} ${client.lastName || ''}` 
      : 'Client';
    
    // Create plan data
    const planData = {
      ...data,
      title: `Marketing Plan for ${clientName} - ${data.businessType}`,
      status: 'draft',
      strategies: [],
    };
    
    // Generate strategies based on selected options
    if (data.includeSocialMedia) {
      planData.strategies.push({
        type: 'social_media',
        title: 'Social Media Marketing',
        description: 'Strategic use of social media platforms to connect with your audience, build your brand, drive website traffic, and increase sales.',
        tasks: [
          'Create engaging content calendars',
          'Develop platform-specific strategies',
          'Implement community engagement tactics',
          'Track and analyze performance metrics'
        ],
        timeline: '1-3 months',
        metrics: ['Engagement rate', 'Follower growth', 'Click-through rate', 'Conversion rate']
      });
    }
    
    if (data.includeContentMarketing) {
      planData.strategies.push({
        type: 'content_marketing',
        title: 'Content Marketing',
        description: 'Creation and distribution of valuable, relevant content to attract and retain a clearly-defined audience and drive profitable customer action.',
        tasks: [
          'Develop content strategy aligned with business goals',
          'Create high-quality blog posts, articles, and resources',
          'Distribute content through appropriate channels',
          'Optimize content for search engines and conversions'
        ],
        timeline: '3-6 months',
        metrics: ['Traffic', 'Time on page', 'Lead generation', 'Content shares']
      });
    }
    
    if (data.includeSEO) {
      planData.strategies.push({
        type: 'seo',
        title: 'Search Engine Optimization',
        description: 'Improving your website\'s visibility in search engine results pages to increase organic traffic and reach potential customers.',
        tasks: [
          'Conduct keyword research and competitive analysis',
          'Optimize on-page elements including meta tags and content',
          'Improve technical SEO factors like page speed and structure',
          'Build high-quality backlinks from reputable sources'
        ],
        timeline: '6-12 months',
        metrics: ['Organic traffic', 'Keyword rankings', 'Backlink quality/quantity', 'Conversion rate']
      });
    }
    
    if (data.includeEmailMarketing) {
      planData.strategies.push({
        type: 'email_marketing',
        title: 'Email Marketing',
        description: 'Direct marketing strategy using email to promote products or services while building relationships with potential and existing customers.',
        tasks: [
          'Build and segment email lists',
          'Create engaging email campaigns',
          'Implement automated email sequences',
          'Test and optimize email performance'
        ],
        timeline: '1-3 months',
        metrics: ['Open rate', 'Click-through rate', 'Conversion rate', 'List growth rate']
      });
    }
    
    if (data.includePaidAdvertising) {
      planData.strategies.push({
        type: 'paid_advertising',
        title: 'Paid Advertising',
        description: 'Strategic placement of ads on various platforms to increase brand visibility, drive traffic, and generate leads or sales.',
        tasks: [
          'Develop targeted ad campaigns',
          'Create compelling ad creative and copy',
          'Implement conversion tracking',
          'Continuously optimize ad performance'
        ],
        timeline: '1-6 months',
        metrics: ['Click-through rate', 'Cost per click', 'Conversion rate', 'Return on ad spend']
      });
    }
    
    createPlanMutation.mutate(planData);
  };
  
  // Function to render plan status badge
  function PlanStatusBadge({ status }: { status: string }) {
    const getStatusColor = () => {
      switch (status) {
        case 'active':
          return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
        case 'draft':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
        case 'completed':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      }
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Marketing Plans</h1>
            <p className="text-muted-foreground">Create and manage client marketing strategies.</p>
          </div>
          
          <Button onClick={() => setIsCreatingPlan(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute top-0 bottom-0 w-5 h-5 my-auto left-3 text-muted-foreground" />
            <Input
              placeholder="Search plans..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-[220px]">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{selectedClient ? 'Client Filter' : 'All Clients'}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients?.map((client: any) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Plans</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Marketing Plans</CardTitle>
          <CardDescription>Manage and track all client marketing plans.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPlans || isLoadingClients ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            filteredPlans?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Business Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan: any) => {
                    const client = clients?.find((c: any) => c.id === plan.userId);
                    
                    return (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.title}</TableCell>
                        <TableCell>
                          {client ? (
                            <div>
                              <div>{client.firstName} {client.lastName}</div>
                              <div className="text-sm text-muted-foreground">{client.email}</div>
                            </div>
                          ) : (
                            'Unknown Client'
                          )}
                        </TableCell>
                        <TableCell>{plan.businessType}</TableCell>
                        <TableCell>{new Date(plan.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <PlanStatusBadge status={plan.status} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => {
                                setSelectedPlan(plan);
                                setIsViewingPlan(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Plan
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadPDF(plan)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShareWithClient(plan)}>
                                <Share className="mr-2 h-4 w-4" />
                                Share with Client
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(plan.id, 'draft')}>
                                <Badge variant="outline" className="border-yellow-500 text-yellow-500 mr-2">
                                  Draft
                                </Badge>
                                Set as Draft
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(plan.id, 'active')}>
                                <Badge variant="outline" className="border-green-500 text-green-500 mr-2">
                                  Active
                                </Badge>
                                Set as Active
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(plan.id, 'completed')}>
                                <Badge variant="outline" className="border-blue-500 text-blue-500 mr-2">
                                  Completed
                                </Badge>
                                Mark Completed
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setPlanToDelete(plan);
                                  setIsDeleting(true);
                                }}
                                className="text-red-500"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Plan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No marketing plans found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchQuery || selectedClient ? 
                    "Try adjusting your search filters" : 
                    "Create a new marketing plan to get started"}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsCreatingPlan(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Plan
                </Button>
              </div>
            )
          )}
        </CardContent>
      </Card>
      
      {/* View Marketing Plan Dialog */}
      <Dialog open={isViewingPlan} onOpenChange={setIsViewingPlan}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedPlan && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedPlan.title}</DialogTitle>
                  <PlanStatusBadge status={selectedPlan.status} />
                </div>
                <DialogDescription>
                  Created on {new Date(selectedPlan.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Business Type</h3>
                  <p className="text-sm">{selectedPlan.businessType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Primary Goal</h3>
                  <p className="text-sm">{selectedPlan.goalsPrimary}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Target Audience</h3>
                  <p className="text-sm">{selectedPlan.audience}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Budget Range</h3>
                  <p className="text-sm">{selectedPlan.budget}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Timeline</h3>
                  <p className="text-sm">{selectedPlan.timeline}</p>
                </div>
              </div>
              
              {/* PDF Upload Section */}
              <div className="mb-6 p-4 border rounded-lg bg-card">
                <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" /> 
                  Marketing Plan PDF
                </h3>
                
                {selectedPlan.pdfUrl ? (
                  <div className="border rounded-lg p-4 mb-4 bg-background">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium truncate max-w-[300px]">
                            {selectedPlan.pdfName || 'Marketing Plan.pdf'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF Document
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(selectedPlan.pdfUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deletePdfMutation.mutate(selectedPlan.id)}
                          disabled={deletingPdf}
                        >
                          {deletingPdf ? (
                            <>
                              <span className="animate-spin mr-1">◌</span> Deleting...
                            </>
                          ) : (
                            <>
                              <Trash className="h-4 w-4 mr-1" /> Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <FileUpload
                      onFileSelect={(file) => setSelectedPdf(file)}
                      onFileRemove={() => setSelectedPdf(null)}
                      selectedFile={selectedPdf}
                      accept=".pdf"
                      maxSize={10}
                      buttonText="Upload PDF Document"
                    />
                    
                    {selectedPdf && (
                      <div className="mt-2 flex justify-end">
                        <Button 
                          onClick={() => uploadPdfMutation.mutate({ 
                            id: selectedPlan.id, 
                            file: selectedPdf 
                          })}
                          disabled={uploadingPdf}
                        >
                          {uploadingPdf ? (
                            <>
                              <span className="animate-spin mr-1">◌</span> Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-1" /> Upload PDF
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <p>Upload a PDF document for this marketing plan. The PDF will be available to both admin and client users, and will also appear in the client's documents section.</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Marketing Strategies</h3>
                <div className="space-y-4">
                  {selectedPlan.strategies.map((strategy: any, index: number) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center">
                          {strategy.type === 'social_media' && <Hash className="h-5 w-5 text-blue-500 mr-2" />}
                          {strategy.type === 'content_marketing' && <FileText className="h-5 w-5 text-purple-500 mr-2" />}
                          {strategy.type === 'seo' && <BarChart className="h-5 w-5 text-green-500 mr-2" />}
                          {strategy.type === 'email_marketing' && <Mail className="h-5 w-5 text-yellow-500 mr-2" />}
                          {strategy.type === 'paid_advertising' && <Megaphone className="h-5 w-5 text-red-500 mr-2" />}
                          <CardTitle className="text-md">{strategy.title}</CardTitle>
                        </div>
                        <CardDescription>{strategy.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Key Tasks</h4>
                            <ul className="space-y-1">
                              {strategy.tasks && Array.isArray(strategy.tasks) ? (
                                strategy.tasks.map((task: string, i: number) => (
                                  <li key={i} className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                                    <span className="text-sm">{task}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="flex items-start">
                                  <Info className="h-4 w-4 text-primary mr-2 mt-0.5" />
                                  <span className="text-sm">No tasks defined</span>
                                </li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2">Success Metrics</h4>
                            <ul className="space-y-1">
                              {strategy.metrics && Array.isArray(strategy.metrics) ? (
                                strategy.metrics.map((metric: string, i: number) => (
                                  <li key={i} className="flex items-start">
                                    <Target className="h-4 w-4 text-primary mr-2 mt-0.5" />
                                    <span className="text-sm">{metric}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="flex items-start">
                                  <Info className="h-4 w-4 text-primary mr-2 mt-0.5" />
                                  <span className="text-sm">No metrics defined</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            <Calendar className="mr-1 h-3 w-3" />
                            Timeline: {strategy.timeline}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {selectedPlan.additionalInfo && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Additional Notes</h3>
                  <p className="text-sm">{selectedPlan.additionalInfo}</p>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewingPlan(false)}>
                  Close
                </Button>
                <Button>
                  <Share className="mr-2 h-4 w-4" />
                  Share with Client
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this marketing plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {planToDelete && (
            <div className="border rounded-md p-3 my-2 bg-muted/50">
              <h4 className="font-medium">{planToDelete.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Created on {new Date(planToDelete.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleting(false);
                setPlanToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (planToDelete) {
                  deletePlanMutation.mutate(planToDelete.id);
                }
              }}
              disabled={deletePlanMutation.isPending}
            >
              {deletePlanMutation.isPending ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Plan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Marketing Plan Dialog */}
      <Dialog open={isCreatingPlan} onOpenChange={setIsCreatingPlan}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Marketing Plan</DialogTitle>
            <DialogDescription>
              Generate a customized marketing plan based on client needs.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients?.map((client: any) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.firstName} {client.lastName} ({client.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {businessTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="goalsPrimary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Marketing Goal</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {marketingGoals.map((goal) => (
                            <SelectItem key={goal} value={goal}>
                              {goal}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target audience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {targetAudiences.map((audience) => (
                            <SelectItem key={audience} value={audience}>
                              {audience}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Range</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {budgetRanges.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timelineOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="competitors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Competitors (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List major competitors, their strengths and weaknesses"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <h3 className="text-md font-medium mb-3">Marketing Strategies to Include</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="includeSocialMedia"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center">
                            <Hash className="h-4 w-4 text-blue-500 mr-2" />
                            Social Media
                          </FormLabel>
                          <FormDescription>
                            Strategic social media campaigns
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="includeContentMarketing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center">
                            <FileText className="h-4 w-4 text-purple-500 mr-2" />
                            Content Marketing
                          </FormLabel>
                          <FormDescription>
                            Blogs, articles and resources
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="includeSEO"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center">
                            <BarChart className="h-4 w-4 text-green-500 mr-2" />
                            SEO
                          </FormLabel>
                          <FormDescription>
                            Search engine optimization
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="includeEmailMarketing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center">
                            <Mail className="h-4 w-4 text-yellow-500 mr-2" />
                            Email Marketing
                          </FormLabel>
                          <FormDescription>
                            Targeted email campaigns
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="includePaidAdvertising"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center">
                            <Megaphone className="h-4 w-4 text-red-500 mr-2" />
                            Paid Advertising
                          </FormLabel>
                          <FormDescription>
                            PPC and display advertising
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific challenges, previous marketing efforts, or special requirements"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatingPlan(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isGeneratingPlan}>
                  {isGeneratingPlan ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Marketing Plan
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}