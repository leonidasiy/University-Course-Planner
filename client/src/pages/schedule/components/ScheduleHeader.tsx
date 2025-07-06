import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, GraduationCap } from 'lucide-react';

interface RequirementCredits {
  dsct: { completed: number; total: number };
  cosc: { completed: number; total: number };
  ccc: { completed: number; total: number };
}

interface ScheduleHeaderProps {
  totalCredits: number;
  completedCredits: number;
  requirementCredits: RequirementCredits;
  onAddSemester: (type: 'Fall' | 'Winter' | 'Spring' | 'Summer', year: number) => void;
}

export function ScheduleHeader({ 
  totalCredits, 
  completedCredits, 
  requirementCredits,
  onAddSemester 
}: ScheduleHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [semesterType, setSemesterType] = React.useState<'Fall' | 'Winter' | 'Spring' | 'Summer'>('Fall');
  const [year, setYear] = React.useState(new Date().getFullYear());

  const progressPercentage = totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0;

  const handleAddSemester = () => {
    onAddSemester(semesterType, year);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          Course Scheduler
        </h1>
        
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedCredits}/{totalCredits}
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              credits ({Math.round(progressPercentage)}%)
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">DSCT Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {requirementCredits.dsct.completed}/{requirementCredits.dsct.total}
            </div>
            <div className="text-xs text-muted-foreground">
              Data Science & Technology
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">COSC Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {requirementCredits.cosc.completed}/{requirementCredits.cosc.total}
            </div>
            <div className="text-xs text-muted-foreground">
              Computer Science
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">CCC Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {requirementCredits.ccc.completed}/{requirementCredits.ccc.total}
            </div>
            <div className="text-xs text-muted-foreground">
              Common Core Courses
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedCredits}/120
            </div>
            <div className="text-xs text-muted-foreground">
              toward degree
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}