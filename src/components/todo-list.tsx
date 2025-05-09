"use client";

import type { Task } from '@/types';
import React, { useState, FormEvent } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoListProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

const TodoList: React.FC<TodoListProps> = ({ tasks, onTasksChange }) => {
  const [newTaskText, setNewTaskText] = useState<string>('');

  const addTask = (e: FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
    };
    onTasksChange([...tasks, newTask]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    onTasksChange(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    onTasksChange(tasks.filter(task => task.id !== id));
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center">
          <ListChecks className="w-8 h-8 mr-2" />
          To-Do List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addTask} className="flex space-x-2 mb-4">
          <Input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow"
            aria-label="New task input"
          />
          <Button type="submit" variant="default" aria-label="Add task">
            <Plus className="w-5 h-5" />
          </Button>
        </form>
        <ScrollArea className="h-[200px] pr-3">
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-center">No tasks yet. Add some!</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map(task => (
                <li
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-md bg-card hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      aria-labelledby={`task-label-${task.id}`}
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      id={`task-label-${task.id}`}
                      className={cn(
                        "text-sm cursor-pointer",
                        task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      )}
                    >
                      {task.text}
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    className="text-destructive hover:bg-destructive/10"
                    aria-label={`Delete task: ${task.text}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TodoList;
