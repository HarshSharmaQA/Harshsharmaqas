export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl?: string;
  imageId?: string; // Keep for backward compatibility with seeded data if necessary
  syllabus: { title: string; content: string }[];
};

export const courses: Course[] = [
  {
    id: '1',
    slug: 'manual-testing-masterclass',
    title: 'Manual Testing Masterclass',
    description: 'Learn the fundamentals of manual testing, from test cases to bug reporting.',
    instructor: 'John Doe',
    price: 49.99,
    duration: '6 Weeks',
    level: 'Beginner',
    imageId: 'course-1-thumb',
    syllabus: [
      { title: 'Week 1: Introduction to Software Testing', content: 'Understanding the SDLC, STLC, and the role of a QA tester.' },
      { title: 'Week 2: Test Planning and Documentation', content: 'Creating test plans, test scenarios, and test cases.' },
      { title: 'Week 3: Types of Testing', content: 'Exploring functional, non-functional, smoke, sanity, and regression testing.' },
      { title: 'Week 4: Bug Life Cycle and Reporting', content: 'Mastering the art of finding, documenting, and tracking bugs.' },
    ],
  },
  {
    id: '2',
    slug: 'automation-with-selenium',
    title: 'Automation with Selenium',
    description: 'Dive into web automation with Selenium WebDriver and Java.',
    instructor: 'Jane Smith',
    price: 99.99,
    duration: '8 Weeks',
    level: 'Intermediate',
    imageId: 'course-2-thumb',
    syllabus: [
      { title: 'Week 1-2: Java for Testers', content: 'Core Java concepts necessary for automation.' },
      { title: 'Week 3-4: Selenium WebDriver Basics', content: 'Locators, element interaction, and browser handling.' },
      { title: 'Week 5-6: Framework Design', content: 'Building a robust testing framework (Page Object Model, Data-Driven).' },
      { title: 'Week 7-8: Advanced Selenium & CI/CD', content: 'Handling complex scenarios, grid, and Jenkins integration.' },
    ],
  },
  {
    id: '3',
    slug: 'api-testing-with-postman',
    title: 'API Testing with Postman',
    description: 'Become an expert in testing REST and SOAP APIs using Postman.',
    instructor: 'Alex Johnson',
    price: 79.99,
    duration: '4 Weeks',
    level: 'Intermediate',
    imageId: 'course-3-thumb',
    syllabus: [
        { title: 'Week 1: Understanding APIs', content: 'HTTP methods, status codes, and API architecture.' },
        { title: 'Week 2: Postman Fundamentals', content: 'Collections, requests, variables, and environments.' },
        { title: 'Week 3: Automated API Testing', content: 'Writing test scripts and assertions in Postman.' },
        { title: 'Week 4: Advanced Postman & Newman', content: 'Monitors, mock servers, and command-line execution with Newman.' },
    ],
  },
    {
    id: '4',
    slug: 'performance-testing-jmeter',
    title: 'Performance Testing with JMeter',
    description: 'Learn to identify and analyze performance bottlenecks with Apache JMeter.',
    instructor: 'Emily White',
    price: 89.99,
    duration: '5 Weeks',
    level: 'Advanced',
    imageId: 'course-4-thumb',
    syllabus: [
        { title: 'Week 1: Intro to Performance Testing', content: 'Types of performance tests, metrics, and goals.' },
        { title: 'Week 2: JMeter Deep Dive', content: 'Test plan elements, thread groups, samplers, and listeners.' },
        { title: 'Week 3: Scripting and Correlation', content: 'Recording scripts, handling dynamic values.' },
        { title: 'Week 4: Test Execution and Analysis', content: 'Running load tests and interpreting results.' },
        { title: 'Week 5: Advanced Topics', content: 'Distributed testing, plugins, and integration.' },
    ],
  },
];
