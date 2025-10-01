
import type { Course } from '@/lib/mock-data';

export function CourseDetails({ course }: { course: Course }) {
  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
    </div>
  );
}
