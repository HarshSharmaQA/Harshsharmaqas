'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const initialKeywords = [
  { keyword: 'QA', rank: 3, change: 1, volume: '12,100' },
  { keyword: 'manual tester', rank: 7, change: -2, volume: '8,100' },
  { keyword: 'website tester', rank: 5, change: 0, volume: '5,400' },
  { keyword: 'QA near me', rank: 12, change: 3, volume: '2,900' },
  { keyword: 'software testing courses', rank: 9, change: -1, volume: '1,900' },
];

function RankChange({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="flex items-center text-green-600">
        <ArrowUp className="h-4 w-4 mr-1" /> {change}
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="flex items-center text-red-600">
        <ArrowDown className="h-4 w-4 mr-1" /> {Math.abs(change)}
      </span>
    );
  }
  return (
    <span className="flex items-center text-muted-foreground">
      <Minus className="h-4 w-4 mr-1" />
    </span>
  );
}

export function KeywordRankTracker() {
  const [keywords, setKeywords] = useState(initialKeywords);

  useEffect(() => {
    const interval = setInterval(() => {
      setKeywords(prevKeywords =>
        prevKeywords.map(kw => {
          const rankChange = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
          const newRank = Math.max(1, kw.rank + rankChange);
          const change = newRank - kw.rank;
          
          return { ...kw, rank: newRank, change: change };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Keyword Rank Tracking</CardTitle>
        <CardDescription>Your website's current ranking on Google for target keywords.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead className="text-center">Current Rank</TableHead>
              <TableHead className="text-center">Change (7d)</TableHead>
              <TableHead className="text-right">Monthly Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((item) => (
              <TableRow key={item.keyword}>
                <TableCell className="font-medium">{item.keyword}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={item.rank <= 5 ? 'default' : 'secondary'} className="bg-primary/20 text-primary-foreground hover:bg-primary/30">
                    {item.rank}
                  </Badge>
                </TableCell>
                <TableCell className="text-center"><RankChange change={item.change} /></TableCell>
                <TableCell className="text-right">{item.volume}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
