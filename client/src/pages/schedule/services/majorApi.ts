import { Major } from '../types/major';

const API_BASE = '/api/majors';

export async function loadMajorSettings(): Promise<Major[]> {
  try {
    console.log('Loading major settings from API...');
    const response = await fetch(API_BASE);
    
    if (!response.ok) {
      throw new Error(`Failed to load major settings: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Major settings loaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error loading major settings:', error);
    throw error;
  }
}

export async function saveMajorSettings(majors: Major[]): Promise<void> {
  try {
    console.log('Saving major settings to API...', majors);
    const response = await fetch(API_BASE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ majors }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save major settings: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Major settings saved successfully:', result);
  } catch (error) {
    console.error('Error saving major settings:', error);
    throw error;
  }
}