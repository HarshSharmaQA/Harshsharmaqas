
'use client';

import Image from 'next/image';
import { type Course } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, BarChart2, User, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import { EnrollDialog } from '@/components/courses/enroll-dialog';

async function getCourse(slug: string): Promise<Course | null> {
  const q = query(collection(db, 'courses'), where('slug', '==', slug), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const courseDoc = querySnapshot.docs[0];
  return courseDoc.data() as Course;
}

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const awaitedParams = await params;
        const courseData = await getCourse(awaitedParams.slug);
        setCourse(courseData);
      } catch (error) {
        console.error("Failed to fetch course", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [params]);

  const handleEnrollmentSuccess = () => {
    setIsEnrolled(true);
    setIsDialogOpen(false);
  };
  
  if (!hasMounted || loading) {
    // You can replace this with a proper skeleton loader component
    return <div className="flex justify-center items-center h-screen">Loading course...</div>;
  }

  if (!course) {
    notFound();
  }

  const bannerImage = PlaceHolderImages.find((img) => img.id === 'course-detail-banner');
  const instructorImage = PlaceHolderImages.find((img) => img.id === 'instructor-avatar');
  
  const syllabusToShow = isEnrolled ? course.syllabus.slice(0, 3) : course.syllabus.slice(0, 2);

  return (
    <div className="bg-background">
       <EnrollDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onEnrollmentSuccess={handleEnrollmentSuccess}
        courseTitle={course.title}
        courseSlug={course.slug}
       />
      {/* Hero Banner */}
      <section className="relative h-64 md:h-80 w-full">
        <Image
            src={course.imageUrl || bannerImage?.imageUrl || "https://picsum.photos/seed/banner/1200/400"}
            alt={course.title}
            fill
            className="object-cover"
            data-ai-hint={bannerImage?.imageHint || 'course banner'}
          />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <Badge variant="secondary" className="mb-4">{course.level}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-headline">{course.title}</h1>
            <p className="text-lg mt-2 max-w-2xl mx-auto">{course.description}</p>
          </div>
        </div>
      </section>

      <div className="container py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 xl:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Course Syllabus</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                    {syllabusToShow.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                            {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground prose prose-lg dark:prose-invert max-w-none">
                           <div dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br />') }} />
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                    {!isEnrolled && course.syllabus.length > 2 && (
                       <div className="mt-8 text-center p-6 border-2 border-dashed rounded-lg bg-muted/50">
                            <h3 className="text-xl font-bold font-headline">Unlock the Full Course</h3>
                            <p className="text-muted-foreground mt-2 mb-4">Enroll now to get access to all {course.syllabus.length} modules, including hands-on projects and quizzes.</p>
                            <Button onClick={() => setIsDialogOpen(true)}>Enroll Now to Continue</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="relative">
            <Card className="sticky top-24 shadow-lg">
                <CardHeader className="p-0">
                    <Image 
                        src={course.imageUrl || bannerImage?.imageUrl || "https://picsum.photos/seed/card/400/250"}
                        alt={course.title}
                        width={400}
                        height={250}
                        className="w-full h-52 object-cover rounded-t-lg"
                    />
                </CardHeader>
              <CardContent className="p-6">
                
                <div className="flex justify-between items-center mb-4">
                    <p className="text-3xl font-bold text-primary">${course.price}</p>
                    {isEnrolled ? (
                      <Button className="w-1/2 text-lg" size="lg" disabled>
                        <CheckCircle className="mr-2" />
                        Enrolled
                      </Button>
                    ) : (
                      <Button className="w-1/2 text-lg" size="lg" onClick={() => setIsDialogOpen(true)}>
                        Enroll Now
                      </Button>
                    )}
                </div>
                
                <ul className="mt-6 space-y-4 text-sm border-t pt-6">
                  <li className="flex items-center gap-3 text-base">
                    <Clock className="h-5 w-5 text-primary" />
                    <span><span className="font-semibold">Duration:</span> {course.duration}</span>
                  </li>
                  <li className="flex items-center gap-3 text-base">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    <span><span className="font-semibold">Level:</span> {course.level}</span>
                  </li>
                  <li className="flex items-center gap-3 text-base">
                    <User className="h-5 w-5 text-primary" />
                    <span><span className="font-semibold">Instructor:</span> {course.instructor}</span>
                  </li>
                </ul>

                <div className="mt-6 border-t pt-6">
                    <h3 className="font-headline font-semibold mb-4 text-lg">About the Instructor</h3>
                    <div className="flex items-center gap-4">
                        {instructorImage && (
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={instructorImage.imageUrl} alt={course.instructor} data-ai-hint={instructorImage.imageHint} />
                                <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div>
                            <p className="font-bold text-xl">{course.instructor}</p>
                            <p className="text-sm text-muted-foreground">QA Lead & Educator</p>
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
