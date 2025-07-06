import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Course } from '../types/schedule';
import { GripVertical, X } from 'lucide-react';

interface CourseItemProps {
  course: Course;
  semesterId?: string;
  onRemove?: (semesterId: string, courseId: string) => void;
  onRemoveFromLibrary?: (courseId: string) => void;
  onToggleCompletion?: (courseId: string) => void;
}

export function CourseItem({ 
  course, 
  semesterId, 
  onRemove, 
  onRemoveFromLibrary, 
  onToggleCompletion 
}: CourseItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    const dragData = {
      type: 'course',
      courseId: course.id,
      course: course,
      fromSemester: semesterId || null
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRemoveClick = () => {
    if (semesterId && onRemove) {
      onRemove(semesterId, course.id);
    } else if (onRemoveFromLibrary) {
      onRemoveFromLibrary(course.id);
    }
  };

  const handleCompletionToggle = () => {
    if (onToggleCompletion) {
      onToggleCompletion(course.id);
    }
  };

  const getMajorRequirementBadges = () => {
    if (course.majorRequirements.length === 0) return null;
    
    const colors = {
      DSCT: 'text-blue-600 border-blue-600 bg-blue-50',
      COSC: 'text-green-600 border-green-600 bg-green-50',
      CCC: 'text-purple-600 border-purple-600 bg-purple-50'
    };

    return course.majorRequirements.map((req) => (
      <Badge key={req} variant="outline" className={colors[req]}>
        {req}
      </Badge>
    ));
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className={`cursor-move hover:shadow-md transition-shadow ${
        course.isCompleted ? 'bg-green-50 border-green-200' : ''
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              {onToggleCompletion && (
                <Checkbox
                  checked={course.isCompleted}
                  onCheckedChange={handleCompletionToggle}
                />
              )}
              <div>
                <div className={`font-medium ${course.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                  {course.code}
                </div>
                <div className={`text-sm ${course.isCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                  {course.name}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getMajorRequirementBadges()}
            <Badge variant="outline">
              {course.credits} credits
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveClick}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}