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
import { Label } from "@/components/ui/label";
import { 
  MoreHorizontal, 
  Plus, 
  Users, 
  FileText, 
  CreditCard,
  Mail,
  Phone,
  Building,
  Check,
  X,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarCard } from '@/components/ui/avatar-card';
import { Badge } from "@/components/ui/badge";

interface UpdateRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (role: 'admin' | 'client') => void;
  currentRole: string;
  userName: string;
}

function UpdateRoleDialog({ isOpen, onClose, onConfirm, currentRole, userName }: UpdateRoleDialogProps) {
  const [role, setRole] = useState<'admin' | 'client'>(currentRole as 'admin' | 'client');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User Role</DialogTitle>
          <DialogDescription>
            Change the role for {userName}. This will affect their permissions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={role === 'client' ? 'default' : 'outline'}
              className={role === 'client' ? 'ring-2 ring-primary' : ''}
              onClick={() => setRole('client')}
            >
              <Users className="mr-2 h-4 w-4" />
              Client
            </Button>
            
            <Button
              type="button"
              variant={role === 'admin' ? 'default' : 'outline'}
              className={role === 'admin' ? 'ring-2 ring-primary' : ''}
              onClick={() => setRole('admin')}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </div>
          
          <div className="space-y-1 text-sm">
            <p className="font-medium">Role permissions:</p>
            {role === 'client' ? (
              <ul className="list-disc list-inside text-muted-foreground">
                <li>Access to client dashboard</li>
                <li>View marketing plans</li>
                <li>Download invoices</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside text-muted-foreground">
                <li>Full administrative access</li>
                <li>Manage all users and clients</li>
                <li>Create and edit marketing plans</li>
                <li>Create invoices</li>
              </ul>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm(role)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminClients() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state for new client
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: ''
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });
  
  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest('POST', `/api/admin/users/update-role`, { userId, role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "User role updated successfully",
        variant: "default",
      });
      setIsEditingRole(false);
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });
  
  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const response = await apiRequest('POST', '/api/admin/create-client', clientData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "Client account created successfully",
        variant: "default",
      });
      setIsAddingClient(false);
      setNewClient({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        phone: ''
      });
    },
    onError: (error) => {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Failed to create client account",
        variant: "destructive",
      });
    },
  });
  
  // Handle role update confirmation
  const handleRoleUpdate = (role: 'admin' | 'client') => {
    if (selectedUser) {
      updateRoleMutation.mutate({ userId: selectedUser.id, role });
    }
  };
  
  // Get initials for avatar
  const getUserInitials = (user: any): string => {
    if (!user) return '';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return '';
  };
  
  // Filter users based on search query
  const filteredUsers = users?.filter((user: any) => {
    const searchString = searchQuery.toLowerCase();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const company = user.company?.toLowerCase() || '';
    
    return fullName.includes(searchString) || 
           email.includes(searchString) || 
           company.includes(searchString);
  });
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-muted-foreground">Manage your clients and users.</p>
          </div>
          <Button onClick={() => setIsAddingClient(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
        
        <div className="flex items-center">
          <Input
            placeholder="Search clients..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>A list of all clients and users in your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.profileImageUrl} />
                            <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                          </Avatar>
                          <span>{user.firstName} {user.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.company || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
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
                              setSelectedUser(user);
                              setIsViewingDetails(true);
                            }}>
                              <Users className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Marketing Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Invoices
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setIsEditingRole(true);
                            }}>
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Update Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      {searchQuery ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mb-2" />
                          <p>No results found for "{searchQuery}"</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Users className="h-8 w-8 mb-2" />
                          <p>No clients found</p>
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
      
      {/* View Client Details Dialog */}
      <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              View detailed information about this client.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="md:col-span-1">
                <AvatarCard
                  name={`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`}
                  subtitle={selectedUser.role}
                  imageUrl={selectedUser.profileImageUrl}
                  className="h-full"
                />
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedUser.email}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-muted-foreground">Phone</Label>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedUser.phone || 'Not provided'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="company" className="text-muted-foreground">Company</Label>
                    <div className="flex items-center mt-1">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedUser.company || 'Not provided'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="joined" className="text-muted-foreground">Joined</Label>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Client Status</h4>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      Marketing Plan
                    </Badge>
                    <Badge variant="outline" className="flex items-center">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Active Invoices
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewingDetails(false)}>Close</Button>
            <Button onClick={() => {
              setIsViewingDetails(false);
              // Here you would navigate to a page to view/edit more details
            }}>More Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Update Role Dialog */}
      {selectedUser && (
        <UpdateRoleDialog
          isOpen={isEditingRole}
          onClose={() => setIsEditingRole(false)}
          onConfirm={handleRoleUpdate}
          currentRole={selectedUser.role}
          userName={`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`}
        />
      )}
      
      {/* Add Client Dialog */}
      <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a new client account. They will receive login credentials via email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName" 
                  value={newClient.firstName}
                  onChange={(e) => setNewClient({...newClient, firstName: e.target.value})}
                  placeholder="John"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName" 
                  value={newClient.lastName}
                  onChange={(e) => setNewClient({...newClient, lastName: e.target.value})}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input 
                id="email" 
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                placeholder="john.doe@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input 
                id="company" 
                value={newClient.company}
                onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                placeholder="Acme Corp"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingClient(false)}>Cancel</Button>
            <Button 
              onClick={() => createClientMutation.mutate(newClient)}
              disabled={!newClient.firstName || !newClient.lastName || !newClient.email || createClientMutation.isPending}
            >
              {createClientMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                'Create Client'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
