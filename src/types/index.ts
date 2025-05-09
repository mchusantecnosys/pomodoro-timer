export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface PomodoroSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  cyclesPerRound: number; // Number of focus sessions before a long break
}

export type PomodoroSessionType = 'focus' | 'shortBreak' | 'longBreak';
