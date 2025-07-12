import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CourseItem } from './CourseItem';
import { Semester, Course } from '../types/schedule';
import { Trash2, Calendar, Sun, Flower, Leaf, Plus, Eraser, CheckSquare, Square, Check, X, Edit2 } from 'lucide-react';

interface SemesterCardProps {
  semester: Semester;
  availableCourses: Course[];
  selectedCourses: Set<string>;
  onSelect: (courseId: string, isSelected: boolean) => void;
  onSelectAll: (courses: Course[]) => void;
  onClearSelection: () => void;
  onRemove: (semesterId: string) => void;
  onClearCourses: (semesterId: string) => void;
  onAddCourse: (semesterId: string, course: Course) => void;
  onAddSelectedCourses: (semesterId: string) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  onRemoveSelectedCourses: (semesterId: string) => void;
  onMoveCourse: (fromSemesterId: string, toSemesterId: string, courseId: string) => void;
  onMoveSelectedCourses: (fromSemesterId: string, toSemesterId: string) => void;
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
  onSelect,
  onSelectAll,
  onClearSelection,
  onRemove,
  onClearCourses,
  onAddCourse,
  onAddSelectedCourses,
  onRemoveCourse,
  onRemoveSelectedCourses,
  onMoveCourse,
  onMoveSelectedCourses,
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

  const isRequiredSemester = REQUIRED_SEMESTER_IDS.includes(semester.id);

  React.useEffect(() => {
    setEditName(semester.name);
  }, [semester.name]);

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
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dragData = e.dataTransfer.getData('application/json');
    const data = JSON.parse(dragData);
    
    if (data.type === 'course') {
      if (data.isMultiSelect) {
        // Handle multi-select drop
        if (data.fromSemester) {
          onMoveSelectedCourses(data.fromSemester, semester.id);
        } else {
          onAddSelectedCourses(semester.id);
        }
      } else {
        // Handle single course drop
        if (data.fromSemester) {
          onMoveCourse(data.fromSemester, semester.id, data.courseId);
        } else {
          onAddCourse(semester.id, data.course);
        }
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
      className={`transition-colors hover:bg-accent/50 border-l-4 ${getSemesterColor(semester.type)}`}
      onDragOver={handleDragOver}
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
      