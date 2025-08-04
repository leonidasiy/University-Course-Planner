import * as React from 'react';
import { Major } from '../types/major';
import { loadMajorSettings, saveMajorSettings } from '../services/majorApi';

const DEFAULT_MAJORS: Major[] = [
  { id: 'DSCT', name: 'Data Science & Technology', color: '#2563eb', display_order: 1 },
  { id: 'COSC', name: 'Computer Science', color: '#16a34a', display_order: 2 },
  { id: 'CCC', name: 'Common Core Courses', color: '#9333ea', display_order: 3 }
];

export function useMajorSettings() {
  const [majors, setMajors] = React.useState<Major[]>(DEFAULT_MAJORS);
  const [isLoading, setIsLoading] = React.useState(true);
  const [saveTimeout, setSaveTimeout] = React.useState<NodeJS.Timeout | null>(null);

  // Load majors on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading major settings...');
        const data = await loadMajorSettings();
        setMajors(data.length > 0 ? data : DEFAULT_MAJORS);
        console.log('Major settings loaded successfully');
      } catch (error) {
        console.error('Failed to load major settings, using defaults:', error);
        setMajors(DEFAULT_MAJORS);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-save function with debouncing
  const autoSave = React.useCallback((newMajors: Major[]) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        console.log('Auto-saving major settings...');
        await saveMajorSettings(newMajors);
        console.log('Auto-save completed successfully');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 1000); // Save 1 second after last change

    setSaveTimeout(timeout);
  }, [saveTimeout]);

  const updateMajors = React.useCallback((newMajors: Major[]) => {
    setMajors(newMajors);
    if (!isLoading) {
      autoSave(newMajors);
    }
  }, [autoSave, isLoading]);

  const updateMajor = React.useCallback((majorId: string, updates: Partial<Major>) => {
    const newMajors = majors.map(major =>
      major.id === majorId ? { ...major, ...updates } : major
    );
    updateMajors(newMajors);
  }, [majors, updateMajors]);

  const addMajor = React.useCallback((major: Major) => {
    const newMajors = [...majors, major];
    updateMajors(newMajors);
  }, [majors, updateMajors]);

  const removeMajor = React.useCallback((majorId: string) => {
    const newMajors = majors.filter(major => major.id !== majorId);
    updateMajors(newMajors);
  }, [majors, updateMajors]);

  const reorderMajors = React.useCallback((dragIndex: number, dropIndex: number) => {
    const newMajors = [...majors];
    const [draggedMajor] = newMajors.splice(dragIndex, 1);
    newMajors.splice(dropIndex, 0, draggedMajor);
    
    // Update display_order
    const updatedMajors = newMajors.map((major, index) => ({
      ...major,
      display_order: index + 1
    }));
    
    updateMajors(updatedMajors);
  }, [majors, updateMajors]);

  const getMajorColor = React.useCallback((majorId: string) => {
    const major = majors.find(m => m.id === majorId);
    return major?.color || '#6b7280';
  }, [majors]);

  const getMajorName = React.useCallback((majorId: string) => {
    const major = majors.find(m => m.id === majorId);
    return major?.name || majorId;
  }, [majors]);

  return {
    majors,
    isLoading,
    updateMajor,
    addMajor,
    removeMajor,
    reorderMajors,
    getMajorColor,
    getMajorName
  };
}