import { useState, useEffect } from 'react';

// Interface for tracking user activity
export interface UserActivity {
  id: string;
  type: 'view' | 'complete' | 'start' | 'interact' | 'enroll';
  contentId: number | string;
  contentType: 'course' | 'quiz' | 'page' | 'learning-path';
  contentTitle: string;
  timestamp: Date;
  progress?: number;
  duration?: number;
}

// Session storage key
const ACTIVITY_STORAGE_KEY = 'trenning_lms_user_activity';

// Function to track a new activity
export const trackActivity = (
  type: UserActivity['type'],
  contentId: UserActivity['contentId'],
  contentType: UserActivity['contentType'],
  contentTitle: string,
  progress?: number,
  duration?: number
): UserActivity => {
  const activity: UserActivity = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type,
    contentId,
    contentType,
    contentTitle,
    timestamp: new Date(),
    progress,
    duration
  };

  // Store activity in session storage
  try {
    const existingActivities = getActivities();
    const updatedActivities = [activity, ...existingActivities];
    
    // Limit to the last 100 activities to avoid storage issues
    const limitedActivities = updatedActivities.slice(0, 100);
    
    sessionStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(limitedActivities));
    
    // Dispatch custom event for real-time tracking
    window.dispatchEvent(new CustomEvent('user-activity', { detail: activity }));
  } catch (error) {
    console.error('Failed to store activity:', error);
  }

  return activity;
};

// Function to get all tracked activities
export const getActivities = (): UserActivity[] => {
  try {
    const storedActivities = sessionStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (storedActivities) {
      return JSON.parse(storedActivities);
    }
  } catch (error) {
    console.error('Failed to retrieve activities:', error);
  }
  
  return [];
};

// Custom hook to track page views
export const usePageView = (contentId: number | string, contentType: UserActivity['contentType'], contentTitle: string) => {
  useEffect(() => {
    trackActivity('view', contentId, contentType, contentTitle);
    
    // Cleanup function - could potentially track time spent on page
    return () => {
      // Optional: track exit event
    };
  }, [contentId, contentType, contentTitle]);
};

// Custom hook for tracking course progress
export const useTrackProgress = () => {
  const [currentProgress, setCurrentProgress] = useState<{
    courseId: number | string;
    progress: number;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (currentProgress) {
      trackActivity(
        'interact',
        currentProgress.courseId,
        'course',
        currentProgress.title,
        currentProgress.progress
      );
    }
  }, [currentProgress]);

  return setCurrentProgress;
};

// Calculate user stats based on activities
export const calculateUserStats = () => {
  const activities = getActivities();
  
  // Total learning time in minutes
  const totalLearningTime = activities
    .filter(a => a.duration)
    .reduce((total, activity) => total + (activity.duration || 0), 0);
  
  // Completed courses count
  const completedCoursesCount = new Set(
    activities
      .filter(a => a.type === 'complete' && a.contentType === 'course')
      .map(a => a.contentId)
  ).size;
  
  // Active course count
  const activeCoursesCount = new Set(
    activities
      .filter(a => ['start', 'interact'].includes(a.type) && a.contentType === 'course')
      .map(a => a.contentId)
  ).size;
  
  return {
    totalLearningTime,
    completedCoursesCount,
    activeCoursesCount,
    lastActivity: activities[0]?.timestamp
  };
};

// Function to get time-specific greeting
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
};

// Update user streak
export const updateStreak = (): { days: number, dates: string } => {
  const today = new Date().toISOString().split('T')[0];
  const STREAK_KEY = 'trenning_lms_streak';
  
  try {
    // Get existing streak data
    const streakData = localStorage.getItem(STREAK_KEY);
    let streak = streakData ? JSON.parse(streakData) : { days: 0, lastVisit: '', startDate: today };
    
    if (streak.lastVisit !== today) {
      // Check if this is consecutive day
      const lastDate = new Date(streak.lastVisit);
      const currentDate = new Date(today);
      const dayDifference = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDifference === 1) {
        // Consecutive day
        streak.days += 1;
      } else if (dayDifference > 1) {
        // Streak broken, start over
        streak = { days: 1, lastVisit: today, startDate: today };
      }
      
      streak.lastVisit = today;
      
      // Update streak in storage
      localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
    }
    
    // Format dates for display
    const startDate = new Date(streak.days > 1 ? streak.startDate : today);
    const formattedStartDate = startDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: '2-digit' });
    const formattedEndDate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: '2-digit' });
    
    return {
      days: streak.days,
      dates: `${formattedStartDate} - ${formattedEndDate}`
    };
  } catch (error) {
    console.error('Failed to update streak:', error);
    return { days: 0, dates: '' };
  }
}; 