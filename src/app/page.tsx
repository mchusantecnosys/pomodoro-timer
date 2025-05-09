"use client";

import React from 'react';
import PomodoroTimer from '@/components/pomodoro-timer';
import TodoList from '@/components/todo-list';
import AiTaskSuggester from '@/components/ai-task-suggester';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Task } from '@/types';
import { Timer } from 'lucide-react'; // Changed from TimerIcon to Timer as per lucide-react

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('todoTasks', []);

  const handleAddTaskFromSuggestion = (taskText: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text: taskText,
      completed: false,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-primary flex items-center justify-center">
          <Timer className="w-12 h-12 mr-3" /> TomatoFocus
        </h1>
        <p className="text-lg text-muted-foreground mt-2">Boost your productivity, one tomato at a time.</p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="pomodoro-section flex justify-center lg:justify-end">
          <PomodoroTimer />
        </section>
        <section className="todo-section flex flex-col items-center lg:items-start">
          <TodoList tasks={tasks} onTasksChange={setTasks} />
          <AiTaskSuggester onAddTask={handleAddTaskFromSuggestion} />
        </section>
      </main>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TomatoFocus. Stay focused!</p>
      </footer>
    </div>
  );
}
