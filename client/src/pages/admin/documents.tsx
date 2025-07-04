import { useState } from 'react';
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import { Document, User } from '@shared/schema';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Upload, FileType, File, FileText, Trash2, Table as TableIcon, Image, Archive } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Document form schema
const documentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  fileUrl: z.string().url("Please provide a valid URL"),
  fileType: z.string().min(1, "Please select a file type"),
  category: z.string().min(1, "Please select a category"),
  userId: z.string().min(1, "Please select a client"),
});

export default function AdminDocuments() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  // Fetch documents
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Fetch clients for the dropdown
  const { data: clients = [] } = useQuery<User[]>({
    queryKey: ['/api/users/clients'],
  });

  // Form for uploading new documents
  const form = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      description: "",
      fileUrl: "",
      fileType: "pdf",
      category: "report",
      userId: "",
    },
  });

  // Create document mutation
  const createDocument = useMutation({
    mutationFn: async (values: z.infer<typeof documentSchema>) => {
      return await apiRequest('/api/documents', 'POST', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setOpen(false);
      form.reset();
      toast({
        title: "Document created",
        description: "The document has been successfully shared with the client.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error sharing the document. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating document:", error);
    },
  });

  // Delete document mutation
  const deleteDocument = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/documents/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error deleting the document. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting document:", error);
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const filteredDocuments = (documents as Document[]).filter((doc) => {
    // Filter by search term
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'report':
        return <Badge variant="default">Report</Badge>;
      case 'contract':
        return <Badge variant="outline">Contract</Badge>;
      case 'invoice':
        return <Badge variant="secondary">Invoice</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileType className="h-4 w-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <TableIcon className="h-4 w-4 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="h-4 w-4 text-purple-500" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-4 w-4 text-amber-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getClientName = (userId: string) => {
    const client = (clients as User[]).find((c) => c.id === userId);
    return client ? `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email : 'Unknown Client';
  };

  const onSubmit = (values: z.infer<typeof documentSchema>) => {
    createDocument.mutate(values);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client Documents</CardTitle>
            <CardDescription>
              Upload and manage documents and reports for your clients
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Share Document with Client</DialogTitle>
                <DialogDescription>
                  Upload a document to share with a client. The client will be notified when the document is available.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Q1 Marketing Report" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of the document's contents" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/file.pdf" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fileType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>File Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select file type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="docx">Word Document</SelectItem>
                              <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                              <SelectItem value="pptx">PowerPoint</SelectItem>
                              <SelectItem value="jpg">Image</SelectItem>
                              <SelectItem value="zip">Archive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="report">Report</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="invoice">Invoice</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="legal">Legal</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(clients as User[]).map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {`${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createDocument.isPending}>
                      {createDocument.isPending ? "Uploading..." : "Upload Document"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            <Select defaultValue="all" onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-md">
            <UITable>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No documents found. Upload a document to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc: any) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="font-medium">{doc.title}</div>
                        {doc.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {doc.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getFileTypeIcon(doc.fileType)}
                          <span className="ml-2">{doc.fileType.toUpperCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(doc.category)}</TableCell>
                      <TableCell>{getClientName(doc.userId)}</TableCell>
                      <TableCell>
                        {doc.isRead ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Read
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Unread
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <a 
                            href={doc.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this document?")) {
                                deleteDocument.mutate(doc.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </UITable>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}