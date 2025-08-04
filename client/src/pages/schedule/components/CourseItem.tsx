import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Course, Semester } from '../types/schedule';
import { Major } from '../types/major';
import { GripVertical, X, Edit, Check, MapPin } from 'lucide-react';

interface CourseItemProps {
  course: Course;
  semesterId?: string;
  courseIndex?: number;
  isSelected?: boolean;
  majors?: Major[];
  onSelect?: (courseId: string, isSelected: boolean) => void;
  onRemove?: (semesterId: string, courseId: string) => void;
  onRemoveFromLibrary?: (courseId: string) => void;
  onToggleCompletion?: (courseId: string) => void;
  onAddToSemester?: (course: Course) => void;
  onUpdateCourse?: (courseId: string, updates: Partial<Course>) => void;
  onReorder?: (semesterId: string, dragIndex: number, dropIndex: number) => void;
  onInsertAtPosition?: (semesterId: string, course: Course, position: number) => void;
  onInsertSelectedAtPosition?: (semesterId: string, position: number) => void;
  onMoveToPosition?: (fromSemesterId: string, toSemesterId: string, courseId: string, position: number) => void;
  onMoveSelectedToPosition?: (fromSemesterId: string, toSemesterId: string, position: number) => void;
  semesterInfo?: Semester | null;
}

