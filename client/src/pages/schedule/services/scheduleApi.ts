import { ScheduleData } from '../types/schedule';

const API_BASE = '/api/schedule';

export async function loadScheduleData(): Promise<ScheduleData> {
  try {
    console.log('Loading schedule data from API...');
    const response = await fetch(`${API_BASE}/data`);
    
    if (!response.ok) {
      throw new Error(`Failed to load schedule data: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Schedule data loaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error loading schedule data:', error);
    throw error;
  }
}

export async function saveScheduleData(data: ScheduleData): Promise<void> {
  try {
    console.log('Saving schedule data to API...', data);
    const response = await fetch(`${API_BASE}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save schedule data: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Schedule data saved successfully:', result);
  } catch (error) {
    console.error('Error saving schedule data:', error);
    throw error;
  }
}