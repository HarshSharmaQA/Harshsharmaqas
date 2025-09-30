
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { db } from '@/lib/firebase';
import { type Course } from '@/lib/mock-data';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

type Enrollment = {
  id: string;
  name: string;
  email: string;
  enrolledAt: Timestamp;
};

interface ViewEnrollmentsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  course: Course;
}

export function ViewEnrollmentsDialog({ isOpen, onOpenChange, course }: ViewEnrollmentsDialogProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const q = query(
      collection(db, 'enrollments'),
      where('courseSlug', '==', course.slug)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const enrollmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
      setEnrollments(enrollmentsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching enrollments: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, course.slug]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Enrollments for: {course.title}</DialogTitle>
          <DialogDescription>
            Here is a list of users who have enrolled in this course.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No enrollments found for this course yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">{enrollment.name}</TableCell>
                    <TableCell>{enrollment.email}</TableCell>
                    <TableCell>
                      {enrollment.enrolledAt ? format(enrollment.enrolledAt.toDate(), 'PPP p') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
