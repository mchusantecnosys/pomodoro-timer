"use client";

import type { PomodoroSettings, PomodoroSessionType } from '@/types';
import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, RotateCcw, Settings2, SkipForward, TimerIcon } from 'lucide-react';

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesPerRound: 4,
};

const PomodoroTimer: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomodoroSettings', DEFAULT_SETTINGS);
  const [currentSessionType, setCurrentSessionType] = useLocalStorage<PomodoroSessionType>('pomodoroSessionType', 'focus');
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.focusDuration * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [cyclesCompletedThisRound, setCyclesCompletedThisRound] = useLocalStorage<number>('pomodoroCycles', 0);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<PomodoroSettings>(settings);

  const { toast } = useToast();

  const getDuration = useCallback((sessionType: PomodoroSessionType): number => {
    switch (sessionType) {
      case 'focus': return settings.focusDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
      default: return settings.focusDuration * 60;
    }
  }, [settings]);

  useEffect(() => {
    setTimeRemaining(getDuration(currentSessionType));
  }, [settings, currentSessionType, getDuration]);
  
  useEffect(() => {
    setTempSettings(settings); // Sync tempSettings when actual settings change
  }, [settings]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isRunning && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (isRunning && timeRemaining === 0) {
      handleSessionEnd();
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeRemaining]);


  const handleSessionEnd = () => {
    setIsRunning(false);
    let nextSessionType: PomodoroSessionType = 'focus';
    let newCyclesCompleted = cyclesCompletedThisRound;

    if (currentSessionType === 'focus') {
      newCyclesCompleted++;
      setCyclesCompletedThisRound(newCyclesCompleted);
      if (newCyclesCompleted >= settings.cyclesPerRound) {
        nextSessionType = 'longBreak';
        setCyclesCompletedThisRound(0); // Reset for next round
      } else {
        nextSessionType = 'shortBreak';
      }
    } else { // shortBreak or longBreak ended
      nextSessionType = 'focus';
    }
    
    toast({
      title: `${currentSessionType.charAt(0).toUpperCase() + currentSessionType.slice(1)} ended!`,
      description: `Time for ${nextSessionType === 'focus' ? 'Focus' : 'a Break'}.`,
      variant: "default",
    });
    
    setCurrentSessionType(nextSessionType);
    setTimeRemaining(getDuration(nextSessionType));
  };

  const toggleTimer = () => setIsRunning(prev => !prev);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(getDuration(currentSessionType));
  };

  const skipSession = () => {
    handleSessionEnd();
  };

  const handleSettingsSave = () => {
    setSettings(tempSettings);
    // If current session duration changed, update timer
    if (
        (currentSessionType === 'focus' && tempSettings.focusDuration !== settings.focusDuration) ||
        (currentSessionType === 'shortBreak' && tempSettings.shortBreakDuration !== settings.shortBreakDuration) ||
        (currentSessionType === 'longBreak' && tempSettings.longBreakDuration !== settings.longBreakDuration)
    ) {
        setTimeRemaining(getDuration(currentSessionType)); // This will use new settings as getDuration depends on 'settings' which will be updated
    }
    setIsSettingsDialogOpen(false);
    toast({ title: "Settings Saved!", variant: "default" });
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (getDuration(currentSessionType) - timeRemaining) / getDuration(currentSessionType) * 100;

  const sessionTitles: Record<PomodoroSessionType, string> = {
    focus: "Focus Time",
    shortBreak: "Short Break",
    longBreak: "Long Break",
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center">
          <TimerIcon className="w-8 h-8 mr-2" />
          {sessionTitles[currentSessionType]}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="text-7xl font-mono font-bold text-foreground tabular-nums">
          {formatTime(timeRemaining)}
        </div>
        <Progress value={progressPercentage} className="w-full h-3" />
        <div className="flex space-x-3 w-full justify-center">
          <Button onClick={toggleTimer} variant={isRunning ? "outline" : "default"} className="w-28" aria-label={isRunning ? "Pause timer" : "Start timer"}>
            {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="outline" className="w-28" aria-label="Reset timer">
            <RotateCcw className="mr-2" /> Reset
          </Button>
        </div>
        <Button onClick={skipSession} variant="ghost" className="text-accent hover:text-accent-foreground" aria-label="Skip current session">
          <SkipForward className="mr-2" /> Skip Session
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" aria-label="Open settings">
              <Settings2 className="mr-2" /> Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Pomodoro Settings</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="focusDuration" className="text-right col-span-2">Focus (min)</Label>
                <Input id="focusDuration" type="number" value={tempSettings.focusDuration} onChange={(e) => setTempSettings(s => ({...s, focusDuration: parseInt(e.target.value) || 1}))} className="col-span-2" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shortBreakDuration" className="text-right col-span-2">Short Break (min)</Label>
                <Input id="shortBreakDuration" type="number" value={tempSettings.shortBreakDuration} onChange={(e) => setTempSettings(s => ({...s, shortBreakDuration: parseInt(e.target.value) || 1}))} className="col-span-2" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="longBreakDuration" className="text-right col-span-2">Long Break (min)</Label>
                <Input id="longBreakDuration" type="number" value={tempSettings.longBreakDuration} onChange={(e) => setTempSettings(s => ({...s, longBreakDuration: parseInt(e.target.value) || 1}))} className="col-span-2" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cyclesPerRound" className="text-right col-span-2">Cycles per Round</Label>
                <Input id="cyclesPerRound" type="number" value={tempSettings.cyclesPerRound} onChange={(e) => setTempSettings(s => ({...s, cyclesPerRound: parseInt(e.target.value) || 1}))} className="col-span-2" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleSettingsSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default PomodoroTimer;
