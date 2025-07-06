import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';

interface CourseFiltersProps {
  selectedRequirements: string[];
  onRequirementsChange: (requirements: string[]) => void;
  showCompleted: boolean;
  onShowCompletedChange: (show: boolean) => void;
  showIncomplete: boolean;
  onShowIncompleteChange: (show: boolean) => void;
}

export function CourseFilters({
  selectedRequirements,
  onRequirementsChange,
  showCompleted,
  onShowCompletedChange,
  showIncomplete,
  onShowIncompleteChange
}: CourseFiltersProps) {
  const requirements = [
    { id: 'DSCT', name: 'DSCT', color: 'text-blue-600 border-blue-600' },
    { id: 'COSC', name: 'COSC', color: 'text-green-600 border-green-600' },
    { id: 'CCC', name: 'CCC', color: 'text-purple-600 border-purple-600' },
    { id: 'NONE', name: 'No Requirements', color: 'text-gray-600 border-gray-600' }
  ];

  const handleRequirementToggle = (requirementId: string) => {
    if (selectedRequirements.includes(requirementId)) {
      onRequirementsChange(selectedRequirements.filter(id => id !== requirementId));
    } else {
      onRequirementsChange([...selectedRequirements, requirementId]);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
                <label htmlFor={req.id} className="text-sm">
                  <Badge variant="outline" className={req.color}>
                    {req.name}
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
              <label htmlFor="completed" className="text-sm">
                Show Completed
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="incomplete"
                checked={showIncomplete}
                onCheckedChange={onShowIncompleteChange}
              />
              <label htmlFor="incomplete" className="text-sm">
                Show Incomplete
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}