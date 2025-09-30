'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, app } from '@/lib/firebase';
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
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/components/admin/image-uploader';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required.'),
  answer: z.string().min(1, 'Answer is required.'),
});

const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  slug: z.string().min(5, 'Slug must be at least 5 characters.').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  category: z.string().min(3, 'Category must be at least 3 characters.'),
  content: z.string().min(100, 'Content must be at least 100 characters.'),
  featureImageUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  seoTitle: z.string().min(5, 'SEO title must be at least 5 characters.'),
  seoDescription: z.string().min(10, 'SEO description must be at least 10 characters.'),
  faqs: z.array(faqSchema).optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

export default function CreateBlogPage() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth(app);
  const [user, loading] = useAuthState(auth);

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
      faqs: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: BlogFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a post.',
      });
      return;
    }

    try {
      await addDoc(collection(db, 'blogs'), {
        ...values,
        author: user.displayName || user.email,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Blog Post Created!',
        description: 'Your new blog post has been saved successfully.',
      });
      router.push('/admin/blogs');
    } catch (error) {
      console.error("Error creating blog post: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem creating the blog post.',
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
    form.setValue('slug', slug);
  };
  
  const generateSeoTitle = () => {
    const title = form.getValues('title');
    form.setValue('seoTitle', title);
  };
  
  const content = form.watch('content') || '';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Create Blog Post</h1>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting || loading}>
          {(isSubmitting || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Publishing...' : 'Publish Post'}
        </Button>
      </div>

      <Form {...form}>
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>Write the main content of your blog post here.</CardDescription>
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
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Add FAQs to help readers understand the topic better.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                    <FormField
                      control={form.control}
                      name={`faqs.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the question" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`faqs.${index}.answer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Answer</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter the answer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 h-6 w-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ question: '', answer: '' })}
                >
                  Add FAQ
                </Button>
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
                            <Button type="button" variant="outline" size="sm" onClick={generateSeoTitle}>Copy Title</Button>
                          </div>
                          <FormDescription>
                            The title that will appear in search engine results. Length: {field.value.length} / 60
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
                            A short summary for search results. Length: {field.value.length} / 160
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
                            <FormDescription>
                                The unique URL path for this post.
                            </FormDescription>
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
                                onUrlChange={(url) => form.setValue('featureImageUrl', url)}
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
