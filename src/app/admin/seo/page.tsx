import { KeywordRankTracker } from '@/components/admin/keyword-rank-tracker';
import { SeoAuditTool } from '@/components/admin/seo-audit-tool';

export default function SeoPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">SEO Tools</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <KeywordRankTracker />
        </div>
        <div>
            <SeoAuditTool />
        </div>
      </div>
    </div>
  );
}
