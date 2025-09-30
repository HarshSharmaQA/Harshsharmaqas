
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const enrollSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

type EnrollFormValues = z.infer<typeof enrollSchema>;

interface EnrollDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEnrollmentSuccess: () => void;
  courseTitle: string;
  courseSlug: string;
}

export function EnrollDialog({ isOpen, onOpenChange, onEnrollmentSuccess, courseTitle, courseSlug }: EnrollDialogProps) {
  const { toast } = useToast();
  const form = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: EnrollFormValues) => {
    try {
      // Create a document with the user's email as the ID for uniqueness within the subcollection
      const enrollmentRef = doc(collection(db, 'courses', courseSlug, 'enrollments'), values.email);
      
      await setDoc(enrollmentRef, {
        name: values.name,
        email: values.email,
        enrolledAt: serverTimestamp(),
      });

      toast({
        title: 'Enrollment Successful!',
        description: `You've been enrolled in "${courseTitle}".`,
      });
      onEnrollmentSuccess();
      form.reset();

    } catch (error) {
        console.error("Enrollment error: ", error);
        toast({
            variant: 'destructive',
            title: 'Enrollment Failed',
            description: 'There was an issue processing your enrollment. Please try again.',
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Enroll in {courseTitle}</DialogTitle>
          <DialogDescription>
            Just a few details to get you started on your learning journey.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Enrolling...' : 'Complete Enrollment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
