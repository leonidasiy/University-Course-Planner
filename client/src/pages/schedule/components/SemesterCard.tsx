import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseItem } from './CourseItem';
import { Semester, Course } from '../types/schedule';
import { Trash2, Calendar } from 'lucide-react';

interface SemesterCardProps {
  semester: Semester;
  onRemove: (semesterId: string) => void;
  onAddCourse: (semesterId: string, course: Course) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  onMoveCourse: (fromSemesterId: string, toSemesterId: string, courseId: string) => void;
}

export function SemesterCard({
  semester,
  onRemove,
  onAddCourse,
  onRemoveCourse,
  onMoveCourse
}: SemesterCardProps) {
  const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);

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
  };

  return (
    <Card
      className="transition-colors hover:bg-accent/50"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {semester.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {totalCredits} credits
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveClick}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {semester.courses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
            Drag courses here to add them to this semester
          </div>
        ) : (
          <div className="space-y-2">
            {semester.courses.map((course) => (
              <CourseItem
                key={course.id}
                course={course}
                semesterId={semester.id}
                onRemove={onRemoveCourse}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}