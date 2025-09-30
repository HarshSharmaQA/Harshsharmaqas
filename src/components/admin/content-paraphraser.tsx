'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { paraphraseContent } from '@/ai/flows/content-paraphrasing';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Copy, Check } from 'lucide-react';

const formSchema = z.object({
  content: z.string().min(20, 'Content must be at least 20 characters long.'),
  numberOfVersions: z.coerce.number().min(1).max(5),
});

type FormValues = z.infer<typeof formSchema>;

export function ContentParaphraser() {
  const [paraphrased, setParaphrased] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedStates, setCopiedStates] = useState<boolean[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      numberOfVersions: 3,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);
    setParaphrased([]);
    try {
      const result = await paraphraseContent(values);
      if (result.paraphrasedVersions) {
        setParaphrased(result.paraphrasedVersions);
        setCopiedStates(new Array(result.paraphrasedVersions.length).fill(false));
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred while paraphrasing.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    const newCopiedStates = [...copiedStates];
    newCopiedStates[index] = true;
    setCopiedStates(newCopiedStates);
    setTimeout(() => {
        const resetCopiedStates = [...newCopiedStates];
        resetCopiedStates[index] = false;
        setCopiedStates(resetCopiedStates);
    }, 2000);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Content Paraphraser</CardTitle>
          <CardDescription>
            Enter your content below to generate unique, SEO-optimized versions.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your article, blog post, or paragraph here..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numberOfVersions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Versions</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of versions" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Generating...' : 'Paraphrase Content'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generated Versions</CardTitle>
          <CardDescription>
            Here are the unique versions of your content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="space-y-2">
                <div className="w-full h-20 bg-muted animate-pulse rounded-md"></div>
                <div className="w-full h-20 bg-muted animate-pulse rounded-md"></div>
                <div className="w-full h-20 bg-muted animate-pulse rounded-md"></div>
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {!isLoading && paraphrased.length === 0 && !error && (
            <p className="text-muted-foreground text-center">Results will appear here.</p>
          )}
          {paraphrased.map((version, index) => (
            <div key={index} className="relative rounded-md border p-4 bg-secondary/50">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => handleCopy(version, index)}
              >
                {copiedStates[index] ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              <p className="text-sm pr-8">{version}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
