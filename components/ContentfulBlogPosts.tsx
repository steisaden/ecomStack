'use client';

import { useEffect, useState, useMemo } from 'react';
import { BlogPost } from '@/lib/types';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { CalendarDays, Eye, Heart, User, Tag, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/new_styles/components/ui/alert-dialog";

const ITEMS_PER_PAGE = 5;

export default function ContentfulBlogPosts() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [postToArchive, setPostToArchive] = useState<BlogPost | null>(null);


  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to force fresh data
      const response = await fetch(`/api/contentful/blog-posts?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBlogPosts(Array.isArray(data) ? data : data.items || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  // Extract unique categories and authors for filtering
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    if (Array.isArray(blogPosts)) {
      blogPosts.forEach(post => {
        if (post.categories && Array.isArray(post.categories)) {
          post.categories.forEach(category => {
            const categoryName = typeof category === 'string' ? category : category?.name || 'Uncategorized';
            categorySet.add(categoryName);
          });
        }
      });
    }
    return Array.from(categorySet).sort();
  }, [blogPosts]);

  const authors = useMemo(() => {
    const authorSet = new Set<string>();
    if (Array.isArray(blogPosts)) {
      blogPosts.forEach(post => {
        if (post.author) {
          const authorName = typeof post.author === 'string' ? post.author : post.author?.name || 'Unknown Author';
          authorSet.add(authorName);
        }
      });
    }
    return Array.from(authorSet).sort();
  }, [blogPosts]);

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = Array.isArray(blogPosts) ? blogPosts : [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        (post.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.tags && post.tags.some(tag => 
          (typeof tag === 'string' ? tag : tag || '').toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post =>
        (statusFilter === 'published' && post.sys.publishedVersion) ||
        (statusFilter === 'draft' && !post.sys.publishedVersion)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(post => {
        if (!post.categories || !Array.isArray(post.categories)) return false;
        return post.categories.some(category => {
          const categoryName = typeof category === 'string' ? category : category?.name || 'Uncategorized';
          return categoryName === categoryFilter;
        });
      });
    }

    // Author filter
    if (authorFilter !== 'all') {
      filtered = filtered.filter(post => {
        if (!post.author) return false;
        const authorName = typeof post.author === 'string' ? post.author : post.author?.name || 'Unknown Author';
        return authorName === authorFilter;
      });
    }

    // Sort
    return filtered.sort((a, b) => {
      if (sortOrder === 'newest' || sortOrder === 'oldest') {
        const dateA = new Date(a.publishedAt || a.sys.updatedAt).getTime();
        const dateB = new Date(b.publishedAt || b.sys.updatedAt).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      } else if (sortOrder === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortOrder === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });
  }, [blogPosts, searchTerm, statusFilter, categoryFilter, authorFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredAndSortedPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleSelectAllOnPage = () => {
    const allPostIdsOnPage = paginatedPosts.map(p => p.sys.id);
    const allSelected = allPostIdsOnPage.every(id => selectedPosts.includes(id));
    if (allSelected) {
      setSelectedPosts(prev => prev.filter(id => !allPostIdsOnPage.includes(id)));
    } else {
      setSelectedPosts(prev => Array.from(new Set([...prev, ...allPostIdsOnPage])));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on:`, selectedPosts);
    // API call for bulk action would go here
    setSelectedPosts([]);
  };

  const handleDeletePost = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/admin/blog-posts/${post.sys.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }

      // Remove the post from the local state
      setBlogPosts(prev => prev.filter(p => p.sys.id !== post.sys.id));
      
      // Show success message
      toast.success('Blog post deleted successfully');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post');
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const handleArchivePost = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/admin/blog-posts/${post.sys.id}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archived: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to archive blog post');
      }

      // Update the post in the local state to show it's archived
      setBlogPosts(prev => 
        prev.map(p => 
          p.sys.id === post.sys.id ? { ...p, archived: true } : p
        )
      );
      
      // Show success message
      toast.success('Blog post archived successfully');
    } catch (error) {
      console.error('Error archiving blog post:', error);
      toast.error('Failed to archive blog post');
    } finally {
      setArchiveDialogOpen(false);
      setPostToArchive(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blog Post Management</CardTitle>
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 w-full max-w-sm" data-testid="skeleton" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-[180px]" data-testid="skeleton" />
              <Skeleton className="h-10 w-[180px]" data-testid="skeleton" />
              <Skeleton className="h-10 w-[180px]" data-testid="skeleton" />
              <Skeleton className="h-10 w-[180px]" data-testid="skeleton" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" data-testid="skeleton" />
                    <Skeleton className="h-4 w-full mb-2" data-testid="skeleton" />
                  </div>
                  <Skeleton className="h-6 w-20" data-testid="skeleton" />
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <Skeleton className="h-8 w-8 rounded-full" data-testid="skeleton" />
                  <Skeleton className="h-4 w-24" data-testid="skeleton" />
                </div>
                <Skeleton className="h-4 w-1/2" data-testid="skeleton" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error loading blog posts</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Blog Post Management</CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={fetchBlogPosts} className="flex-1 sm:flex-none">
              Refresh
            </Button>
            <Button variant="default" onClick={() => window.location.href = '/admin/blog-posts/create'} className="flex-1 sm:flex-none whitespace-nowrap">
              Create Blog Post
            </Button>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <Input
            placeholder="Search by title, excerpt, or tags..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
          <div className="flex flex-wrap gap-4">
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]" aria-label="Filter by status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]" aria-label="Filter by category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={authorFilter} onValueChange={v => { setAuthorFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {authors.map(author => (
                  <SelectItem key={author} value={author}>{author}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={v => { setSortOrder(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedPosts.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-2 bg-muted rounded-md">
            <p className="text-sm font-medium">{selectedPosts.length} selected</p>
            <Button onClick={() => handleBulkAction('delete')} variant="destructive">{"Delete Selected"}</Button>
            <Button onClick={() => handleBulkAction('publish')} variant="secondary">{"Publish Selected"}</Button>
            <Button onClick={() => handleBulkAction('unpublish')} variant="secondary">{"Unpublish Selected"}</Button>
          </div>
        )}
        {paginatedPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No blog posts found matching your criteria.</p>
            {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || authorFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setAuthorFilter('all');
                  setCurrentPage(1);
                }}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedPosts.map((post) => (
                <Card key={post.sys.id} className="overflow-hidden relative">
                   <div className="absolute top-4 left-4">
                    <Checkbox
                      checked={selectedPosts.includes(post.sys.id)}
                      onCheckedChange={() => handleSelectPost(post.sys.id)}
                      aria-label={`Select ${post.title}`}
                    />
                  </div>
                  <CardContent className="p-6 pl-12">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                        <p className="text-muted-foreground mb-3">{post.excerpt}</p>
                      </div>
                      <Badge variant={post.sys.publishedVersion ? 'default' : 'secondary'}>
                        {post.sys.publishedVersion ? 'Published' : 'Draft'}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mb-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => {
                          // Redirect to edit page for the specific blog post
                          window.location.href = `/admin/blog-posts/edit/${post.sys.id}`;
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                        onClick={() => {
                          setPostToArchive(post);
                          setArchiveDialogOpen(true);
                        }}
                      >
                        Archive
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          setPostToDelete(post);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>

                    {/* Featured Image */}
                    {post.featuredImage && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={post.featuredImage.url}
                          alt={post.featuredImage.title || post.title}
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}

                    {/* Author and Metadata */}
                    <div className="flex items-center gap-4 mb-4">
                      {post.author && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {post.author.avatar && (
                              <AvatarImage src={post.author.avatar.url} alt={post.author.name} />
                            )}
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {typeof post.author === 'string' ? post.author : post.author.name}
                          </span>
                        </div>
                      )}
                      
                      <Separator orientation="vertical" className="h-4" />
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {post.publishedAt 
                            ? new Date(post.publishedAt).toLocaleDateString()
                            : new Date(post.sys.createdAt).toLocaleDateString()
                          }
                        </span>
                      </div>

                      {/* Engagement Metrics */}
                      {(post.views || post.likes) && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {post.views && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{post.views.toLocaleString()}</span>
                              </div>
                            )}
                            {post.likes && (
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span>{post.likes.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Categories and Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.categories && Array.isArray(post.categories) && post.categories.map((category, index) => {
                        const categoryName = typeof category === 'string' ? category : category?.name || 'Uncategorized';
                        return (
                          <Badge key={index} variant="outline" className="text-xs">
                            <FolderOpen className="h-3 w-3 mr-1" />
                            {categoryName}
                          </Badge>
                        );
                      })}
                      {post.tags && Array.isArray(post.tags) && post.tags.slice(0, 3).map((tag, index) => {
                        const tagName = typeof tag === 'string' ? tag : tag;
                        return (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tagName}
                          </Badge>
                        );
                      })}
                      {post.tags && post.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{post.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Content Preview */}
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-primary hover:underline list-none">
                        <span className="group-open:hidden">Show content preview</span>
                        <span className="hidden group-open:inline">Hide content preview</span>
                      </summary>
                      <div className="mt-3 p-4 bg-muted/50 rounded-lg">
                        <div className="prose prose-sm max-w-none">
                          {documentToReactComponents(post.content)}
                        </div>
                      </div>
                    </details>

                    {/* Timestamps */}
                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex justify-between">
                      <span>Created: {new Date(post.sys.createdAt).toLocaleString()}</span>
                      <span>Updated: {new Date(post.sys.updatedAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-between items-center mt-8">
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={paginatedPosts.length > 0 && paginatedPosts.every(p => selectedPosts.includes(p.sys.id))}
                        onCheckedChange={handleSelectAllOnPage}
                        aria-label="Select all posts on this page"
                    />
                    <span>Select All on Page</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                    >
                        Previous
                    </Button>
                    <span className="text-sm">Page {currentPage} of {totalPages}</span>
                    <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>
            </div>
          </>
        )}
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This action cannot be undone. This will permanently delete the blog post "${postToDelete?.title}" from the website and Contentful.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => postToDelete && handleDeletePost(postToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This will archive the blog post "${postToArchive?.title}" and remove it from public view while keeping it in the system. You can restore it later if needed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => postToArchive && handleArchivePost(postToArchive)}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}