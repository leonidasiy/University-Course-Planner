import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CourseItem } from './CourseItem';
import { CourseFilters } from './CourseFilters';
import { Course } from '../types/schedule';
import { Plus, Library, Trash2, CheckSquare, Square, Check, X, Search } from 'lucide-react';

interface CourseLibraryProps {
  courses: Course[];
  selectedCourses: Set<string>;
  onSelect: (courseId: string, isSelected: boolean) => void;
  onSelectAll: (courses: Course[]) => void;
  onClearSelection: () => void;
  onAddCourse: (course: Course) => void;
  onRemoveCourse: (courseId: string) => void;
  onRemoveSelected: () => void;
  onToggleCompletion: (courseId: string) => void;
  onToggleSelectedCompletion: (completed: boolean) => void;
  onUpdateCourse?: (courseId: string, updates: Partial<Course>) => void;
}

// Define the sorting priority for course requirements
const getRequirementPriority = (course: Course): number => {
  if (course.majorRequirements.includes('DSCT')) return 1;
  if (course.majorRequirements.includes('COSC')) return 2;
  if (course.majorRequirements.includes('CCC')) return 3;
  return 4; // Other/No requirements
};

export function CourseLibrary({ 
  courses, 
  selectedCourses,
  onSelect,
  onSelectAll,
  onClearSelection,
  onAddCourse, 
  onRemoveCourse,
  onRemoveSelected,
  onToggleCompletion,
  onToggleSelectedCompletion,
  onUpdateCourse
}: CourseLibraryProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRequirements, setSelectedRequirements] = React.useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [showCompleted, setShowCompleted] = React.useState(true);
  const [showIncomplete, setShowIncomplete] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [newCourse, setNewCourse] = React.useState({
    code: '',
    name: '',
    credits: 3,
    majorRequirements: [] as ('DSCT' | 'COSC' | 'CCC')[],
    isCompleted: false,
    category: 'Major Requirements' as 'Prerequisites' | 'Major Requirements' | 'Electives'
  });

  const handleAddCourse = () => {
    if (newCourse.code && newCourse.name) {
      const course: Course = {
        id: Date.now().toString(),
        code: newCourse.code,
        name: newCourse.name,
        credits: newCourse.credits,
        majorRequirements: newCourse.majorRequirements,
        isCompleted: newCourse.isCompleted,
        category: newCourse.category
      };
      onAddCourse(course);
      setNewCourse({ 
        code: '', 
        name: '', 
        credits: 3, 
        majorRequirements: [], 
        isCompleted: false,
        category: 'Major Requirements'
      });
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

  const filteredAndSortedCourses = React.useMemo(() => {
    let filtered = courses.filter(course => {
      // Filter by search term
      if (searchTerm.trim()) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = course.code.toLowerCase().includes(lowerSearchTerm) ||
                             course.name.toLowerCase().includes(lowerSearchTerm);
        if (!matchesSearch) return false;
      }

      // Filter by completion status
      if (!showCompleted && course.isCompleted) return false;
      if (!showIncomplete && !course.isCompleted) return false;

      // Filter by categories
      if (selectedCategories.length > 0 && !selectedCategories.includes(course.category)) {
        return false;
      }

      // Filter by requirements
      if (selectedRequirements.length === 0) return true;

      if (selectedRequirements.includes('OTHER') && course.majorRequirements.length === 0) {
        return true;
      }

      return selectedRequirements.some(req => 
        req !== 'OTHER' && course.majorRequirements.includes(req as 'DSCT' | 'COSC' | 'CCC')
      );
    });

    // Sort courses by requirement priority, then alphabetically by code
    return filtered.sort((a, b) => {
      const priorityA = getRequirementPriority(a);
      const priorityB = getRequirementPriority(b);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same priority, sort alphabetically by course code
      return a.code.localeCompare(b.code);
    });
  }, [courses, selectedRequirements, selectedCategories, showCompleted, showIncomplete, searchTerm]);

  const selectedCoursesInLibrary = React.useMemo(() => {
    return filteredAndSortedCourses.filter(course => selectedCourses.has(course.id));
  }, [filteredAndSortedCourses, selectedCourses]);

  const allCoursesSelected = React.useMemo(() => {
    return filteredAndSortedCourses.length > 0 && 
           filteredAndSortedCourses.every(course => selectedCourses.has(course.id));
  }, [filteredAndSortedCourses, selectedCourses]);

  const selectedCoursesCompletionStatus = React.useMemo(() => {
    const completedCount = selectedCoursesInLibrary.filter(course => course.isCompleted).length;
    const totalSelected = selectedCoursesInLibrary.length;
    
    return {
      allCompleted: totalSelected > 0 && completedCount === totalSelected,
      someCompleted: completedCount > 0 && completedCount < totalSelected,
      noneCompleted: completedCount === 0
    };
  }, [selectedCoursesInLibrary]);

  const handleSelectAll = () => {
    if (allCoursesSelected) {
      onClearSelection();
    } else {
      onSelectAll(filteredAndSortedCourses);
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

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-4">
      <CourseFilters
        selectedRequirements={selectedRequirements}
        onRequirementsChange={setSelectedRequirements}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
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
              Course Library ({filteredAndSortedCourses.length})
              {selectedCoursesInLibrary.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedCoursesInLibrary.length} selected
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2 flex-wrap">
              {filteredAndSortedCourses.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center gap-1"
                >
                  {allCoursesSelected ? (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4" />
                      Select All
                    </>
                  )}
                </Button>
              )}
              
              {selectedCoursesInLibrary.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkSelectedAsComplete}
                    className="flex items-center gap-1"
                    disabled={selectedCoursesCompletionStatus.allCompleted}
                  >
                    <Check className="h-4 w-4" />
                    Mark Complete
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkSelectedAsIncomplete}
                    className="flex items-center gap-1"
                    disabled={selectedCoursesCompletionStatus.noneCompleted}
                  >
                    <X className="h-4 w-4" />
                    Mark Incomplete
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onRemoveSelected}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove ({selectedCoursesInLibrary.length})
                  </Button>
                </>
              )}
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
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
                        min="0"
                        max="6"
                        value={newCourse.credits}
                        onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select 
                        value={newCourse.category} 
                        onValueChange={(value: 'Prerequisites' | 'Major Requirements' | 'Electives') => 
                          setNewCourse({ ...newCourse, category: value })
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
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchClear}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="h-full overflow-y-auto px-6 pb-6">
            {filteredAndSortedCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 
                  `No courses found matching "${searchTerm}".` :
                  "No courses match the current filters."
                }
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground mb-2">
                  Tip: Click on course cards to select/deselect them, or click the edit icon to modify course details
                </div>
                {filteredAndSortedCourses.map((course) => (
                  <CourseItem
                    key={course.id}
                    course={course}
                    isSelected={selectedCourses.has(course.id)}
                    onSelect={handleCourseSelect}
                    onRemoveFromLibrary={onRemoveCourse}
                    onToggleCompletion={onToggleCompletion}
                    onUpdateCourse={onUpdateCourse}
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