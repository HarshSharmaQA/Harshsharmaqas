import Image from 'next/image';
import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, BarChart2, DollarSign } from 'lucide-react';

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = courses.find((c) => c.slug === params.slug);

  if (!course) {
    notFound();
  }

  const bannerImage = PlaceHolderImages.find((img) => img.id === 'course-detail-banner');
  const instructorImage = PlaceHolderImages.find((img) => img.id === 'instructor-avatar');
  
  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-64 md:h-80 w-full">
        {bannerImage && (
          <Image
            src={bannerImage.imageUrl}
            alt={course.title}
            fill
            className="object-cover"
            data-ai-hint={bannerImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">{course.title}</h1>
            <p className="text-lg mt-2">{course.description}</p>
          </div>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold font-headline mb-6">Course Syllabus</h2>
            <Accordion type="single" collapsible className="w-full">
              {course.syllabus.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="font-semibold">{item.title}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.content}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-24 shadow-lg">
              <CardContent className="p-6">
                <Button className="w-full text-lg" size="lg">Enroll Now</Button>
                
                <ul className="mt-6 space-y-4 text-sm">
                  <li className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="font-bold text-lg">${course.price}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Duration: {course.duration}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    <span>Level: <Badge variant="secondary">{course.level}</Badge></span>
                  </li>
                </ul>

                <div className="mt-8 border-t pt-6">
                    <h3 className="font-headline font-semibold mb-4">Instructor</h3>
                    <div className="flex items-center gap-4">
                        {instructorImage && (
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={instructorImage.imageUrl} alt={course.instructor} data-ai-hint={instructorImage.imageHint} />
                                <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div>
                            <p className="font-bold">{course.instructor}</p>
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
