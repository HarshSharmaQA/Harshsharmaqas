'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertTriangle, FileWarning, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const mockIssues = [
  {
    title: 'Low Text-to-HTML Ratio',
    description: 'The amount of text on your homepage is low compared to the amount of code. Search engines may see this as "thin content".',
    priority: 'High',
  },
  {
    title: 'Missing Alt Text on 2 Images',
    description: 'Some images on your site are missing "alt" attributes, which hurts accessibility and image SEO.',
    priority: 'Medium',
  },
  {
    title: 'No H1 Tag on Contact Page',
    description: 'The main heading (H1) is missing from the contact page, which can impact how search engines understand the page structure.',
    priority: 'Low',
  },
];

export function SeoAuditTool() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [seoScore, setSeoScore] = useState(0);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditComplete(false);
    setSeoScore(0);
    
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
      <CardContent>
        {!auditComplete && !isAuditing && (
          <div className="text-center">
            <Button onClick={handleRunAudit} disabled={isAuditing}>
              Run Audit
            </Button>
          </div>
        )}
        {isAuditing && (
          <div className="space-y-4 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p>Auditing your site... this may take a moment.</p>
            <Progress value={seoScore} className="w-full" />
          </div>
        )}
        {auditComplete && (
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="issues">
                  Issues ({mockIssues.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <div className="space-y-4 text-center">
                    <div className="relative mx-auto h-32 w-32">
                        <svg className="h-full w-full" viewBox="0 0 36 36">
                            <path
                            className="stroke-current text-gray-200 dark:text-gray-700"
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
              </TabsContent>
              <TabsContent value="issues" className="mt-4">
                <div className="space-y-4">
                    {mockIssues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-3 rounded-md border p-4">
                            <FileWarning className="h-6 w-6 text-muted-foreground mt-1" />
                            <div className="flex-grow">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">{issue.title}</h4>
                                    <Badge 
                                        variant={issue.priority === 'High' ? 'destructive' : issue.priority === 'Medium' ? 'secondary' : 'outline'}
                                        className={issue.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : ''}
                                    >
                                        {issue.priority}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{issue.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
