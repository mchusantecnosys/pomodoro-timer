"use client";

import type { Task } from '@/types';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { suggestTasks, type SuggestTasksInput } from '@/ai/flows/suggest-tasks';
import { Sparkles, Loader2, PlusCircle, Brain } from 'lucide-react';

interface AiTaskSuggesterProps {
  onAddTask: (taskText: string) => void;
}

const AiTaskSuggester: React.FC<AiTaskSuggesterProps> = ({ onAddTask }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const getDayAndTime = (): SuggestTasksInput => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[now.getDay()];
    const hour = now.getHours();
    let timeOfDay = 'evening';
    if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    return { dayOfWeek, timeOfDay };
  };

  const handleSuggestTasks = async () => {
    setIsLoading(true);
    setSuggestedTasks([]);
    setIsDialogOpen(true);
    try {
      const input = getDayAndTime();
      const result = await suggestTasks(input);
      if (result.tasks && result.tasks.length > 0) {
        setSuggestedTasks(result.tasks);
      } else {
        toast({ title: "No suggestions found.", description: "AI couldn't come up with tasks right now.", variant: "default" });
      }
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      toast({ title: "Error", description: "Failed to get AI task suggestions.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestedTask = (taskText: string) => {
    onAddTask(taskText);
    setSuggestedTasks(prev => prev.filter(t => t !== taskText));
    toast({ title: "Task Added!", description: `"${taskText}" added to your to-do list.`, variant: "default" });
    if(suggestedTasks.length === 1) setIsDialogOpen(false); // Close if it was the last task
  };

  return (
    <div className="mt-6 flex justify-center">
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={handleSuggestTasks} className="border-accent text-accent hover:bg-accent hover:text-accent-foreground" aria-label="Suggest tasks with AI">
            <Sparkles className="mr-2 h-5 w-5" />
            AI Task Suggestions
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="mr-2 h-6 w-6 text-primary" /> AI Suggested Tasks
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Thinking...</p>
              </div>
            ) : suggestedTasks.length > 0 ? (
              <ScrollArea className="h-[200px] pr-3">
                <ul className="space-y-2">
                  {suggestedTasks.map((task, index) => (
                    <li key={index} className="flex items-center justify-between p-2 rounded-md bg-card hover:bg-secondary/50 transition-colors">
                      <span className="text-sm text-foreground">{task}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddSuggestedTask(task)}
                        className="text-accent hover:text-accent-foreground"
                        aria-label={`Add task: ${task}`}
                      >
                        <PlusCircle className="w-5 h-5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-center">No suggestions available at the moment.</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AiTaskSuggester;
