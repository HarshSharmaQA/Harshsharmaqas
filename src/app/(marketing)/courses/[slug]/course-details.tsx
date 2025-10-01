
'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Course } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Clock, BarChart2 } from 'lucide-react';
import { EnrollDialog } from '@/components/courses/enroll-dialog';

export function CourseDetails({ course }: { course: Course }) {
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const placeholderImage = course.imageId ? PlaceHolderImages.find((img) => img.id === course.imageId) : null;
  const fallbackImage = PlaceHolderImages.find(img => img.id === 'course-detail-banner');
  const imageUrl = course.imageUrl || placeholderImage?.imageUrl || fallbackImage?.imageUrl || "https://picsum.photos/seed/course/800/450";
  const imageHint = placeholderImage?.imageHint || 'course banner';

  const defaultInstructorImage = PlaceHolderImages.find(img => img.id === 'instructor-avatar');
  const instructorImageUrl = course.instructorImageUrl || defaultInstructorImage?.imageUrl;
  const instructorImageHint = defaultInstructorImage?.imageHint || 'instructor avatar';


  const handleEnrollmentSuccess = () => {
    setIsEnrollDialogOpen(false);
    setIsEnrolled(true);
  };

  return (
    <>
      <div className="container py-12 md:py-20 px-4 md:px-6">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-8">{course.description}</p>
            
            {/* Instructor Info */}
            <div className="flex items-center gap-4 mb-12">
              {instructorImageUrl && (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={instructorImageUrl} alt={course.instructor} data-ai-hint={instructorImageHint} />
                  <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="font-semibold text-lg">Created by {course.instructor}</p>
                <p className="text-sm text-muted-foreground">Expert in Software Quality Assurance</p>
              </div>
            </div>

            {/* Syllabus */}
            <div id="syllabus">
                <h2 className="text-3xl font-bold font-headline mb-6">Course Syllabus</h2>
                <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                    {course.syllabus.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                        {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground prose prose-lg dark:prose-invert">
                           <p>{item.content}</p>
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
            </div>
          </div>

          {/* Sticky Sidebar Card */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-28">
              <Card className="shadow-lg">
                <CardHeader className="p-0">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <Image
                        src={imageUrl}
                        alt={course.altText || course.title}
                        fill
                        className="object-cover"
                        data-ai-hint={imageHint}
                    />
                  </div>
                  <div className="p-6">
                    <CardTitle className="font-headline text-3xl mb-2">${course.price}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    {isEnrolled ? (
                         <div className="flex flex-col items-center justify-center text-center p-4 bg-green-100 dark:bg-green-900/50 rounded-md">
                            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500 mb-2" />
                            <p className="font-semibold text-green-800 dark:text-green-300">You are enrolled!</p>
                            <p className="text-sm text-green-700 dark:text-green-400">Welcome to the course.</p>
                        </div>
                    ) : (
                        <Button onClick={() => setIsEnrollDialogOpen(true)} className="w-full text-lg" size="lg">Enroll Now</Button>
                    )}
                    <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-center gap-3">
                            <BarChart2 className="h-5 w-5 text-primary" />
                            <span>Level: <span className="font-medium text-foreground">{course.level}</span></span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary" />
                            <span>Duration: <span className="font-medium text-foreground">{course.duration}</span></span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Lifetime Access</span>
                        </li>
                    </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <EnrollDialog
        isOpen={isEnrollDialogOpen}
        onOpenChange={setIsEnrollDialogOpen}
        onEnrollmentSuccess={handleEnrollmentSuccess}
        courseTitle={course.title}
        courseSlug={course.slug}
      />
    </>
  );
}
