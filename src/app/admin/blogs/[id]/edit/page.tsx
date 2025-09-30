'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { ImageUploader } from '@/components/admin/image-uploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  slug: z.string().min(5, 'Slug must be at least 5 characters.').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  category: z.string().min(3, 'Category must be at least 3 characters.'),
  content: z.string().min(100, 'Content must be at least 100 characters.'),
  featureImageUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  seoTitle: z.string().min(5, 'SEO title must be at least 5 characters.'),
  seoDescription: z.string().min(10, 'SEO description must be at least 10 characters.'),
});

type BlogFormValues = z.infer<typeof blogSchema>;

export default function EditBlogPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      category: '',
      content: '',
      featureImageUrl: '',
      seoTitle: '',
      seoDescription: '',
    },
  });

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        const postDocRef = doc(db, 'blogs', postId);
        const postDoc = await getDoc(postDocRef);
        if (postDoc.exists()) {
          const postData = postDoc.data() as BlogFormValues;
          form.reset(postData);
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Blog post not found.' });
          router.push('/admin/blogs');
        }
      };
      fetchPost();
    }
  }, [postId, form, router, toast]);

  const { isSubmitting, isDirty } = form.formState;

  const onSubmit = async (values: BlogFormValues) => {
    try {
      const postDocRef = doc(db, 'blogs', postId);
      await updateDoc(postDocRef, {
        ...values,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Blog Post Updated!',
        description: 'Your blog post has been saved successfully.',
      });
      router.push('/admin/blogs');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem updating the blog post.',
      });
    }
  };

  const generateSlug = () => {
    const title = form.getValues('title');
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
    form.setValue('slug', slug, { shouldDirty: true });
  };
  
  const generateSeoTitle = () => {
    const title = form.getValues('title');
    form.setValue('seoTitle', title, { shouldDirty: true });
  };

  const featureImageUrl = form.watch('featureImageUrl');
  const content = form.watch('content') || '';
  const seoTitle = form.watch('seoTitle') || '';
  const seoDescription = form.watch('seoDescription') || '';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Edit Blog Post</h1>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting || !isDirty}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Form {...form}>
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>Edit the main content of your blog post.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Your amazing blog post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Write your blog post here. Use markdown for formatting." {...field} rows={20} />
                      </FormControl>
                      <FormDescription>
                        Supports markdown for rich text editing. Character count: {content.length}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Tabs defaultValue="seo" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="seo">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Settings</CardTitle>
                    <CardDescription>Optimize your post for search engines.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="seoTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Title</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input placeholder="A catchy title for search engines" {...field} />
                            </FormControl>
                             <Button type="button" variant="outline" size="sm" onClick={generateSeoTitle}>Copy</Button>
                          </div>
                          <FormDescription>
                            The title that will appear in search engine results. Length: {seoTitle.length} / 60
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seoDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Description (Meta)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="A concise and compelling description for search engine result pages." {...field} rows={4} />
                          </FormControl>
                          <FormDescription>
                             A short summary for search results. Length: {seoDescription.length} / 160
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Post Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Slug</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input placeholder="your-amazing-blog-post-title" {...field} />
                            </FormControl>
                            <Button type="button" variant="outline" size="sm" onClick={generateSlug}>Generate</Button>
                          </div>
                          <FormDescription>The unique URL path for this post.</FormDescription>
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
                            <FormControl>
                                <Input placeholder="e.g., Technology, Career" {...field} />
                            </FormControl>
                            <FormDescription>
                                Assign a category to group related posts.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                      control={form.control}
                      name="featureImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Feature Image</FormLabel>
                          <FormControl>
                            <ImageUploader 
                              onUrlChange={(url) => form.setValue('featureImageUrl', url, { shouldDirty: true })}
                              initialUrl={featureImageUrl}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </form>
      </Form>
    </div>
  );
}
