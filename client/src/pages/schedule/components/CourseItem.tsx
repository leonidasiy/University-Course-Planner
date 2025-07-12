import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Course, Semester } from '../types/schedule';
import { GripVertical, X, Edit, Check, MapPin } from 'lucide-react';

interface CourseItemProps {
  course: Course;
  semesterId?: string;
  courseIndex?: number;
  isSelected?: boolean;
  onSelect?: (courseId: string, isSelected: boolean) => void;
  onRemove?: (semesterId: string, courseId: string) => void;
  onRemoveFromLibrary?: (courseId: string) => void;
  onToggleCompletion?: (courseId: string) => void;
  onAddToSemester?: (course: Course) => void;
  onUpdateCourse?: (courseId: string, updates: Partial<Course>) => void;
  onReorder?: (semesterId: string, dragIndex: number, dropIndex: number) => void;
  semesterInfo?: Semester | null;
}

export function CourseItem({ 
  course, 
  semesterId, 
  courseIndex,
  isSelected = false,
  onSelect,
  onRemove, 
  onRemoveFromLibrary, 
  onToggleCompletion,
  onAddToSemester,
  onUpdateCourse,
  onReorder,
  semesterInfo
}: CourseItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<Course>(course);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setEditingCourse(course);
  }, [course]);

  // Auto-scroll functionality
  React.useEffect(() => {
    if (!isDragging) return;

    let scrollInterval: NodeJS.Timeout;

    const handleAutoScroll = (e: MouseEvent) => {
      const scrollSpeed = 15; // Increased from default
      const scrollMargin = 100;
      const viewportHeight = window.innerHeight;

      if (e.clientY < scrollMargin) {
        // Scroll up
        window.scrollBy(0, -scrollSpeed);
      } else if (e.clientY > viewportHeight - scrollMargin) {
        // Scroll down
        window.scrollBy(0, scrollSpeed);
      }
    };

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: 0,
          clientY: document.querySelector('.dragging-course')?.getBoundingClientRect().top || 0
        });
        handleAutoScroll(mouseEvent);
      }, 50); // Faster interval for smoother scrolling
    };

    const stopAutoScroll = () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
    };

    document.addEventListener('mousemove', handleAutoScroll);
    startAutoScroll();

    return () => {
      document.removeEventListener('mousemove', handleAutoScroll);
      stopAutoScroll();
    };
  }, [isDragging]);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    const dragData = {
      type: 'course',
      courseId: course.id,
      course: course,
      fromSemester: semesterId || null,
      courseIndex: courseIndex,
      isMultiSelect: isSelected
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a class to the element being dragged for auto-scroll detection
    const target = e.target as HTMLElement;
    target.classList.add('dragging-course');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    setDragOverIndex(null);
    const target = e.target as HTMLElement;
    target.classList.remove('dragging-course');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (semesterId && typeof courseIndex === 'number') {
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const dropIndex = e.clientY < midpoint ? courseIndex : courseIndex + 1;
      setDragOverIndex(dropIndex);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);

    if (!semesterId || typeof courseIndex !== 'number' || !onReorder) return;

    try {
      const dragData = e.dataTransfer.getData('application/json');
      const data = JSON.parse(dragData);
      
      if (data.type === 'course' && data.fromSemester === semesterId && typeof data.courseIndex === 'number') {
        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const dropIndex = e.clientY < midpoint ? courseIndex : courseIndex + 1;
        
        if (data.courseIndex !== dropIndex && data.courseIndex !== dropIndex - 1) {
          onReorder(semesterId, data.courseIndex, dropIndex > data.courseIndex ? dropIndex - 1 : dropIndex);
        }
      }
    } catch (error) {
      console.error('Error handling course reorder drop:', error);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (semesterId && onRemove) {
      onRemove(semesterId, course.id);
    } else if (onRemoveFromLibrary) {
      onRemoveFromLibrary(course.id);
    }
  };

  const handleCompletionToggle = (checked: boolean | string) => {
    if (onToggleCompletion) {
      onToggleCompletion(course.id);
    }
  };

  const handleCompletionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Handle instant add to semester if this is a search result
    if (onAddToSemester && !semesterId) {
      onAddToSemester(course);
      return;
    }
    
    // Only handle selection if onSelect is provided
    if (onSelect) {
      onSelect(course.id, !isSelected);
    }
  };

  const handleSaveEdit = () => {
    if (onUpdateCourse) {
      onUpdateCourse(course.id, {
        category: editingCourse.category,
        majorRequirements: editingCourse.majorRequirements
      });
    }
    setIsEditDialogOpen(false);
  };

  const handleCancelEdit = () => {
    setEditingCourse(course);
    setIsEditDialogOpen(false);
  };

  const handleRequirementToggle = (requirement: 'DSCT' | 'COSC' | 'CCC') => {
    if (editingCourse.majorRequirements.includes(requirement)) {
      setEditingCourse({
        ...editingCourse,
        majorRequirements: editingCourse.majorRequirements.filter(req => req !== requirement)
      });
    } else {
      setEditingCourse({
        ...editingCourse,
        majorRequirements: [...editingCourse.majorRequirements, requirement]
      });
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

  const getCategoryBadge = () => {
    const colors = {
      Prerequisites: 'text-orange-600 border-orange-600 bg-orange-50',
      'Major Requirements': 'text-red-600 border-red-600 bg-red-50',
      Electives: 'text-indigo-600 border-indigo-600 bg-indigo-50'
    };

    return (
      <Badge variant="outline" className={colors[course.category]}>
        {course.category}
      </Badge>
    );
  };

  return (
    <>
      {/* Drop indicator for reordering */}
      {dragOverIndex === courseIndex && (
        <div className="h-2 bg-primary/30 rounded-full mx-2 mb-1" />
      )}
      
      <Card
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleCardClick}
        className={`cursor-pointer hover:shadow-md transition-all ${
          course.isCompleted ? 'bg-green-50 border-green-200' : ''
        } ${
          isSelected ? 'ring-2 ring-primary ring-offset-2 bg-primary/10 shadow-md' : ''
        } ${
          onSelect || onAddToSemester ? 'hover:bg-accent/50' : 'cursor-move'
        } ${
          isDragging ? 'opacity-50 rotate-2' : ''
        }`}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
            
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {onToggleCompletion && (
                <div onClick={handleCompletionClick}>
                  <Checkbox
                    checked={course.isCompleted}
                    onCheckedChange={handleCompletionToggle}
                    className="flex-shrink-0 mt-1"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm break-words ${course.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                  {course.code}
                </div>
                <div className={`text-xs break-words ${course.isCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                  {course.name}
                </div>
                
                {/* Show semester info in library view */}
                {semesterInfo && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      {semesterInfo.name}
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  {getCategoryBadge()}
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
            
            <div className="flex items-center gap-1">
              {onUpdateCourse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  className="h-6 w-6 p-0 flex-shrink-0"
                  title="Edit course details"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveClick}
                className="h-6 w-6 p-0 flex-shrink-0"
                title="Remove course"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {dragOverIndex === courseIndex + 1 && (
        <div className="h-2 bg-primary/30 rounded-full mx-2 mt-1" />
      )}

      {onUpdateCourse && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Course Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <div className="font-medium text-sm mb-1">{course.code}</div>
                <div className="text-sm text-muted-foreground mb-3">{course.name}</div>
                <div className="text-xs text-muted-foreground">{course.credits} credits</div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select 
                  value={editingCourse.category} 
                  onValueChange={(value: 'Prerequisites' | 'Major Requirements' | 'Electives') => 
                    setEditingCourse({ ...editingCourse, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prerequisites">Prerequisites</SelectItem>
                    <SelectItem value="Major Requirements">Major Requirements</SelectItem>
                    <SelectItem value="Electives">Electives</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Major Requirements</label>
                <div className="space-y-2">
                  {['DSCT', 'COSC', 'CCC'].map((req) => (
                    <div key={req} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${req}`}
                        checked={editingCourse.majorRequirements.includes(req as 'DSCT' | 'COSC' | 'CCC')}
                        onCheckedChange={() => handleRequirementToggle(req as 'DSCT' | 'COSC' | 'CCC')}
                      />
                      <label htmlFor={`edit-${req}`} className="text-sm">
                        {req} ({req === 'DSCT' ? 'Data Science and Technology' : 
                               req === 'COSC' ? 'Computer Science' : 'Common Core Courses'})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}