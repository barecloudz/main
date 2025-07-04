import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Calendar, 
  User, 
  ChevronRight, 
  FileText,
  Loader2 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { CloudBackground } from "@/lib/cloudAnimations";

export default function BlogPage() {
  // Fetch all published blog posts
  const { 
    data: posts, 
    isLoading,
    isError
  } = useQuery({
    queryKey: ['/api/blog'],
  });

  const publishedPosts = posts?.filter((post: any) => post.published) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <CloudBackground className="absolute inset-0 z-[-1]" />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl text-muted-foreground">
              Insights, news, and perspectives from the BareCloudz team
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-xl font-semibold mb-2">Unable to load blog posts</h3>
              <p className="mb-4">There was an error loading our blog content. Please try again later.</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Refresh
              </Button>
            </div>
          ) : publishedPosts.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-lg">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-semibold mb-2">No blog posts yet</h3>
              <p className="text-muted-foreground">
                We're working on some great content. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12">
              {publishedPosts.map((post: any) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function BlogPostCard({ post }: { post: any }) {
  const formattedDate = post.createdAt 
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) 
    : '';

  // If no excerpt, create one from content
  const excerpt = post.excerpt || (post.content ? `${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}` : '');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl">
      {post.coverImageUrl && (
        <div className="w-full h-64 overflow-hidden">
          <img 
            src={post.coverImageUrl} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-3 hover:text-primary transition-colors">
          <Link href={`/blog/${post.id}`}>{post.title}</Link>
        </h2>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <div className="flex items-center mr-4">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>Admin</span>
          </div>
        </div>
        <Separator className="mb-4" />
        <p className="text-muted-foreground mb-6">
          {excerpt}
        </p>
        <Link href={`/blog/${post.id}`}>
          <Button variant="outline" className="flex items-center">
            Read More <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}