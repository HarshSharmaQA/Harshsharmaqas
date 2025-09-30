import { ContentParaphraser } from '@/components/admin/content-paraphraser';

export default function ContentPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">Content Tools</h1>
      <ContentParaphraser />
    </div>
  );
}
