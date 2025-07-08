import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CourseItem } from './CourseItem';
import { Semester, Course } from '../types/schedule';
import { Trash2, Calendar, Sun, Flower, Leaf, Plus, Eraser } from 'lucide-react';

interface SemesterCardProps {
  semester: Semester;
  availableCourses: Course[];
  onRemove: (semesterId: string) => void;
  onClearCourses: (semesterId: string) => void;
  onAddCourse: (semesterId: string, course: Course) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  onMoveCourse: (fromSemesterId: string, toSemesterId: string, courseId: string) => void;
  onToggleCompletion: (courseId: string) => void;
}

const getSemesterIcon = (type: string) => {
  switch (type) {
    case 'Fall':
      return <Leaf className="h-5 w-5 text-orange-600" />;
    case 'Spring':
      return <Flower className="h-5 w-5 text-green-600" />;
    case 'Summer':
      return <Sun className="h-5 w-5 text-yellow-600" />;
    default:
      return <Calendar className="h-5 w-5" />;
  }
};

const getSemesterColor = (type: string) => {
  switch (type) {
    case 'Fall':
      return 'border-l-orange-500';
    case 'Spring':
      return 'border-l-green-500';
    case 'Summer':
      return 'border-l-yellow-500';
    default:
      return 'border-l-gray-500';
  }
};

// Define required semesters that cannot be deleted
const REQUIRED_SEMESTER_IDS = [
  'semester_2024_fall',
  'semester_2025_spring', 
  'semester_2025_fall',
  'semester_2026_spring',
  'semester_2026_fall',
  'semester_2027_spring',
  'semester_2027_fall',
  'semester_2028_spring'
];

export function SemesterCard({
  semester,
  availableCourses,
  onRemove,
  onClearCourses,
  onAddCourse,
  onRemoveCourse,
  onMoveCourse,
  onToggleCompletion
}: SemesterCardProps) {
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>('');
  const [clearDialogOpen, setClearDialogOpen] = React.useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);

  const isRequiredSemester = REQUIRED_SEMESTER_IDS.includes(semester.id);

  const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
  const completedCredits = semester.courses
    .filter(course => course.isCompleted)
    .reduce((sum, course) => sum + course.credits, 0);
  
  // Calculate requirement credits for this semester only
  const dsctCompletedCredits = semester.courses
    .filter(course => course.isCompleted && course.majorRequirements.includes('DSCT'))
    .reduce((sum, course) => sum + course.credits, 0);
  const dsctTotalCredits = semester.courses
    .filter(course => course.majorRequirements.includes('DSCT'))
    .reduce((sum, course) => sum + course.credits, 0);

  const coscCompletedCredits = semester.courses
    .filter(course => course.isCompleted && course.majorRequirements.includes('COSC'))
    .reduce((sum, course) => sum + course.credits, 0);
  const coscTotalCredits = semester.courses
    .filter(course => course.majorRequirements.includes('COSC'))
    .reduce((sum, course) => sum + course.credits, 0);

  const cccCompletedCredits = semester.courses
    .filter(course => course.isCompleted && course.majorRequirements.includes('CCC'))
    .reduce((sum, course) => sum + course.credits, 0);
  const cccTotalCredits = semester.courses
    .filter(course => course.majorRequirements.includes('CCC'))
    .reduce((sum, course) => sum + course.credits, 0);

  const courseOptions = availableCourses.map(course => {
    const reqText = course.majorRequirements.length > 0 
      ? ` [${course.majorRequirements.join(', ')}]` 
      : '';
    return {
      value: course.id,
      label: `${course.code} - ${course.name} (${course.credits} credits)${reqText}`
    };
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dragData = e.dataTransfer.getData('application/json');
    const data = JSON.parse(dragData);
    
    if (data.type === 'course') {
      if (data.fromSemester) {
        onMoveCourse(data.fromSemester, semester.id, data.courseId);
      } else {
        onAddCourse(semester.id, data.course);
      }
    }
  };

  const handleRemoveClick = () => {
    onRemove(semester.id);
    setRemoveDialogOpen(false);
  };

  const handleClearCoursesClick = () => {
    onClearCourses(semester.id);
    setClearDialogOpen(false);
  };

  const handleAddCourseFromDropdown = () => {
    if (selectedCourseId) {
      const course = availableCourses.find(c => c.id === selectedCourseId);
      if (course) {
        onAddCourse(semester.id, course);
        setSelectedCourseId('');
      }
    }
  };

  const handleComboboxValueChange = (value: string) => {
    setSelectedCourseId(value);
  };

  return (
    <Card
      className={`transition-colors hover:bg-accent/50 border-l-4 ${getSemesterColor(semester.type)}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getSemesterIcon(semester.type)}
            {semester.type} {semester.year}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {completedCredits}/{totalCredits} credits
            </Badge>
            {dsctTotalCredits > 0 && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {dsctCompletedCredits}/{dsctTotalCredits} DSCT
              </Badge>
            )}
            {coscTotalCredits > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                {coscCompletedCredits}/{coscTotalCredits} COSC
              </Badge>
            )}
            {cccTotalCredits > 0 && (
              <Badge variant="outline" className="text-purple-600 border-purple-600">
                {cccCompletedCredits}/{cccTotalCredits} CCC
              </Badge>
            )}
            
            {semester.courses.length > 0 && (
              <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Clear all courses"
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear All Courses</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>Are you sure you want to remove all courses from {semester.name}?</p>
                    <p className="text-sm text-muted-foreground">
                      This will move all {semester.courses.length} course{semester.courses.length !== 1 ? 's' : ''} back to the course library.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleClearCoursesClick}>
                        Clear All Courses
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            {!isRequiredSemester && (
              <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Remove semester"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Semester</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>Are you sure you want to delete {semester.name}?</p>
                    {semester.courses.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        This semester contains {semester.courses.length} course{semester.courses.length !== 1 ? 's' : ''}. 
                        All courses will be moved back to the course library.
                      </p>
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleRemoveClick}>
                        Delete Semester
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {availableCourses.length > 0 && (
          <div className="flex gap-2">
            <Combobox
              options={courseOptions}
              value={selectedCourseId}
              onValueChange={handleComboboxValueChange}
              placeholder="Select a course to add..."
              searchPlaceholder="Search courses by code or name..."
              emptyText="No courses found."
              className="flex-1"
            />
            <Button
              onClick={handleAddCourseFromDropdown}
              disabled={!selectedCourseId}
              size="sm"
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {semester.courses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
            {availableCourses.length > 0 
              ? "Add courses using the dropdown above or drag courses here"
              : "No courses available to add"
            }
          </div>
        ) : (
          <div className="space-y-2">
            {semester.courses.map((course) => (
              <CourseItem
                key={course.id}
                course={course}
                semesterId={semester.id}
                onRemove={onRemoveCourse}
                onToggleCompletion={onToggleCompletion}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}