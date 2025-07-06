import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CourseItem } from './CourseItem';
import { CourseFilters } from './CourseFilters';
import { Course } from '../types/schedule';
import { Plus, Library } from 'lucide-react';

interface CourseLibraryProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onRemoveCourse: (courseId: string) => void;
  onToggleCompletion: (courseId: string) => void;
}

export function CourseLibrary({ courses, onAddCourse, onRemoveCourse, onToggleCompletion }: CourseLibraryProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRequirements, setSelectedRequirements] = React.useState<string[]>([]);
  const [showCompleted, setShowCompleted] = React.useState(true);
  const [showIncomplete, setShowIncomplete] = React.useState(true);
  const [newCourse, setNewCourse] = React.useState({
    code: '',
    name: '',
    credits: 3,
    majorRequirements: [] as ('DSCT' | 'COSC' | 'CCC')[],
    isCompleted: false
  });

  const handleAddCourse = () => {
    if (newCourse.code && newCourse.name) {
      const course: Course = {
        id: Date.now().toString(),
        code: newCourse.code,
        name: newCourse.name,
        credits: newCourse.credits,
        majorRequirements: newCourse.majorRequirements,
        isCompleted: newCourse.isCompleted
      };
      onAddCourse(course);
      setNewCourse({ code: '', name: '', credits: 3, majorRequirements: [], isCompleted: false });
      setIsDialogOpen(false);
    }
  };

  const handleRequirementToggle = (requirement: 'DSCT' | 'COSC' | 'CCC') => {
    if (newCourse.majorRequirements.includes(requirement)) {
      setNewCourse({
        ...newCourse,
        majorRequirements: newCourse.majorRequirements.filter(req => req !== requirement)
      });
    } else {
      setNewCourse({
        ...newCourse,
        majorRequirements: [...newCourse.majorRequirements, requirement]
      });
    }
  };

  const filteredCourses = React.useMemo(() => {
    return courses.filter(course => {
      // Filter by completion status
      if (!showCompleted && course.isCompleted) return false;
      if (!showIncomplete && !course.isCompleted) return false;

      // Filter by requirements
      if (selectedRequirements.length === 0) return true;

      if (selectedRequirements.includes('NONE') && course.majorRequirements.length === 0) {
        return true;
      }

      return selectedRequirements.some(req => 
        req !== 'NONE' && course.majorRequirements.includes(req as 'DSCT' | 'COSC' | 'CCC')
      );
    });
  }, [courses, selectedRequirements, showCompleted, showIncomplete]);

  return (
    <div className="space-y-4">
      <CourseFilters
        selectedRequirements={selectedRequirements}
        onRequirementsChange={setSelectedRequirements}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        showIncomplete={showIncomplete}
        onShowIncompleteChange={setShowIncomplete}
      />

      <Card className="flex flex-col h-[600px]">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Library className="h-5 w-5" />
              Course Library ({filteredCourses.length})
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
                    <Label>Major Requirements (select multiple)</Label>
                    <div className="space-y-2 mt-2">
                      {['DSCT', 'COSC', 'CCC'].map((req) => (
                        <div key={req} className="flex items-center space-x-2">
                          <Checkbox
                            id={`new-${req}`}
                            checked={newCourse.majorRequirements.includes(req as 'DSCT' | 'COSC' | 'CCC')}
                            onCheckedChange={() => handleRequirementToggle(req as 'DSCT' | 'COSC' | 'CCC')}
                          />
                          <label htmlFor={`new-${req}`} className="text-sm">
                            {req} ({req === 'DSCT' ? 'Data Science and Technology' : 
                                   req === 'COSC' ? 'Computer Science' : 'Common Core Courses'})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="completed"
                      checked={newCourse.isCompleted}
                      onCheckedChange={(checked) => setNewCourse({ ...newCourse, isCompleted: !!checked })}
                    />
                    <label htmlFor="completed" className="text-sm">
                      Mark as completed
                    </label>
                  </div>
                  <Button onClick={handleAddCourse} className="w-full">
                    Add Course
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No courses match the current filters.
              </div>
            ) : (
              <div className="space-y-2 pr-2">
                {filteredCourses.map((course) => (
                  <CourseItem
                    key={course.id}
                    course={course}
                    onRemoveFromLibrary={onRemoveCourse}
                    onToggleCompletion={onToggleCompletion}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}