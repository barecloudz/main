import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  FileText, 
  FileType, 
  File, 
  Image, 
  Archive, 
  Table as TableIcon, 
  Search,
  Clock,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ClientDocuments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const { toast } = useToast();

  // Fetch documents for the current user
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: [`/api/users/${user?.id}/documents`],
    enabled: !!user?.id,
  });

  // Mark document as read mutation
  const markAsRead = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/documents/${id}/mark-as-read`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/documents`] });
      toast({
        title: "Document marked as read",
        description: "Document has been marked as read successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error marking the document as read.",
        variant: "destructive",
      });
      console.error("Error marking document as read:", error);
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileType className="h-5 w-5 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "xls":
      case "xlsx":
        return <TableIcon className="h-5 w-5 text-green-500" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <Image className="h-5 w-5 text-purple-500" />;
      case "zip":
      case "rar":
        return <Archive className="h-5 w-5 text-amber-500" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = (categoryValue: string) => {
    switch (categoryValue) {
      case "report":
        return "Report";
      case "contract":
        return "Contract";
      case "invoice":
        return "Invoice";
      case "marketing":
        return "Marketing";
      case "legal":
        return "Legal";
      default:
        return categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1);
    }
  };

  const getCategoryBadgeVariant = (categoryValue: string) => {
    switch (categoryValue) {
      case "report":
        return "default";
      case "contract":
        return "outline";
      case "invoice":
        return "secondary";
      case "marketing":
        return "destructive";
      case "legal":
        return "purple";
      default:
        return "outline";
    }
  };

  const filteredDocuments = (documents as Document[]).filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = category === "all" || doc.category === category;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Documents & Reports</CardTitle>
          <CardDescription>
            View documents and reports shared with you by the BareCloudz team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <Select value={category} onValueChange={handleCategoryChange}>
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

          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading your documents...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-12 text-center border rounded-md">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                {searchTerm || category !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "You don't have any documents shared with you yet"}
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <UITable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getFileTypeIcon(doc.fileType)}</div>
                          <div>
                            <div className="font-medium">{doc.title}</div>
                            {doc.description && (
                              <div className="text-sm text-muted-foreground mt-1 max-w-xs">
                                {doc.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoryBadgeVariant(doc.category) as any}>
                          {getCategoryLabel(doc.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDate(doc.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.isRead ? (
                          <div className="flex items-center text-sm text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Read</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            New
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                            onClick={() => {
                              if (!doc.isRead) {
                                handleMarkAsRead(doc.id);
                              }
                            }}
                          >
                            View Document
                          </a>
                          {!doc.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(doc.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </UITable>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}