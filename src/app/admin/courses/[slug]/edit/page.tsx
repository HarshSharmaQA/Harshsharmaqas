
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/admin/image-uploader';
import { useEffect } from 'react';
import { type Course } from '@/lib/mock-data';

const syllabusSchema = z.object({
  title: z.string().min(1, 'Syllabus title is required.'),
  content: z.string().min(1, 'Syllabus content is required.'),
});

const courseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  slug: z.string().min(5, 'Slug must be at least 5 characters.').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  instructor: z.string().min(3, 'Instructor name is required.'),
  instructorImageUrl: z.string().url().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  duration: z.string().min(1, 'Duration is required.'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  imageUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  altText: z.string().optional(),
  syllabus: z.array(syllabusSchema).min(1, 'At least one syllabus item is required.'),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function EditCoursePage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      instructor: '',
      instructorImageUrl: '',
      price: 0,
      duration: '',
      level: 'Beginner',
      imageUrl: '',
      altText: '',
      syllabus: [],
    },
  });

  useEffect(() => {
    if (slug) {
      const fetchCourse = async () => {
        const courseDocRef = doc(db, 'courses', slug);
        const courseDoc = await getDoc(courseDocRef);
        if (courseDoc.exists()) {
          const courseData = courseDoc.data() as Course;
          form.reset(courseData);
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Course not found.' });
          router.push('/admin/courses');
        }
      };
      fetchCourse();
    }
  }, [slug, form, router, toast]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "syllabus",
  });

  const { isSubmitting, isDirty } = form.formState;

  const onSubmit = async (values: CourseFormValues) => {
    try {
      const id = values.slug; // Use slug as the document ID
      await setDoc(doc(db, 'courses', id), {
        ...values,
        id: id,
      });
      toast({
        title: 'Course Updated!',
        description: 'The course has been saved successfully.',
      });
      router.push('/admin/courses');
    } catch (error) {
      console.error("Error updating course: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem updating the course.',
      });
    }
  };
  
  const generateSlug = () => {
    const title = form.getValues('title');
    const newSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
    form.setValue('slug', newSlug, { shouldDirty: true });
  };
  
  const imageUrl = form.watch('imageUrl');
  const instructorImageUrl = form.watch('instructorImageUrl');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Edit Course</h1>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Introduction to Web Development" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A brief summary of the course..." {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Syllabus</CardTitle>
                  <CardDescription>Define the curriculum for your course.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                      <FormField
                        control={form.control}
                        name={`syllabus.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Module Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Week 1: HTML Basics" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name={`syllabus.${index}.content`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Module Content</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Topics covered in this module..." {...field} />
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
                    onClick={() => append({ title: '', content: '' })}
                  >
                    Add Module
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Settings</CardTitle>
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
                            <Input placeholder="your-course-slug" {...field} />
                          </FormControl>
                          <Button type="button" variant="outline" size="sm" onClick={generateSlug}>Generate</Button>
                        </div>
                        <FormDescription>The unique URL path for this course.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="49.99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 6 Weeks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="instructor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructor</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instructorImageUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Instructor Image</FormLabel>
                        <FormControl>
                            <ImageUploader 
                            onUrlChange={(url) => form.setValue('instructorImageUrl', url, { shouldDirty: true })}
                            initialUrl={instructorImageUrl}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Image</FormLabel>
                        <FormControl>
                          <ImageUploader 
                            onUrlChange={(url) => form.setValue('imageUrl', url, { shouldDirty: true })}
                            initialUrl={imageUrl}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="altText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Alt Text</FormLabel>
                        <FormControl>
                          <Input placeholder="A descriptive caption for the image" {...field} />
                        </FormControl>
                        <FormDescription>
                          For accessibility and SEO.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
