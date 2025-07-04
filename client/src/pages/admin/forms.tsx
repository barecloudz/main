import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  Mail, 
  MailX, 
  AlertTriangle,
  Search,
  CheckCircle,
  Clock,
  MailWarning 
} from 'lucide-react';

export default function AdminForms() {
  const [viewingSubmission, setViewingSubmission] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch contact form submissions
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['/api/contacts'],
  });
  
  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/contacts/${id}/read`, {});
      return { id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Success",
        description: "Submission marked as read",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Error marking submission as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark submission as read",
        variant: "destructive",
      });
    },
  });
  
  // Mark as spam mutation
  const markAsSpamMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/contacts/${id}/spam`, {});
      return { id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Success",
        description: "Submission marked as spam",
        variant: "default",
      });
      if (isViewDialogOpen) {
        setIsViewDialogOpen(false);
      }
    },
    onError: (error) => {
      console.error('Error marking submission as spam:', error);
      toast({
        title: "Error",
        description: "Failed to mark submission as spam",
        variant: "destructive",
      });
    },
  });
  
  // Delete submission mutation
  const deleteSubmissionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/contacts/${id}`, {});
      return { id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Success",
        description: "Submission deleted successfully",
        variant: "default",
      });
      if (isViewDialogOpen) {
        setIsViewDialogOpen(false);
      }
    },
    onError: (error) => {
      console.error('Error deleting submission:', error);
      toast({
        title: "Error",
        description: "Failed to delete submission",
        variant: "destructive",
      });
    },
  });
  
  // Filter contacts based on active tab and search query
  const filteredContacts = contacts?.filter((contact: any) => {
    // First filter by tab
    if (activeTab === 'spam' && !contact.isSpam) return false;
    if (activeTab === 'unread' && (contact.isRead || contact.isSpam)) return false;
    if (activeTab === 'read' && (!contact.isRead || contact.isSpam)) return false;
    
    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.subject.toLowerCase().includes(query) ||
        (contact.company && contact.company.toLowerCase().includes(query)) ||
        contact.message.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Handle view submission
  const handleViewSubmission = (submission: any) => {
    setViewingSubmission(submission);
    setIsViewDialogOpen(true);
    
    // If it's unread, mark it as read
    if (!submission.isRead) {
      markAsReadMutation.mutate(submission.id);
    }
  };
  
  // Handle mark as spam
  const handleMarkAsSpam = (id: number) => {
    markAsSpamMutation.mutate(id);
  };
  
  // Handle delete submission
  const handleDeleteSubmission = (id: number) => {
    if (window.confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      deleteSubmissionMutation.mutate(id);
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Form Submissions</h1>
            <p className="text-muted-foreground">View and manage contact form submissions.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-auto"
              icon={Search}
            />
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
          <TabsTrigger value="spam">Spam</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <SubmissionsTable 
            submissions={filteredContacts} 
            isLoading={isLoading} 
            onView={handleViewSubmission}
            onMarkAsSpam={handleMarkAsSpam}
            onDelete={handleDeleteSubmission}
          />
        </TabsContent>
        
        <TabsContent value="unread">
          <SubmissionsTable 
            submissions={filteredContacts} 
            isLoading={isLoading} 
            onView={handleViewSubmission}
            onMarkAsSpam={handleMarkAsSpam}
            onDelete={handleDeleteSubmission}
          />
        </TabsContent>
        
        <TabsContent value="read">
          <SubmissionsTable 
            submissions={filteredContacts} 
            isLoading={isLoading} 
            onView={handleViewSubmission}
            onMarkAsSpam={handleMarkAsSpam}
            onDelete={handleDeleteSubmission}
          />
        </TabsContent>
        
        <TabsContent value="spam">
          <SubmissionsTable 
            submissions={filteredContacts} 
            isLoading={isLoading} 
            onView={handleViewSubmission}
            onMarkAsSpam={handleMarkAsSpam}
            onDelete={handleDeleteSubmission}
          />
        </TabsContent>
      </Tabs>
      
      {/* View Submission Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Form Submission</DialogTitle>
            <DialogDescription>
              View the details of this contact form submission.
            </DialogDescription>
          </DialogHeader>
          
          {viewingSubmission && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{viewingSubmission.name}</h3>
                  <p className="text-muted-foreground">{viewingSubmission.email}</p>
                </div>
                <Badge variant={viewingSubmission.isSpam ? "destructive" : (viewingSubmission.isRead ? "secondary" : "default")}>
                  {viewingSubmission.isSpam ? "Spam" : (viewingSubmission.isRead ? "Read" : "New")}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Subject:</p>
                  <p className="font-medium">{viewingSubmission.subject}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Company:</p>
                  <p className="font-medium">{viewingSubmission.company || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Message:</p>
                <div className="p-4 rounded-md bg-muted/50 whitespace-pre-wrap">
                  {viewingSubmission.message}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Submitted on {new Date(viewingSubmission.createdAt).toLocaleString()}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-wrap gap-2">
            <Button 
              variant="destructive" 
              onClick={() => viewingSubmission && handleMarkAsSpam(viewingSubmission.id)}
              disabled={viewingSubmission?.isSpam}
            >
              <MailX className="mr-2 h-4 w-4" />
              Mark as Spam
            </Button>
            <Button 
              onClick={() => {
                window.location.href = `mailto:${viewingSubmission?.email}?subject=RE: ${viewingSubmission?.subject}`;
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Reply
            </Button>
            <Button 
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (viewingSubmission) {
                  setIsViewDialogOpen(false);
                  handleDeleteSubmission(viewingSubmission.id);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Submissions table component
function SubmissionsTable({ 
  submissions, 
  isLoading, 
  onView,
  onMarkAsSpam,
  onDelete
}: { 
  submissions: any[]; 
  isLoading: boolean; 
  onView: (submission: any) => void;
  onMarkAsSpam: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-40 p-6">
          <MailWarning className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl font-medium">No submissions found</p>
          <p className="text-muted-foreground">
            {submissions ? 'No matching submissions for the selected filters.' : 'There are no contact form submissions yet.'}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name / Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id} className={submission.isSpam ? 'opacity-70' : ''}>
                <TableCell>
                  <div className="font-medium">{submission.name}</div>
                  <div className="text-sm text-muted-foreground">{submission.email}</div>
                </TableCell>
                <TableCell>{submission.subject}</TableCell>
                <TableCell>
                  {new Date(submission.createdAt).toLocaleDateString()}{' '}
                  <span className="text-muted-foreground">
                    {new Date(submission.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {submission.isSpam ? (
                      <Badge variant="destructive" className="flex items-center">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Spam
                      </Badge>
                    ) : submission.isRead ? (
                      <Badge variant="secondary" className="flex items-center">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Read
                      </Badge>
                    ) : (
                      <Badge variant="default" className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        New
                      </Badge>
                    )}
                  </div>
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
                      <DropdownMenuItem onClick={() => onView(submission)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = `mailto:${submission.email}?subject=RE: ${submission.subject}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Reply
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onMarkAsSpam(submission.id)}
                        disabled={submission.isSpam}
                        className={submission.isSpam ? 'text-muted-foreground' : 'text-destructive'}
                      >
                        <MailX className="mr-2 h-4 w-4" />
                        Mark as Spam
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(submission.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
