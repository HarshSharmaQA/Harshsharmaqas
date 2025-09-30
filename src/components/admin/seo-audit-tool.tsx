'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export function SeoAuditTool() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [seoScore, setSeoScore] = useState(0);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditComplete(false);
    
    // Simulate audit process
    const interval = setInterval(() => {
        setSeoScore(prev => Math.min(prev + Math.random() * 10, 87));
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setSeoScore(87); // Final mock score
      setIsAuditing(false);
      setAuditComplete(true);
    }, 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">SEO Audit Tool</CardTitle>
        <CardDescription>Analyze your website for on-page and off-page SEO issues.</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {!auditComplete && !isAuditing && (
          <Button onClick={handleRunAudit} disabled={isAuditing}>
            Run Audit
          </Button>
        )}
        {isAuditing && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p>Auditing your site... this may take a moment.</p>
            <Progress value={seoScore} className="w-full" />
          </div>
        )}
        {auditComplete && (
            <div className="space-y-4">
                <div className="relative mx-auto h-32 w-32">
                    <svg className="h-full w-full" viewBox="0 0 36 36">
                        <path
                        className="stroke-current text-gray-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                        />
                        <path
                        className="stroke-current text-primary"
                        strokeDasharray={`${seoScore}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold">{seoScore}</div>
                </div>
                <h3 className="text-xl font-semibold">Overall SEO Score</h3>
                <div className="grid grid-cols-2 gap-4 text-left pt-4">
                    <div className="flex items-start gap-2 rounded-md border p-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                        <div>
                            <h4 className="font-semibold">25 Passed Checks</h4>
                            <p className="text-xs text-muted-foreground">Your site is doing great in these areas.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-md border p-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-1 shrink-0" />
                        <div>
                            <h4 className="font-semibold">3 Issues Found</h4>
                            <p className="text-xs text-muted-foreground">Actionable items to improve your score.</p>
                        </div>
                    </div>
                </div>
                <Button onClick={handleRunAudit} variant="outline" className="mt-4">Re-run Audit</Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
