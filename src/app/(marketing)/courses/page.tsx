
import Image from 'next/image';
import Link from 'next/link';
import { collection, getDocs, query } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { type Course } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

async function getCourses(): Promise<Course[]> {
    const coursesCol = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesCol);
    const courseList = coursesSnapshot.docs.map(doc => doc.data() as Course);
    return courseList;
}

export default async function CoursesPage() {
  const courses = await getCourses();
  const fallbackImage = PlaceHolderImages.find(img => img.id === 'course-detail-banner');

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">Our Courses</h1>
        <p className="text-lg text-muted-foreground mt-2">Invest in your skills and grow your career with our expert-led courses.</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Courses are being prepared. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const placeholderImage = course.imageId ? PlaceHolderImages.find((img) => img.id === course.imageId) : null;
            const imageUrl = course.imageUrl || placeholderImage?.imageUrl || fallbackImage?.imageUrl || "https://picsum.photos/seed/course/400/250";
            const imageHint = placeholderImage?.imageHint || 'course image';

            return (
              <Card key={course.id} className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group">
                <div className="overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={course.title}
                      width={400}
                      height={250}
                      className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                      data-ai-hint={imageHint}
                    />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-center">
                      <Badge variant="secondary" className="capitalize">{course.level}</Badge>
                      <p className="text-lg font-bold text-primary">${course.price}</p>
                  </div>
                  <CardTitle className="font-headline pt-2 h-16">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <p className="text-muted-foreground text-sm mb-4 flex-grow">{course.description}</p>
                  <Button variant="outline" asChild className="w-full mt-auto">
                    <Link href={`/courses/${course.slug}`}>
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
