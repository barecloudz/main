import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { generateInvoicePDF, downloadInvoice } from '@/lib/invoiceGenerator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Plus, 
  Download, 
  Eye, 
  Send, 
  FileText,
  CreditCard,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Trash2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusColor = () => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    }
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Invoice create form schema
const invoiceFormSchema = z.object({
  userId: z.string().min(1, { message: "Client is required" }),
  invoiceNumber: z.string().min(1, { message: "Invoice number is required" }),
  amount: z.string().min(1, { message: "Amount is required" }).refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 
    { message: "Amount must be a positive number" }
  ),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  items: z.array(z.object({
    description: z.string().min(1, { message: "Description is required" }),
    quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
    unitPrice: z.number().min(0.01, { message: "Unit price must be greater than 0" }),
    amount: z.number().min(0.01, { message: "Amount must be greater than 0" }),
  })).min(1, { message: "At least one item is required" }),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function AdminInvoices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isViewingInvoice, setIsViewingInvoice] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch all invoices
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['/api/invoices'],
  });
  
  // Fetch all clients for creating invoices
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/users/clients'],
  });
  
  // Update invoice status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/invoices/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Success",
        description: "Invoice status updated successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Error updating invoice status:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      });
    },
  });
  
  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await apiRequest('POST', '/api/invoices', invoiceData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create invoice');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
        variant: "default",
      });
      setIsCreatingInvoice(false);
    },
    onError: (error: any) => {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });
  
  // Function to handle downloading invoice PDF
  const handleDownloadInvoice = (invoice: any) => {
    // Find the client for this invoice
    const client = clients?.find((c: any) => c.id === invoice.userId);
    
    if (!client) {
      toast({
        title: "Error",
        description: "Client not found for this invoice",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const invoiceBlob = generateInvoicePDF({ invoice, client });
      downloadInvoice(invoiceBlob, `invoice-${invoice.invoiceNumber}.pdf`);
      
      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice PDF",
        variant: "destructive",
      });
    }
  };
  
  // Handle updating invoice status
  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };
  
  // Filter invoices based on search query and status filter
  const filteredInvoices = invoices?.filter((invoice: any) => {
    // Filter by status
    if (statusFilter !== 'all' && invoice.status !== statusFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const client = clients?.find((c: any) => c.id === invoice.userId);
      const clientName = client 
        ? `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase() 
        : '';
      const clientEmail = client?.email?.toLowerCase() || '';
      
      return (
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        clientName.includes(query) ||
        clientEmail.includes(query)
      );
    }
    
    return true;
  });
  
  // Create invoice form
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      userId: "",
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: "",
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
      items: [
        {
          description: "Marketing Services",
          quantity: 1,
          unitPrice: 0,
          amount: 0
        }
      ],
      notes: "Thank you for your business!",
    },
  });
  
  // Handle adding an invoice item
  const addInvoiceItem = () => {
    const currentItems = form.getValues().items || [];
    form.setValue('items', [
      ...currentItems,
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        amount: 0
      }
    ]);
  };
  
  // Handle removing an invoice item
  const removeInvoiceItem = (index: number) => {
    const currentItems = form.getValues().items || [];
    if (currentItems.length > 1) {
      form.setValue('items', currentItems.filter((_, i) => i !== index));
      
      // Update total amount
      updateTotalAmount();
    }
  };
  
  // Handle updating item amount when quantity or unit price changes
  const updateItemAmount = (index: number) => {
    const items = form.getValues().items;
    const item = items[index];
    const amount = item.quantity * item.unitPrice;
    
    // Update the item's amount
    form.setValue(`items.${index}.amount`, amount);
    
    // Update total amount
    updateTotalAmount();
  };
  
  // Update total invoice amount
  const updateTotalAmount = () => {
    const items = form.getValues().items;
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    form.setValue('amount', total.toFixed(2));
  };
  
  // Handle form submission
  const onSubmit = (data: InvoiceFormValues) => {
    const invoiceData = {
      ...data,
      amount: parseFloat(data.amount),
      status: 'unpaid',
    };
    
    createInvoiceMutation.mutate(invoiceData);
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Manage client invoices and payments.</p>
          </div>
          
          <Button onClick={() => setIsCreatingInvoice(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute top-0 bottom-0 w-5 h-5 my-auto left-3 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-[180px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>{statusFilter === 'all' ? 'All Statuses' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Manage and track all client invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInvoices || isLoadingClients ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices && filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice: any) => {
                    const client = clients?.find((c: any) => c.id === invoice.userId);
                    
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
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
                        <TableCell>${parseFloat(invoice.amount).toFixed(2)}</TableCell>
                        <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
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
                                setSelectedInvoice(invoice);
                                setIsViewingInvoice(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="mr-2 h-4 w-4" />
                                Send to Client
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(invoice.id, 'paid')} 
                                disabled={invoice.status === 'paid'}
                              >
                                <Badge variant="outline" className="border-green-500 text-green-500 mr-2">
                                  Paid
                                </Badge>
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(invoice.id, 'unpaid')} 
                                disabled={invoice.status === 'unpaid'}
                              >
                                <Badge variant="outline" className="border-yellow-500 text-yellow-500 mr-2">
                                  Unpaid
                                </Badge>
                                Mark as Unpaid
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(invoice.id, 'overdue')} 
                                disabled={invoice.status === 'overdue'}
                              >
                                <Badge variant="outline" className="border-red-500 text-red-500 mr-2">
                                  Overdue
                                </Badge>
                                Mark as Overdue
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      {searchQuery || statusFilter !== 'all' ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FileText className="h-8 w-8 mb-2" />
                          <p>No invoices match your search criteria</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FileText className="h-8 w-8 mb-2" />
                          <p>No invoices found</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4"
                            onClick={() => setIsCreatingInvoice(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Invoice
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* View Invoice Dialog */}
      <Dialog open={isViewingInvoice} onOpenChange={setIsViewingInvoice}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              View the details of this invoice.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h3 className="text-2xl font-bold">Invoice #{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-muted-foreground">
                    Created on {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={selectedInvoice.status} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Bill To:</h4>
                  {clients && (
                    <div>
                      {(() => {
                        const client = clients.find((c: any) => c.id === selectedInvoice.userId);
                        return client ? (
                          <>
                            <p className="font-medium">{client.firstName} {client.lastName}</p>
                            <p>{client.email}</p>
                            {client.company && <p>{client.company}</p>}
                          </>
                        ) : (
                          <p>Unknown Client</p>
                        );
                      })()}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Date:</span>
                    <span>{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2">
                    <span>Total Amount:</span>
                    <span>${parseFloat(selectedInvoice.amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Invoice Items</h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {selectedInvoice.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Notes:</h4>
                  <p className="text-muted-foreground">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewingInvoice(false)}>Close</Button>
            <Button 
              onClick={() => selectedInvoice && handleDownloadInvoice(selectedInvoice)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Invoice Dialog */}
      <Dialog open={isCreatingInvoice} onOpenChange={setIsCreatingInvoice}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for a client.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingClients ? (
                            <div className="p-2 text-center">Loading clients...</div>
                          ) : clients && clients.length > 0 ? (
                            clients.map((client: any) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.firstName} {client.lastName} ({client.email})
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center">No clients found</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input placeholder="INV-2023-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="flex items-center bg-muted px-3 rounded-l-md border border-r-0 border-input">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                          </span>
                          <Input
                            placeholder="0.00"
                            className="rounded-l-none"
                            {...field}
                            readOnly
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Invoice Items</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInvoiceItem}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {form.watch('items')?.map((_, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-6">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index !== 0 ? 'sr-only' : undefined}>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Item description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index !== 0 ? 'sr-only' : undefined}>Qty</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  step="1" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseInt(e.target.value) || 1);
                                    updateItemAmount(index);
                                  }}
                                  onBlur={field.onBlur}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index !== 0 ? 'sr-only' : undefined}>Unit Price</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0.01" 
                                  step="0.01" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value) || 0);
                                    updateItemAmount(index);
                                  }}
                                  onBlur={field.onBlur}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <FormField
                          control={form.control}
                          name={`items.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index !== 0 ? 'sr-only' : undefined}>Amount</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  disabled
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-1 pt-9">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInvoiceItem(index)}
                          disabled={form.watch('items').length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any notes for the client..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreatingInvoice(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createInvoiceMutation.isPending}
                >
                  {createInvoiceMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Create Invoice
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
