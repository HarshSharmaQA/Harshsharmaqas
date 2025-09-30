import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  BarChart,
  FileText,
  Rocket,
} from 'lucide-react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Course } from '@/lib/mock-data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Content Paraphraser',
    description: 'Use our GenAI tool to create unique, SEO-friendly content versions effortlessly.',
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: 'Keyword Rank Tracking',
    description: 'Monitor your website\'s performance for target keywords and climb the Google ranks.',
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'SEO Audit Tool',
    description: 'Automatically discover and fix on-page and off-page SEO issues to improve visibility.',
  },
];

const testimonials = [
  {
    name: 'Sarah J.',
    role: 'Senior QA Engineer',
    quote: "QAWala's courses are top-notch. The automation course helped me land a promotion!",
    imageId: 'testimonial-1',
  },
  {
    name: 'Mike P.',
    role: 'Manual Tester',
    quote: 'The community and the tools provided are invaluable. I feel much more confident in my skills.',
    imageId: 'testimonial-2',
  },
  {
    name: 'Linda K.',
    role: 'Freelance Tester',
    quote: 'Thanks to the SEO tools, my personal testing portfolio now ranks on the first page of Google.',
    imageId: 'testimonial-3',
  },
];

async function getFeaturedCourses(): Promise<Course[]> {
    const coursesCol = query(collection(db, 'courses'), limit(4));
    const coursesSnapshot = await getDocs(coursesCol);
    const courseList = coursesSnapshot.docs.map(doc => doc.data() as Course);
    return courseList;
}

export default async function HomePage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');
  const courses = await getFeaturedCourses();
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-card">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
              Elevate Your QA Career to #1
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              The ultimate platform for QA professionals. Master new skills, track your SEO, and become a top-tier tester.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/courses">
                  Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/admin">
                  Visit Admin Panel
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Tools for the Modern Tester</h2>
              <p className="text-lg text-muted-foreground mt-2">Everything you need to succeed and stand out.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section id="courses" className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Featured Courses</h2>
              <p className="text-lg text-muted-foreground mt-2">Upskill with industry-leading QA courses.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {courses.map((course) => {
                const courseImage = PlaceHolderImages.find((img) => img.id === course.imageId);
                return (
                  <Card key={course.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
                    {courseImage && (
                       <Image
                        src={courseImage.imageUrl}
                        alt={course.title}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={courseImage.imageHint}
                      />
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-headline text-lg font-bold mb-2 h-14">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{course.level} &middot; {course.duration}</p>
                      <Button variant="link" className="p-0" asChild>
                        <Link href={`/courses/${course.slug}`}>Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link href="/courses">View All Courses</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">What Our Users Say</h2>
              <p className="text-lg text-muted-foreground mt-2">Real feedback from the QAWala community.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => {
                const testimonialImage = PlaceHolderImages.find(img => img.id === testimonial.imageId);
                return (
                  <Card key={testimonial.name} className="bg-card shadow-sm">
                    <CardContent className="p-6">
                      <blockquote className="text-lg mb-4">"{testimonial.quote}"</blockquote>
                      <div className="flex items-center">
                        {testimonialImage && (
                          <Avatar>
                            <AvatarImage src={testimonialImage.imageUrl} alt={testimonial.name} data-ai-hint={testimonialImage.imageHint} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className="ml-4">
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <Rocket className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Ready to Rank #1?</h2>
            <p className="text-lg md:text-xl mt-2 mb-8 max-w-2xl mx-auto">
              Join QAWala today and get access to all the tools and training you need to excel.
            </p>
            <Button size="lg" variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
              <Link href="/signup">
                Sign Up for Free
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
