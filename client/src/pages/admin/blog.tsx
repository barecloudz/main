import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Pencil, 
  Trash2, 
  Plus, 
  Eye,
  Loader2,
  Check,
  X,
} from 'lucide-react';
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Switch } from "@/components/ui/switch";

// Blog post form schema
const blogPostFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  excerpt: z.string().optional(),
  coverImageUrl: z.string().optional(),
  published: z.boolean().default(false),
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

export default function AdminBlog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch blog posts
  const { 
    data: posts, 
    isLoading: isLoadingPosts,
    isError,
    error 
  } = useQuery({
    queryKey: ['/api/blog'],
  });

  // Blog post form
  const postForm = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      coverImageUrl: "",
      published: false,
    },
  });

  // Reset form for creating a new post
  const resetFormForNewPost = () => {
    postForm.reset({
      title: "",
      content: "",
      excerpt: "",
      coverImageUrl: "",
      published: false,
    });
    setCoverImage(null);
    setSelectedPost(null);
    setIsEditing(false);
    setIsCreating(true);
  };

  // Load post for editing
  const loadPostForEditing = (post: any) => {
    setSelectedPost(post);
    setCoverImage(post.coverImageUrl || null);
    postForm.reset({
      title: post.title || "",
      content: post.content || "",
      excerpt: post.excerpt || "",
      coverImageUrl: post.coverImageUrl || "",
      published: post.published || false,
    });
    setIsEditing(true);
    setIsCreating(false);
    setActiveTab("editor");
  };

  // Handle cover image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCoverImage(result);
        postForm.setValue("coverImageUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: BlogPostFormValues) => {
      const response = await apiRequest('POST', '/api/blog', {
        ...postData,
        authorId: "admin_barecloudz_1", // This would typically come from the authenticated user
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create blog post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: "Success",
        description: "Blog post created successfully",
        variant: "default",
      });
      setActiveTab("posts");
      setIsCreating(false);
    },
    onError: (error: any) => {
      console.error('Error creating blog post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (postData: BlogPostFormValues) => {
      if (!selectedPost || !selectedPost.id) {
        throw new Error('No post selected for update');
      }
      
      const response = await apiRequest('PATCH', `/api/blog/${selectedPost.id}`, postData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update blog post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: "Success",
        description: "Blog post updated successfully",
        variant: "default",
      });
      setActiveTab("posts");
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error('Error updating blog post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPost || !selectedPost.id) {
        throw new Error('No post selected for deletion');
      }
      
      const response = await apiRequest('DELETE', `/api/blog/${selectedPost.id}`);
      
      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete blog post');
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
        variant: "default",
      });
      setShowDeleteDialog(false);
    },
    onError: (error: any) => {
      console.error('Error deleting blog post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog post",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
    },
  });

  // Toggle post publication status
  const togglePublishMutation = useMutation({
    mutationFn: async (post: any) => {
      const response = await apiRequest('PATCH', `/api/blog/${post.id}`, {
        published: !post.published,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update publication status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: "Success",
        description: "Publication status updated",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('Error toggling publication status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update publication status",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: BlogPostFormValues) => {
    if (isEditing) {
      updatePostMutation.mutate(data);
    } else {
      createPostMutation.mutate(data);
    }
  };

  if (isLoadingPosts) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error instanceof Error ? error.message : "An unknown error occurred"}</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/blog'] })}
              variant="outline"
            >
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <p className="text-muted-foreground">Create and manage your blog posts</p>
          </div>
          <Button 
            onClick={resetFormForNewPost}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="posts" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center">
              <Pencil className="mr-2 h-4 w-4" />
              {isEditing ? "Edit Post" : (isCreating ? "Create Post" : "Editor")}
            </TabsTrigger>
          </TabsList>

          {/* Posts List */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>All Blog Posts</CardTitle>
                <CardDescription>
                  {posts && posts.length > 0 
                    ? `Showing ${posts.length} blog post${posts.length !== 1 ? 's' : ''}`
                    : "No blog posts found. Create your first post!"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {posts && posts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post: any) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={post.published}
                                onCheckedChange={() => togglePublishMutation.mutate(post)}
                                disabled={togglePublishMutation.isPending}
                              />
                              <span className={post.published ? "text-green-500" : "text-muted-foreground"}>
                                {post.published ? "Published" : "Draft"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <span className="sr-only">Open menu</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => loadPostForEditing(post)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedPost(post);
                                    setShowDeleteDialog(true);
                                  }}
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
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Blog Posts Yet</h3>
                    <p className="text-muted-foreground mt-2 mb-4">Create your first blog post to get started.</p>
                    <Button onClick={resetFormForNewPost}>Create New Post</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Post Editor */}
          <TabsContent value="editor">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? "Edit Blog Post" : "Create New Blog Post"}</CardTitle>
                <CardDescription>
                  {isEditing 
                    ? "Update your existing blog post"
                    : "Create a new blog post for your website"}
                </CardDescription>
              </CardHeader>
              <Form {...postForm}>
                <form onSubmit={postForm.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-6">
                    {/* Cover Image */}
                    <div className="flex flex-col space-y-2">
                      <FormLabel>Cover Image</FormLabel>
                      <div 
                        className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {coverImage ? (
                          <div className="relative w-full">
                            <img 
                              src={coverImage} 
                              alt="Cover" 
                              className="max-h-60 rounded-md mx-auto object-contain"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCoverImage(null);
                                postForm.setValue("coverImageUrl", "");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload a cover image
                            </p>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <FormField
                      control={postForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter blog post title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={postForm.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Excerpt</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="A brief summary of your post (optional)"
                              className="resize-none"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be displayed in blog previews and search results.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={postForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write your blog post content here..."
                              className="min-h-[300px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={postForm.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Published
                            </FormLabel>
                            <FormDescription>
                              When enabled, this post will be visible on your blog.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setActiveTab("posts");
                        setIsEditing(false);
                        setIsCreating(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createPostMutation.isPending || updatePostMutation.isPending}
                    >
                      {(createPostMutation.isPending || updatePostMutation.isPending) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {isEditing ? "Update Post" : "Create Post"}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the blog post "{selectedPost?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletePostMutation.mutate()}
              disabled={deletePostMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}