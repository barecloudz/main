import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { CloudBackground } from "@/lib/cloudAnimations";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlogPostDetail() {
  const [, params] = useRoute("/blog/:id");
  const postId = params?.id;
  
  // Convert postId to number if possible
  const numericId = /^\d+$/.test(postId || '') ? Number(postId) : null;

  // Fetch blog post by id
  const { 
    data: post, 
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/blog', numericId],
    queryFn: async () => {
      if (!numericId) {
        throw new Error('Invalid blog post ID');
      }
      const response = await fetch(`/api/blog/${numericId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }
      return response.json();
    },
    enabled: numericId !== null,
  });
  
  // Fetch all blog posts for "Recent Posts" section
  const {
    data: allPosts,
    isLoading: isLoadingPosts
  } = useQuery({
    queryKey: ['/api/blog'],
  });

  // Format the date if available
  const formattedDate = post?.createdAt 
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) 
    : '';

  return (
    <div className="min-h-screen flex flex-col">
      <CloudBackground className="absolute inset-0 z-[-1]" />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" className="mb-6 flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : !numericId ? (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-3">Invalid blog post ID</h3>
              <p className="mb-4">The blog post ID format is incorrect. Please check the URL and try again.</p>
              <Link href="/blog">
                <Button>Return to Blog</Button>
              </Link>
            </div>
          ) : isError || !post ? (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-3">Blog post not found</h3>
              <p className="mb-4">The blog post you're looking for doesn't exist or has been removed.</p>
              <Link href="/blog">
                <Button>Return to Blog</Button>
              </Link>
            </div>
          ) : !post.published ? (
            <div className="bg-muted/30 border rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-3">This post is not available</h3>
              <p className="mb-4">This blog post is currently not published.</p>
              <Link href="/blog">
                <Button>Return to Blog</Button>
              </Link>
            </div>
          ) : (
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {post.coverImageUrl && (
                <div className="w-full h-80 overflow-hidden">
                  <img 
                    src={post.coverImageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
                <div className="flex items-center text-sm text-muted-foreground mb-6">
                  <div className="flex items-center mr-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>Admin</span>
                  </div>
                </div>
                <Separator className="mb-6" />
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {post.content.split('\n').map((paragraph: string, index: number) => (
                    paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
                  ))}
                </div>
              </div>
              
              {/* Recent Blog Posts Section */}
              {Array.isArray(allPosts) && allPosts.length > 1 && (
                <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-10">
                  <h3 className="text-2xl font-semibold mb-6">Recent Posts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allPosts
                      .filter((recentPost: any) => recentPost.published && recentPost.id !== Number(numericId))
                      .slice(0, 4)
                      .map((recentPost: any) => {
                        const postDate = recentPost.createdAt 
                          ? new Date(recentPost.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : '';
                          
                        return (
                          <Card key={recentPost.id} className="overflow-hidden h-full">
                            {recentPost.coverImageUrl && (
                              <div className="h-40 overflow-hidden">
                                <img 
                                  src={recentPost.coverImageUrl} 
                                  alt={recentPost.title} 
                                  className="w-full h-full object-cover transition-transform hover:scale-105"
                                />
                              </div>
                            )}
                            <CardContent className="p-4">
                              <h4 className="text-lg font-semibold mb-2 line-clamp-2">{recentPost.title}</h4>
                              <div className="flex items-center text-sm text-muted-foreground mb-3">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{postDate}</span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {recentPost.excerpt || recentPost.content.substring(0, 100)}
                                {(recentPost.excerpt || recentPost.content).length > 100 ? '...' : ''}
                              </p>
                              <Link href={`/blog/${recentPost.id}`}>
                                <Button size="sm" variant="outline" className="mt-2 w-full flex items-center justify-center">
                                  Read More <ChevronRight className="ml-1 h-3 w-3" />
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}