// This file is machine-generated - edits will be lost.

'use server';

/**
 * @fileOverview AI-powered task suggestion flow.
 *
 * - suggestTasks - A function that suggests tasks based on the current day and time.
 * - SuggestTasksInput - The input type for the suggestTasks function.
 * - SuggestTasksOutput - The return type for the suggestTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTasksInputSchema = z.object({
  dayOfWeek: z.string().describe('The current day of the week.'),
  timeOfDay: z.string().describe('The current time of day (e.g., morning, afternoon, evening).'),
});
export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

const SuggestTasksOutputSchema = z.object({
  tasks: z.array(z.string()).describe('An array of suggested tasks for the to-do list.'),
});
export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  return suggestTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksInputSchema},
  output: {schema: SuggestTasksOutputSchema},
  prompt: `You are a helpful assistant that suggests tasks for a to-do list based on the current day and time.\n\nSuggest 5 tasks that are appropriate for the current day and time.\n\nDay of the week: {{{dayOfWeek}}}\nTime of day: {{{timeOfDay}}}\n\nTasks:`,
});

const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
