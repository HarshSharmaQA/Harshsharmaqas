
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const pageSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters.').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  status: z.enum(['draft', 'published']).default('draft'),
  password: z.string().optional(),
});

type PageFormValues = z.infer<typeof pageSchema>;

export default function CreatePage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      status: 'draft',
      password: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: PageFormValues) => {
    try {
      await addDoc(collection(db, 'pages'), {
        ...values,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Page Created!',
        description: 'Your new page has been saved successfully.',
      });
      router.push('/admin/pages');
    } catch (error) {
      console.error("Error creating page: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem creating the page.',
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
  
  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">Create Page</h1>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Publishing...' : 'Publish Page'}
            </Button>
        </div>

        <Form {...form}>
            <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                <CardHeader>
                    <CardTitle>Page Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input placeholder="Your page title" {...field} />
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
                            <Textarea placeholder="Write your page content here. Basic HTML is supported." {...field} rows={25} />
                        </FormControl>
                        <FormDescription>
                            You can use basic HTML tags like `<h1>`, `<p>`, `<b>`, etc. for formatting.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Page Settings</CardTitle>
                        <CardDescription>Manage visibility and access for this page.</CardDescription>
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
                                <Input placeholder="your-page-slug" {...field} />
                                </FormControl>
                                <Button type="button" variant="outline" size="sm" onClick={generateSlug}>Generate</Button>
                            </div>
                            <FormDescription>The unique URL path for this page.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>Draft pages are not visible to the public.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Password Protection</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Leave blank for no password" {...field} value={field.value || ''}/>
                            </FormControl>
                            <FormDescription>
                                Require a password to view this page.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </CardContent>
                </Card>
            </div>
            </form>
        </Form>
    </div>
  );
}
