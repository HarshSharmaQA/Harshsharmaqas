
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Course } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { ViewEnrollmentsDialog } from '@/components/admin/view-enrollments-dialog';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEnrollmentsDialogOpen, setIsEnrollmentsDialogOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('title'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => doc.data() as Course);
      setCourses(coursesData);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleViewEnrollments = (course: Course) => {
    setSelectedCourse(course);
    setIsEnrollmentsDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">Manage Courses</h1>
          <Button asChild>
            <Link href="/admin/courses/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Course
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Course List</CardTitle>
            <CardDescription>A list of all courses on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell><Badge variant="outline">{course.level}</Badge></TableCell>
                    <TableCell>${course.price.toFixed(2)}</TableCell>
                    <TableCell>{course.instructor}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                             <Link href={`/admin/courses/${course.slug}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewEnrollments(course)}>
                            View Enrollments
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {selectedCourse && (
        <ViewEnrollmentsDialog
          isOpen={isEnrollmentsDialogOpen}
          onOpenChange={setIsEnrollmentsDialogOpen}
          course={selectedCourse}
        />
      )}
    </>
  );
}
