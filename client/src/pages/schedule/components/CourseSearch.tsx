import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Navigation } from 'lucide-react';
import { Course, Semester } from '../types/schedule';
import { Major } from '../types/major';

interface CourseSearchProps {
  onSearch: (searchTerm: string) => Array<{semester: Semester, course: Course}>;
  onNavigateToSemester?: (semesterId: string) => void;
  majors?: Major[];
}

export function CourseSearch({ onSearch, onNavigateToSemester, majors = [] }: CourseSearchProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Array<{semester: Semester, course: Course}>>([]);

  // Clear search on component mount/refresh
  React.useEffect(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim()) {
      const results = onSearch(term);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleNavigateToSemester = (semesterId: string) => {
    if (onNavigateToSemester) {
      onNavigateToSemester(semesterId);
    } else {
      // Fallback: scroll to the semester element
      const semesterElement = document.querySelector(`[data-semester-id="${semesterId}"]`);
      if (semesterElement) {
        semesterElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    // Clear search results to collapse the menu
    setSearchTerm('');
    setSearchResults([]);
  };

  const getMajorRequirementBadges = (course: Course) => {
    if (course.majorRequirements.length === 0) return null;
    
    // Use dynamic colors from majors if available
    if (majors.length > 0) {
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
            } : undefined}
          >
            {req}
          </Badge>
        );
      });
    }
    
    // Fallback to static colors
    const colors = {
      DSCT: 'text-blue-600 border-blue-600 bg-blue-50',
      COSC: 'text-green-600 border-green-600 bg-green-50',
      CCC: 'text-purple-600 border-purple-600 bg-purple-50'
    };

    return course.majorRequirements.map((req) => (
      <Badge key={req} variant="outline" className={colors[req] || 'text-gray-600 border-gray-600'}>
        {req}
      </Badge>
    ));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Search className="h-4 w-4" />
          Course Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for courses by code or name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        
        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <h4 className="text-sm font-medium text-muted-foreground">
              Found {searchResults.length} course{searchResults.length !== 1 ? 's' : ''}:
            </h4>
            {searchResults.map(({ semester, course }, index) => (
              <div 
                key={`${semester.id}-${course.id}-${index}`}
                className={`p-3 rounded-lg border transition-colors ${
                  course.isCompleted ? 'bg-green-50 border-green-200' : 'bg-background'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className={`font-medium ${course.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {course.code}
                    </div>
                    <div className={`text-sm ${course.isCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                      {course.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getMajorRequirementBadges(course)}
                    <Badge variant="outline">
                      {course.credits} credits
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{semester.name}</span>
                    {course.isCompleted && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigateToSemester(semester.id)}
                    className="h-6 px-2 text-xs"
                    title={`Go to ${semester.name}`}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Go to
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {searchTerm.trim() && searchResults.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No courses found matching "{searchTerm}"
          </div>
        )}
      </CardContent>
    </Card>
  );
}