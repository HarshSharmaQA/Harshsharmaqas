
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Linkedin, Twitter, Github, Star } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type BlogPost } from '@/app/admin/blogs/page';
import { format } from 'date-fns';
import { type Course } from '@/lib/mock-data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Metadata } from 'next';

type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  stars: number;
};

type SiteSettings = {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialGithub: string;
  siteName: string;
};

async function getRecentPosts(): Promise<BlogPost[]> {
    const postsCol = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(3));
    const postsSnapshot = await getDocs(postsCol);
    const postList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    return postList;
}

async function getFeaturedCourses(): Promise<Course[]> {
    const coursesCol = query(collection(db, 'courses'), limit(3));
    const coursesSnapshot = await getDocs(coursesCol);
    const courseList = coursesSnapshot.docs.map(doc => doc.data() as Course);
    return courseList;
}

async function getTestimonials(): Promise<Testimonial[]> {
  const testimonialsCol = query(collection(db, 'testimonials'), orderBy('name'), limit(3));
  const testimonialsSnapshot = await getDocs(testimonialsCol);
  const testimonialList = testimonialsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
  return testimonialList;
}

async function getSettings(): Promise<SiteSettings | null> {
    const docRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as SiteSettings;
    }
    return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings?.siteName || 'QAWala - Expert QA & Testing Resources',
    description: settings?.heroDescription || 'The #1 destination for QA professionals and aspirants. Enhance your skills with our courses and tools.',
  };
}


export default async function HomePage() {
  const [posts, courses, testimonials, settings] = await Promise.all([
    getRecentPosts(),
    getFeaturedCourses(),
    getTestimonials(),
    getSettings()
  ]);

  const fallbackImage = PlaceHolderImages.find(img => img.id === 'course-detail-banner');
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
                {settings?.heroTitle || 'Harsh Sharma'}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-6">
                {settings?.heroSubtitle || 'Software Development Engineer In Test (SDET)'}
              </p>
              <p className="text-muted-foreground mb-8">
                {settings?.heroDescription || 'I write about testing, development, and career growth. Join me on a journey to build better software.'}
              </p>
              <div className="flex items-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/blog">
                    Read The Blog <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <div className="flex items-center gap-2">
                   <Button variant="outline" size="icon" asChild>
                     <Link href={settings?.socialLinkedin || '#'} target="_blank"><Linkedin /></Link>
                   </Button>
                   <Button variant="outline" size="icon" asChild>
                     <Link href={settings?.socialTwitter || '#'} target="_blank"><Twitter /></Link>
                   </Button>
                   <Button variant="outline" size="icon" asChild>
                     <Link href={settings?.socialGithub || '#'} target="_blank"><Github /></Link>
                   </Button>
                </div>
              </div>
            </div>
             <div className="order-1 md:order-2 flex justify-center">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt="Harsh Sharma"
                  width={350}
                  height={350}
                  className="rounded-full object-cover aspect-square shadow-2xl"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section id="featured-courses" className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Featured Courses</h2>
              <p className="text-lg text-muted-foreground mt-2">Kickstart your career with our most popular courses.</p>
            </div>
            
            {courses.length === 0 ? (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-headline mb-2">Courses Coming Soon!</h2>
                    <p className="text-muted-foreground">New courses are being prepared. Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map((course) => {
                    const courseImage = PlaceHolderImages.find((img) => img.id === course.imageId);
                    return (
                      <Card key={course.id} className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group bg-background">
                        {courseImage && (
                          <div className="overflow-hidden">
                              <Image
                                src={courseImage.imageUrl}
                                alt={course.title}
                                width={400}
                                height={250}
                                className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint={courseImage.imageHint}
                              />
                          </div>
                        )}
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
            <div className="text-center mt-12">
                <Button size="lg" asChild>
                    <Link href="/courses">View All Courses</Link>
                </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">What People Are Saying</h2>
              <p className="text-lg text-muted-foreground mt-2">Hear from professionals who have grown with QAWala.</p>
            </div>
            {testimonials.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p>No testimonials yet. Be the first to share your success story!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => {
                    const imageId = `testimonial-${testimonial.id}`;
                    const image = PlaceHolderImages.find(img => img.id === imageId) || PlaceHolderImages.find(img => img.id === 'testimonial-1');
                    return (
                    <Card key={testimonial.id} className="bg-card flex flex-col">
                        <CardHeader>
                        <div className="flex items-center gap-4">
                            {image && (
                                <Avatar className="h-14 w-14">
                                <AvatarImage src={image.imageUrl} alt={testimonial.name} data-ai-hint={image.imageHint} />
                                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div>
                                <p className="font-bold">{testimonial.name}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            </div>
                        </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        <p className="text-muted-foreground italic">&quot;{testimonial.quote}&quot;</p>
                        </CardContent>
                        <CardContent className="flex justify-start">
                        <div className="flex items-center gap-1">
                            {Array(testimonial.stars).fill(0).map((_, i) => (
                                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            ))}
                            </div>
                        </CardContent>
                    </Card>
                    );
                })}
                </div>
            )}
          </div>
        </section>


        {/* Blog Section */}
        <section id="latest-posts" className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Latest From The Blog</h2>
              <p className="text-lg text-muted-foreground mt-2">Check out my newest articles and tutorials.</p>
            </div>
            
            {posts.length === 0 ? (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-headline mb-2">No Posts Yet</h2>
                    <p className="text-muted-foreground">The admin hasn't published any posts. Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => {
                    const imageUrl = post.featureImageUrl || fallbackImage?.imageUrl || "https://picsum.photos/seed/blog/400/250";
                    return (
                        <Card key={post.id} className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300 group bg-background">
                            <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-t-lg">
                            <Image
                                src={imageUrl}
                                alt={post.title}
                                width={400}
                                height={250}
                                className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint="blog post image"
                            />
                            </Link>
                            <CardHeader>
                                <CardTitle className="font-headline text-xl">
                                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                </CardTitle>
                                <CardDescription>
                                    {post.createdAt ? format(new Date(post.createdAt.seconds * 1000), 'MMMM d, yyyy') : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col">
                                <p className="text-muted-foreground mb-4 flex-grow text-sm">{post.seoDescription}</p>
                                <Button asChild variant="outline" className="mt-auto">
                                    <Link href={`/blog/${post.slug}`}>
                                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
                </div>
            )}

            <div className="text-center mt-12">
                <Button size="lg" asChild>
                    <Link href="/blog">View All Posts</Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
