import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus, GraduationCap, BookOpen } from 'lucide-react';

interface ScheduleHeaderProps {
  totalCredits: number;
  completedCredits: number;
  onAddSemester: () => void;
}

export function ScheduleHeader({ totalCredits, completedCredits, onAddSemester }: ScheduleHeaderProps) {
  const progressPercentage = totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          Course Scheduler
        </h1>
        
        <Button onClick={onAddSemester} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Semester
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCredits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}