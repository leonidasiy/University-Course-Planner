import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CourseItem } from './CourseItem';
import { Semester, Course } from '../types/schedule';
import { Major } from '../types/major';
import { Trash2, Calendar, Sun, Flower, Leaf, Plus, Eraser, CheckSquare, Square, Check, X, Edit2 } from 'lucide-react';

interface SemesterCardProps {
  semester: Semester;
  availableCourses: Course[];
  selectedCourses: Set<string>;
  majors: Major[];
  onSelect: (courseId: string, isSelected: boolean) => void;
  onSelectAll: (courses: Course[]) => void;
  onClearSelection: () => void;
  onRemove: (semesterId: string) => void;
  onClearCourses: (semesterId: string) => void;
  onAddCourse: (semesterId: string, course: Course) => void;
  onInsertCourseAtPosition: (semesterId: string, course: Course, position: number) => void;
  onAddSelectedCourses: (semesterId: string) => void;
  onInsertSelectedCoursesAtPosition: (semesterId: string, position: number) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  onRemoveSelectedCourses: (semesterId: string) => void;
  onMoveCourse: (fromSemesterId: string, toSemesterId: string, courseId: string) => void;
  onMoveCourseToPosition: (fromSemesterId: string, toSemesterId: string, courseId: string, position: number) => void;
  onMoveSelectedCourses: (fromSemesterId: string, toSemesterId: string) => void;
  onMoveSelectedCoursesToPosition: (fromSemesterId: string, toSemesterId: string, position: number) => void;
  onReorderCourses: (semesterId: string, dragIndex: number, dropIndex: number) => void;
  onToggleCompletion: (courseId: string) => void;
  onToggleSelectedCompletion: (completed: boolean) => void;
  onUpdateSemesterName?: (semesterId: string, newName: string) => void;
  onUpdateCourse?: (courseId: string, updates: Partial<Course>) => void;
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
  selectedCourses,
  majors,
  onSelect,
  onSelectAll,
  onClearSelection,
  onRemove,
  onClearCourses,
  onAddCourse,
  onInsertCourseAtPosition,
  onAddSelectedCourses,
  onInsertSelectedCoursesAtPosition,
  onRemoveCourse,
  onRemoveSelectedCourses,
  onMoveCourse,
  onMoveCourseToPosition,
  onMoveSelectedCourses,
  onMoveSelectedCoursesToPosition,
  onReorderCourses,
  onToggleCompletion,
  onToggleSelectedCompletion,
  onUpdateSemesterName,
  onUpdateCourse
}: SemesterCardProps) {
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>('');
  const [clearDialogOpen, setClearDialogOpen] = React.useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editName, setEditName] = React.useState(semester.name);
  const [searchResults, setSearchResults] = React.useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDragOver, setIsDragOver] = React.useState(false);

  const isRequiredSemester = REQUIRED_SEMESTER_IDS.includes(semester.id);

  React.useEffect(() => {
    setEditName(semester.name);
  }, [semester.name]);

  const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
  const completedCredits = semester.courses
    .filter(course => course.isCompleted)
    .reduce((sum, course) => sum + course.credits, 0);
  
  // Calculate requirement credits for this semester using dynamic majors
  const getMajorCredits = React.useMemo(() => {
    const majorCredits: { [majorId: string]: { completed: number; total: number } } = {};
    
    majors.forEach(major => {
      const majorCourses = semester.courses.filter(course => 
        course.majorRequirements.includes(major.id)
      );
      
      majorCredits[major.id] = {
        completed: majorCourses
          .filter(course => course.isCompleted)
          .reduce((sum, course) => sum + course.credits, 0),
        total: majorCourses.reduce((sum, course) => sum + course.credits, 0)
      };
    });
    
    return majorCredits;
  }, [semester.courses, majors]);

  const selectedCoursesInSemester = React.useMemo(() => {
    return semester.courses.filter(course => selectedCourses.has(course.id));
  }, [semester.courses, selectedCourses]);

  const selectedAvailableCourses = React.useMemo(() => {
    return availableCourses.filter(course => selectedCourses.has(course.id));
  }, [availableCourses, selectedCourses]);

  const allCoursesSelected = React.useMemo(() => {
    return semester.courses.length > 0 && 
           semester.courses.every(course => selectedCourses.has(course.id));
  }, [semester.courses, selectedCourses]);

  const selectedCoursesCompletionStatus = React.useMemo(() => {
    const completedCount = selectedCoursesInSemester.filter(course => course.isCompleted).length;
    const totalSelected = selectedCoursesInSemester.length;
    
    return {
      allCompleted: totalSelected > 0 && completedCount === totalSelected,
      someCompleted: completedCount > 0 && completedCount < totalSelected,
      noneCompleted: completedCount === 0
    };
  }, [selectedCoursesInSemester]);

  // Search functionality - filter out courses already in this semester
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      const results = availableCourses.filter(course => {
        const matchesSearch = course.code.toLowerCase().includes(value.toLowerCase()) ||
                             course.name.toLowerCase().includes(value.toLowerCase());
        const notInSemester = !semester.courses.some(c => c.id === course.id);
        return matchesSearch && notInSemester;
      }).slice(0, 5); // Limit to 5 results
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const courseOptions = availableCourses
    .filter(course => !semester.courses.some(c => c.id === course.id))
    .map(course => {
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
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set isDragOver to false if we're actually leaving the semester card
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    try {
      const dragData = e.dataTransfer.getData('application/json');
      if (!dragData) {
        console.log('No drag data found');
        return;
      }

      const data = JSON.parse(dragData);
      console.log('Drop data received in semester', semester.id, ':', data);
      
      if (data.type === 'course') {
        // Check if course is already in this semester
        const courseAlreadyInSemester = semester.courses.some(c => c.id === data.courseId);
        if (courseAlreadyInSemester) {
          console.log('Course already in this semester, ignoring drop');
          return;
        }

        // For general semester drops (not on specific course), add to the end
        const position = semester.courses.length;

        // Handle multi-select drops
        if (data.isMultiSelect && selectedCourses.has(data.courseId)) {
          console.log('Handling multi-select drop');
          if (data.fromSemester && data.fromSemester !== semester.id) {
            console.log('Moving selected courses from semester:', data.fromSemester, 'to:', semester.id);
            onMoveSelectedCoursesToPosition(data.fromSemester, semester.id, position);
          } else if (!data.fromSemester || data.isFromLibrary) {
            console.log('Adding selected courses from library to semester:', semester.id);
            onInsertSelectedCoursesAtPosition(semester.id, position);
          }
        } else {
          // Handle single course drops
          console.log('Handling single course drop');
          if (data.fromSemester && data.fromSemester !== semester.id) {
            console.log('Moving single course from semester:', data.fromSemester, 'to:', semester.id);
            onMoveCourseToPosition(data.fromSemester, semester.id, data.courseId, position);
          } else if (!data.fromSemester || data.isFromLibrary) {
            console.log('Adding single course from library to semester:', semester.id, 'course:', data.course);
            if (data.course) {
              onInsertCourseAtPosition(semester.id, data.course, position);
            } else {
              console.error('No course data found in drag event');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing drop data:', error);
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

  const handleSelectAll = () => {
    if (allCoursesSelected) {
      onClearSelection();
    } else {
      onSelectAll(semester.courses);
    }
  };

  const handleCourseSelect = (courseId: string, isSelected: boolean) => {
    onSelect(courseId, isSelected);
  };

  const handleMarkSelectedAsComplete = () => {
    onToggleSelectedCompletion(true);
  };

  const handleMarkSelectedAsIncomplete = () => {
    onToggleSelectedCompletion(false);
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (onUpdateSemesterName && editName.trim() !== semester.name) {
      onUpdateSemesterName(semester.id, editName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditName(semester.name);
    setIsEditingName(false);
  };

  const handleAddCourseFromSearch = (course: Course) => {
    onAddCourse(semester.id, course);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <Card
      className={`transition-colors border-l-4 ${getSemesterColor(semester.type)} ${
        isDragOver ? 'bg-accent/50 ring-2 ring-primary' : 'hover:bg-accent/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getSemesterIcon(semester.type)}
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-6 text-base font-semibold"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameSave();
                    if (e.key === 'Escape') handleNameCancel();
                  }}
                  autoFocus
                />
                <Button size="sm" variant="outline" onClick={handleNameSave}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleNameCancel}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{semester.name}</span>
                <Button size="sm" variant="ghost" onClick={handleNameEdit} className="h-6 w-6 p-0">
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            {selectedCoursesInSemester.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedCoursesInSemester.length} selected
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">
              {completedCredits}/{totalCredits} credits
            </Badge>
            {majors.map(major => {
              const credits = getMajorCredits[major.id];
              if (!credits || credits.total === 0) return null;
              
              return (
                <Badge 
                  key={major.id}
                  variant="outline" 
                  style={{
                    borderColor: major.color,
                    color: major.color,
                    backgroundColor: `${major.color}15`
                  }}
                >
                  {credits.completed}/{credits.total} {major.id}
                </Badge>
              );
            })}
            
            {semester.courses.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-8 px-2 text-xs"
                title={allCoursesSelected ? "Deselect all courses" : "Select all courses"}
              >
                {allCoursesSelected ? (
                  <CheckSquare className="h-3 w-3" />
                ) : (
                  <Square className="h-3 w-3" />
                )}
              </Button>
            )}
            
            {selectedCoursesInSemester.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkSelectedAsComplete}
                  className="h-8 px-2 text-xs"
                  title="Mark selected courses as complete"
                  disabled={selectedCoursesCompletionStatus.allCompleted}
                >
                  <Check className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkSelectedAsIncomplete}
                  className="h-8 px-2 text-xs"
                  title="Mark selected courses as incomplete"
                  disabled={selectedCoursesCompletionStatus.noneCompleted}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveSelectedCourses(semester.id)}
                  className="h-8 px-2 text-xs"
                  title={`Remove ${selectedCoursesInSemester.length} selected course${selectedCoursesInSemester.length !== 1 ? 's' : ''}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
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
                      This will remove all {semester.courses.length} course{semester.courses.length !== 1 ? 's' : ''} from this semester.
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
                        The courses will remain in the Course Library.
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
      
      <CardContent 
        className="space-y-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <div className="relative">
            <Input
              placeholder="Search and add courses..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-background border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {searchResults.map((course) => (
                  <div key={course.id} className="p-2 border-b last:border-b-0">
                    <CourseItem
                      course={course}
                      majors={majors}
                      onAddToSemester={handleAddCourseFromSearch}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Combobox
              options={courseOptions}
              value={selectedCourseId}
              onValueChange={handleComboboxValueChange}
              placeholder="Or select from dropdown..."
              searchPlaceholder="Search courses by code or name..."
              emptyText="No courses found."
              className="flex-1 min-w-0"
            />
            <Button
              onClick={handleAddCourseFromDropdown}
              disabled={!selectedCourseId}
              size="sm"
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {selectedAvailableCourses.length > 0 && (
              <Button
                onClick={() => onAddSelectedCourses(semester.id)}
                size="sm"
                variant="outline"
                className="shrink-0"
              >
                Add Selected ({selectedAvailableCourses.length})
              </Button>
            )}
          </div>
        </div>

        {semester.courses.length === 0 ? (
          <div 
            className={`text-center py-8 border-2 border-dashed rounded-lg transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-muted text-muted-foreground'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {availableCourses.length > 0 
              ? "Add courses using search above or drag courses here"
              : "No courses available to add"
            }
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Tip: Click on course cards to select/deselect them, drag to reorder or insert at specific positions, or click the edit icon to modify course details
            </div>
            {semester.courses.map((course, index) => (
              <CourseItem
                key={course.id}
                course={course}
                semesterId={semester.id}
                courseIndex={index}
                isSelected={selectedCourses.has(course.id)}
                majors={majors}
                onSelect={handleCourseSelect}
                onRemove={onRemoveCourse}
                onToggleCompletion={onToggleCompletion}
                onUpdateCourse={onUpdateCourse}
                onReorder={onReorderCourses}
                onInsertAtPosition={onInsertCourseAtPosition}
                onInsertSelectedAtPosition={onInsertSelectedCoursesAtPosition}
                onMoveToPosition={onMoveCourseToPosition}
                onMoveSelectedToPosition={onMoveSelectedCoursesToPosition}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}