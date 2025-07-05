import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CourseItem } from './CourseItem';
import { Course } from '../types/schedule';
import { Plus, Library } from 'lucide-react';

interface CourseLibraryProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onRemoveCourse: (courseId: string) => void;
}

export function CourseLibrary({ courses, onAddCourse, onRemoveCourse }: CourseLibraryProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newCourse, setNewCourse] = React.useState({
    code: '',
    name: '',
    credits: 3,
    majorRequirement: null as 'DSCT' | 'COSC' | null
  });

  const handleAddCourse = () => {
    if (newCourse.code && newCourse.name) {
      const course: Course = {
        id: Date.now().toString(),
        code: newCourse.code,
        name: newCourse.name,
        credits: newCourse.credits,
        majorRequirement: newCourse.majorRequirement
      };
      onAddCourse(course);
      setNewCourse({ code: '', name: '', credits: 3, majorRequirement: null });
      setIsDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Library className="h-5 w-5" />
            Course Library
          </CardTitle>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course-code">Course Code</Label>
                  <Input
                    id="course-code"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    placeholder="e.g., CS101"
                  />
                </div>
                <div>
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input
                    id="course-name"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>
                <div>
                  <Label htmlFor="course-credits">Credits</Label>
                  <Input
                    id="course-credits"
                    type="number"
                    min="1"
                    max="6"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 3 })}
                  />
                </div>
                <div>
                  <Label htmlFor="major-requirement">Major Requirement</Label>
                  <Select 
                    value={newCourse.majorRequirement || ''} 
                    onValueChange={(value) => setNewCourse({ 
                      ...newCourse, 
                      majorRequirement: value === '' ? null : value as 'DSCT' | 'COSC' 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select major requirement (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="DSCT">DSCT (Data Science Computing Technology)</SelectItem>
                      <SelectItem value="COSC">COSC (Computer Science)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddCourse} className="w-full">
                  Add Course
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {courses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No courses in library. Add some courses to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course) => (
              <CourseItem
                key={course.id}
                course={course}
                onRemoveFromLibrary={onRemoveCourse}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}