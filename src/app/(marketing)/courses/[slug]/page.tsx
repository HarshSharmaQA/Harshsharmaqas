
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { Clock, BarChart2, DollarSign, User } from 'lucide-react';
import type { Metadata } from 'next';

async function getCourse(slug: string): Promise<Course | null> {
  const q = query(collection(db, 'courses'), where('slug', '==', slug), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const courseDoc = querySnapshot.docs[0];
  return courseDoc.data() as Course;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const course = await getCourse(params.slug);
  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }
  return {
    title: course.title,
    description: course.description,
  };
}


export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourse(params.slug);

  if (!course) {
    notFound();
  }

  const bannerImage = PlaceHolderImages.find((img) => img.id === 'course-detail-banner');
  const instructorImage = PlaceHolderImages.find((img) => img.id === 'instructor-avatar');
  
  return (
    <div className="bg-background">
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
                    {course.syllabus.map((item, index) => (
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
                    <Button className="w-1/2 text-lg" size="lg">Enroll Now</Button>
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