import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MajorSettings } from './MajorSettings';
import { Major } from '../types/major';
import { Plus, GraduationCap } from 'lucide-react';

interface RequirementCredits {
  [majorId: string]: { completed: number; total: number };
}

interface ScheduleHeaderProps {
  totalCredits: number;
  completedCredits: number;
  requirementCredits: RequirementCredits;
  majors: Major[];
  onAddSemester: (type: 'Fall' | 'Winter' | 'Spring' | 'Summer', year: number) => void;
  onUpdateMajor: (majorId: string, updates: Partial<Major>) => void;
  onAddMajor: (major: Major) => void;
  onRemoveMajor: (majorId: string) => void;
  onReorderMajors: (dragIndex: number, dropIndex: number) => void;
}

export function ScheduleHeader({ 
  totalCredits, 
  completedCredits, 
  requirementCredits,
  majors,
  onAddSemester,
  onUpdateMajor,
  onAddMajor,
  onRemoveMajor,
  onReorderMajors
}: ScheduleHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [semesterType, setSemesterType] = React.useState<'Fall' | 'Winter' | 'Spring' | 'Summer'>('Fall');
  const [year, setYear] = React.useState(new Date().getFullYear());

  const graduationPercentage = totalCredits > 0 ? (completedCredits / Math.max(totalCredits, 120)) * 100 : 0;

  const handleAddSemester = () => {
    onAddSemester(semesterType, year);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          Course Planner
        </h1>
        
        <div className="flex items-center gap-2">
          <MajorSettings
            majors={majors}
            onUpdateMajor={onUpdateMajor}
            onAddMajor={onAddMajor}
            onRemoveMajor={onRemoveMajor}
            onReorderMajors={onReorderMajors}
          />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Semester
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Semester</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="semester-type">Semester Type</Label>
                  <Select value={semesterType} onValueChange={(value: 'Fall' | 'Winter' | 'Spring' | 'Summer') => setSemesterType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fall">Fall</SelectItem>
                      <SelectItem value="Winter">Winter</SelectItem>
                      <SelectItem value="Spring">Spring</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    min="2020"
                    max="2030"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                  />
                </div>
                <Button onClick={handleAddSemester} className="w-full">
                  Add Semester
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {majors.map((major) => {
          const credits = requirementCredits[major.id] || { completed: 0, total: 0 };
          const percentage = credits.total > 0 ? (credits.completed / credits.total) * 100 : 0;
          
          return (
            <Card key={major.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{major.id} Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-2xl font-bold mb-2"
                  style={{ color: major.color }}
                >
                  {credits.completed}/{credits.total}
                </div>
                <Progress value={percentage} className="h-2 mb-2" />
                <div className="text-xs text-muted-foreground">
                  {major.name} ({Math.round(percentage)}%)
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Graduation Requirement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {completedCredits}/120
            </div>
            <Progress value={graduationPercentage} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">
              toward degree ({Math.round(graduationPercentage)}%)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}