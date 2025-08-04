import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, ChevronDown } from 'lucide-react';
import { Major } from '../types/major';

interface CourseFiltersProps {
  selectedRequirements: string[];
  onRequirementsChange: (requirements: string[]) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedSemesters: string[];
  onSemestersChange: (semesters: string[]) => void;
  availableSemesters: Array<{id: string, name: string}>;
  showCompleted: boolean;
  onShowCompletedChange: (show: boolean) => void;
  showIncomplete: boolean;
  onShowIncompleteChange: (show: boolean) => void;
  majors?: Major[];
}

export function CourseFilters({
  selectedRequirements,
  onRequirementsChange,
  selectedCategories,
  onCategoriesChange,
  selectedSemesters,
  onSemestersChange,
  availableSemesters,
  showCompleted,
  onShowCompletedChange,
  showIncomplete,
  onShowIncompleteChange,
  majors = []
}: CourseFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Create requirements list from majors prop (no "Other" option)
  const requirements = React.useMemo(() => {
    return majors.map(major => ({
      id: major.id,
      name: major.name,
      color: major.color
    }));
  }, [majors]);

  const categories = [
    { id: 'Prerequisites', name: 'Prerequisites', color: '#f97316' },
    { id: 'Major Requirements', name: 'Major Requirements', color: '#ef4444' },
    { id: 'Electives', name: 'Electives', color: '#6366f1' },
    { id: 'Other', name: 'Other', color: '#6b7280' }
  ];

  const semesterOptions = [
    ...availableSemesters.map(sem => ({
      id: sem.id,
      name: sem.name,
      color: '#22c55e'
    })),
    { id: 'CREDIT_ONLY', name: 'Credit Only', color: '#6b7280' }
  ];

  const handleRequirementToggle = (requirementId: string) => {
    if (selectedRequirements.includes(requirementId)) {
      onRequirementsChange(selectedRequirements.filter(id => id !== requirementId));
    } else {
      onRequirementsChange([...selectedRequirements, requirementId]);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const handleSemesterToggle = (semesterId: string) => {
    if (selectedSemesters.includes(semesterId)) {
      onSemestersChange(selectedSemesters.filter(id => id !== semesterId));
    } else {
      onSemestersChange([...selectedSemesters, semesterId]);
    }
  };

  const getActiveFiltersCount = () => {
    return selectedRequirements.length + 
           selectedCategories.length + 
           selectedSemesters.length + 
           (showCompleted ? 0 : 1) + 
           (showIncomplete ? 0 : 1);
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 max-h-[min(80vh,600px)] overflow-hidden" 
        align="start"
        side="bottom"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={16}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-sm font-medium">Filter Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto flex-1" style={{ maxHeight: 'min(60vh, 500px)' }}>
            {requirements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Major Requirements</h4>
                <div className="space-y-2">
                  {requirements.map((req) => (
                    <div key={req.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={req.id}
                        checked={selectedRequirements.includes(req.id)}
                        onCheckedChange={() => handleRequirementToggle(req.id)}
                      />
                      <label htmlFor={req.id} className="text-sm flex-1 cursor-pointer">
                        <Badge 
                          variant="outline" 
                          style={{
                            borderColor: req.color,
                            color: req.color,
                            backgroundColor: `${req.color}15`
                          }}
                          className="text-xs"
                        >
                          {req.id} - {req.name}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <label htmlFor={category.id} className="text-sm cursor-pointer">
                      <Badge 
                        variant="outline" 
                        style={{
                          borderColor: category.color,
                          color: category.color,
                          backgroundColor: `${category.color}15`
                        }}
                        className="text-xs"
                      >
                        {category.name}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Completion Status</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed"
                    checked={showCompleted}
                    onCheckedChange={onShowCompletedChange}
                  />
                  <label htmlFor="completed" className="text-sm cursor-pointer">
                    Show Completed
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incomplete"
                    checked={showIncomplete}
                    onCheckedChange={onShowIncompleteChange}
                  />
                  <label htmlFor="incomplete" className="text-sm cursor-pointer">
                    Show Incomplete
                  </label>
                </div>
              </div>
            </div>

            {semesterOptions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Semester Filter</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {semesterOptions.map((semester) => (
                    <div key={semester.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`semester-${semester.id}`}
                        checked={selectedSemesters.includes(semester.id)}
                        onCheckedChange={() => handleSemesterToggle(semester.id)}
                      />
                      <label htmlFor={`semester-${semester.id}`} className="text-sm cursor-pointer">
                        <Badge 
                          variant="outline" 
                          style={{
                            borderColor: semester.color,
                            color: semester.color,
                            backgroundColor: `${semester.color}15`
                          }}
                          className="text-xs"
                        >
                          {semester.name}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}