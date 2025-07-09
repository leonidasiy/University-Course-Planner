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
  isSelected?: boolean;
  onSelect?: (courseId: string, isSelected: boolean) => void;
  onRemove?: (semesterId: string, courseId: string) => void;
  onRemoveFromLibrary?: (courseId: string) => void;
  onToggleCompletion?: (courseId: string) => void;
}

export function CourseItem({ 
  course, 
  semesterId, 
  isSelected = false,
  onSelect,
  onRemove, 
  onRemoveFromLibrary, 
  onToggleCompletion 
}: CourseItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    const dragData = {
      type: 'course',
      courseId: course.id,
      course: course,
      fromSemester: semesterId || null,
      isMultiSelect: isSelected
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (semesterId && onRemove) {
      onRemove(semesterId, course.id);
    } else if (onRemoveFromLibrary) {
      onRemoveFromLibrary(course.id);
    }
  };

  const handleCompletionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCompletion) {
      onToggleCompletion(course.id);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only handle selection if onSelect is provided
    if (onSelect) {
      onSelect(course.id, !isSelected);
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
      onClick={handleCardClick}
      className={`cursor-pointer hover:shadow-md transition-all ${
        course.isCompleted ? 'bg-green-50 border-green-200' : ''
      } ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 bg-primary/10 shadow-md' : ''
      } ${
        onSelect ? 'hover:bg-accent/50' : 'cursor-move'
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
          </div>
          
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {onToggleCompletion && (
              <Checkbox
                checked={course.isCompleted}
                onCheckedChange={handleCompletionToggle}
                className="flex-shrink-0 mt-1"
                onClick={handleCompletionToggle}
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-sm break-words ${course.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {course.code}
              </div>
              <div className={`text-xs break-words ${course.isCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                {course.name}
              </div>
              
              <div className="flex flex-wrap items-center gap-1 mt-2">
                {getMajorRequirementBadges()}
                <Badge variant="outline" className="text-xs">
                  {course.credits} credits
                </Badge>
                {isSelected && (
                  <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                    Selected
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveClick}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}