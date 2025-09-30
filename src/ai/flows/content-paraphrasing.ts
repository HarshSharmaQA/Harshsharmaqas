'use server';

/**
 * @fileOverview This file defines a Genkit flow for paraphrasing content to improve SEO and reduce plagiarism.
 *
 * It includes:
 * - `paraphraseContent` -  The main function to paraphrase content.
 * - `ParaphraseContentInput` - The input type for the paraphraseContent function.
 * - `ParaphraseContentOutput` - The output type for the paraphraseContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParaphraseContentInputSchema = z.object({
  content: z
    .string()
    .describe('The content to paraphrase.'),
  numberOfVersions: z
    .number()
    .min(1)
    .max(5)
    .default(3)
    .describe('The number of paraphrased versions to generate.'),
});
export type ParaphraseContentInput = z.infer<typeof ParaphraseContentInputSchema>;

const ParaphraseContentOutputSchema = z.object({
  paraphrasedVersions: z.array(
    z.string().describe('A paraphrased version of the input content.')
  ).describe('An array of paraphrased content versions.'),
});
export type ParaphraseContentOutput = z.infer<typeof ParaphraseContentOutputSchema>;

export async function paraphraseContent(input: ParaphraseContentInput): Promise<ParaphraseContentOutput> {
  return paraphraseContentFlow(input);
}

const paraphraseContentPrompt = ai.definePrompt({
  name: 'paraphraseContentPrompt',
  input: {schema: ParaphraseContentInputSchema},
  output: {schema: ParaphraseContentOutputSchema},
  prompt: `You are an expert SEO content writer. Your goal is to provide multiple unique versions of content, optimized for search engines and avoiding plagiarism. Create the requested number of content version. Each version should be unique from the others.

Original Content: {{{content}}}

Number of Versions: {{{numberOfVersions}}}

Paraphrased Versions:`, // The models will automatically generate a JSON array here of strings because of the output schema
});

const paraphraseContentFlow = ai.defineFlow(
  {
    name: 'paraphraseContentFlow',
    inputSchema: ParaphraseContentInputSchema,
    outputSchema: ParaphraseContentOutputSchema,
  },
  async input => {
    const {output} = await paraphraseContentPrompt(input);
    return output!;
  }
);
