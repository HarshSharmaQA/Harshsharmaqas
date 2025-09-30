
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { ImageUploader } from '@/components/admin/image-uploader';

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required.'),
  adminEmail: z.string().email('Must be a valid email.'),
  heroTitle: z.string().min(1, 'Hero title is required.'),
  heroSubtitle: z.string().min(1, 'Hero subtitle is required.'),
  heroDescription: z.string().min(1, 'Hero description is required.'),
  heroImageUrl: z.string().url().optional().or(z.literal('')),
  aboutMeLong: z.string().min(1, 'About me content is required.'),
  socialTwitter: z.string().url().optional().or(z.literal('')),
  socialLinkedin: z.string().url().optional().or(z.literal('')),
  socialGithub: z.string().url().optional().or(z.literal('')),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: '',
      adminEmail: '',
      heroTitle: '',
      heroSubtitle: '',
      heroDescription: '',
      heroImageUrl: '',
      aboutMeLong: '',
      socialTwitter: '',
      socialLinkedin: '',
      socialGithub: '',
    },
  });

  const { isSubmitting, isDirty } = form.formState;

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'site');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        form.reset(docSnap.data() as SettingsFormValues);
      }
    };
    fetchSettings();
  }, [form]);

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await setDoc(doc(db, 'settings', 'site'), values, { merge: true });
      toast({
        title: 'Settings Saved',
        description: 'Your site settings have been updated successfully.',
      });
      form.reset(values); // To reset the dirty state
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem saving the settings.',
      });
    }
  };
  
  const heroImageUrl = form.watch('heroImageUrl');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">Site Settings</h1>
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage general site settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="siteName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                                <Input placeholder="QAWala" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Admin Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="admin@qawala.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Homepage Hero</CardTitle>
                <CardDescription>Manage the content of the hero section on the homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="heroTitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Harsh Sharma" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="heroSubtitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subtitle</FormLabel>
                            <FormControl>
                                <Input placeholder="Software Development Engineer In Test (SDET)" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="heroDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea rows={3} placeholder="I write about testing, development, and career growth..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="heroImageUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Hero Image</FormLabel>
                        <FormControl>
                            <ImageUploader 
                            onUrlChange={(url) => form.setValue('heroImageUrl', url, { shouldDirty: true })}
                            initialUrl={heroImageUrl}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                <CardTitle>About Page</CardTitle>
                <CardDescription>Manage the content of the about page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="aboutMeLong"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>About Me Content</FormLabel>
                            <FormControl>
                                <Textarea rows={10} placeholder="I'm Harsh Sharma, a passionate SDET..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Manage the social media links for the header and footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="socialLinkedin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>LinkedIn URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://www.linkedin.com/in/..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="socialTwitter"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Twitter/X URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://twitter.com/..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="socialGithub"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GitHub URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://github.com/..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