export function CourseItem({ 
  course, 
  semesterId, 
  courseIndex,
  isSelected = false,
  majors = [],
  onSelect,
  onRemove, 
  onRemoveFromLibrary, 
  onToggleCompletion,
  onAddToSemester,
  onUpdateCourse,
  onReorder,
  onInsertAtPosition,
  onInsertSelectedAtPosition,
  onMoveToPosition,
  onMoveSelectedToPosition,
  semesterInfo
}: CourseItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<Course>(course);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setEditingCourse(course);
  }, [course]);

  // Auto-scroll functionality - only when mouse is near edges
  React.useEffect(() => {
    if (!isDragging) return;

    let scrollInterval: NodeJS.Timeout;

    const handleAutoScroll = (e: MouseEvent) => {
      const scrollSpeed = 15;
      const scrollMargin = 100;
      const viewportHeight = window.innerHeight;

      // Only auto-scroll when mouse is near the top or bottom edges
      if (e.clientY < scrollMargin) {
        // Scroll up
        if (scrollInterval) clearInterval(scrollInterval);
        scrollInterval = setInterval(() => {
          window.scrollBy(0, -scrollSpeed);
        }, 50);
      } else if (e.clientY > viewportHeight - scrollMargin) {
        // Scroll down
        if (scrollInterval) clearInterval(scrollInterval);
        scrollInterval = setInterval(() => {
          window.scrollBy(0, scrollSpeed);
        }, 50);
      } else {
        // Stop scrolling when mouse is not near edges
        if (scrollInterval) {
          clearInterval(scrollInterval);
          scrollInterval = null;
        }
      }
    };

    const stopAutoScroll = () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
    };

    document.addEventListener('mousemove', handleAutoScroll);

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
      isMultiSelect: isSelected,
      isFromLibrary: !semesterId // Track if this is from library
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

    if (!semesterId || typeof courseIndex !== 'number') return;

    try {
      const dragData = e.dataTransfer.getData('application/json');
      const data = JSON.parse(dragData);
      
      if (data.type === 'course') {
        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const dropPosition = e.clientY < midpoint ? courseIndex : courseIndex + 1;
        
        // Handle reordering within the same semester
        if (data.fromSemester === semesterId && typeof data.courseIndex === 'number' && onReorder) {
          if (data.courseIndex !== dropPosition && data.courseIndex !== dropPosition - 1) {
            onReorder(semesterId, data.courseIndex, dropPosition > data.courseIndex ? dropPosition - 1 : dropPosition);
          }
        } 
        // Handle drops from other semesters or library
        else {
          // Check if course is already in this semester
          const courseAlreadyInSemester = semesterId && data.courseId;
          // We'll let the parent components handle the duplicate check
          
          if (data.isMultiSelect && isSelected) {
            // Handle multi-select drops with position
            if (data.fromSemester && data.fromSemester !== semesterId && onMoveSelectedToPosition) {
              onMoveSelectedToPosition(data.fromSemester, semesterId, dropPosition);
            } else if (!data.fromSemester && onInsertSelectedAtPosition) {
              onInsertSelectedAtPosition(semesterId, dropPosition);
            }
          } else {
            // Handle single course drops with position
            if (data.fromSemester && data.fromSemester !== semesterId && onMoveToPosition) {
              onMoveToPosition(data.fromSemester, semesterId, data.courseId, dropPosition);
            } else if (!data.fromSemester && onInsertAtPosition) {
              onInsertAtPosition(semesterId, data.course, dropPosition);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling course reorder drop:', error);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (semesterId && onRemove) {
      // Remove from semester only (does not delete from database)
      onRemove(semesterId, course.id);
    } else if (onRemoveFromLibrary) {
      // Permanent removal from library (deletes from database)
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
      // Validate required fields
      if (!editingCourse.code.trim() || !editingCourse.name.trim()) {
        alert('Course code and name are required.');
        return;
      }

      if (editingCourse.credits < 0 || editingCourse.credits > 20) {
        alert('Credits must be between 0 and 20.');
        return;
      }

      onUpdateCourse(course.id, {
        code: editingCourse.code.trim(),
        name: editingCourse.name.trim(),
        credits: editingCourse.credits,
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

  const handleRequirementToggle = (requirement: string) => {
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
    
    return course.majorRequirements.map((req) => {
      const major = majors.find(m => m.id === req);
      return (
        <Badge 
          key={req} 
          variant="outline" 
          style={major ? {
            borderColor: major.color,
            color: major.color,
            backgroundColor: `${major.color}15`
          } : {
            borderColor: '#6b7280',
            color: '#6b7280',
            backgroundColor: '#6b728015'
          }}
        >
          {req}
        </Badge>
      );
    });
  };

  const getCategoryBadge = () => {
    const colors = {
      Prerequisites: { color: '#f97316', bg: '#f9731615' },
      'Major Requirements': { color: '#ef4444', bg: '#ef444415' },
      Electives: { color: '#6366f1', bg: '#6366f115' },
      Other: { color: '#6b7280', bg: '#6b728015' }
    };

    const colorConfig = colors[course.category] || colors.Other;

    return (
      <Badge 
        variant="outline" 
        style={{
          borderColor: colorConfig.color,
          color: colorConfig.color,
          backgroundColor: colorConfig.bg
        }}
      >
        {course.category}
      </Badge>
    );
  };

  // Only show semester info in library view and if the course is actually in a semester
  const shouldShowSemesterInfo = !semesterId && semesterInfo;

  // Determine remove button title based on context
  const getRemoveButtonTitle = () => {
    if (semesterId) {
      return "Remove from semester (course remains in library)";
    } else {
      return "Permanently delete course from database";
    }
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
                
                {/* Show semester info in library view only if course is actually in a semester */}
                {shouldShowSemesterInfo && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{
                        borderColor: '#22c55e',
                        color: '#22c55e',
                        backgroundColor: '#22c55e15'
                      }}
                    >
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
                className={`h-6 w-6 p-0 flex-shrink-0 ${
                  !semesterId ? 'text-destructive hover:text-destructive' : ''
                }`}
                title={getRemoveButtonTitle()}
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
                <Label htmlFor="edit-course-code">Course Code</Label>
                <Input
                  id="edit-course-code"
                  value={editingCourse.code}
                  onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                  placeholder="e.g., COMP1022P"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-course-name">Course Name</Label>
                <Input
                  id="edit-course-name"
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                  placeholder="e.g., Introduction to Computing with Java"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-course-credits">Credits</Label>
                <Input
                  id="edit-course-credits"
                  type="number"
                  min="0"
                  max="20"
                  value={editingCourse.credits}
                  onChange={(e) => setEditingCourse({ ...editingCourse, credits: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select 
                  value={editingCourse.category} 
                  onValueChange={(value: 'Prerequisites' | 'Major Requirements' | 'Electives' | 'Other') => 
                    setEditingCourse({ ...editingCourse, category: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prerequisites">Prerequisites</SelectItem>
                    <SelectItem value="Major Requirements">Major Requirements</SelectItem>
                    <SelectItem value="Electives">Electives</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Major Requirements</Label>
                <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                  {majors.map((major) => (
                    <div key={major.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${major.id}`}
                        checked={editingCourse.majorRequirements.includes(major.id)}
                        onCheckedChange={() => handleRequirementToggle(major.id)}
                      />
                      <label htmlFor={`edit-${major.id}`} className="text-sm flex-1">
                        <Badge 
                          variant="outline"
                          style={{
                            borderColor: major.color,
                            color: major.color,
                            backgroundColor: `${major.color}15`
                          }}
                        >
                          {major.id} - {major.name}
                        </Badge>
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