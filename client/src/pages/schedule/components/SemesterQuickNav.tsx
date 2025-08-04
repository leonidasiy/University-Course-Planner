import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Semester } from '../types/schedule';
import { Calendar, Leaf, Flower, Sun, ChevronLeft, ChevronRight } from 'lucide-react';

interface SemesterQuickNavProps {
  semesters: Semester[];
  onNavigateToSemester: (semesterId: string) => void;
}

const getSemesterIcon = (type: string) => {
  switch (type) {
    case 'Fall':
      return <Leaf className="h-3 w-3 text-orange-600" />;
    case 'Spring':
      return <Flower className="h-3 w-3 text-green-600" />;
    case 'Summer':
      return <Sun className="h-3 w-3 text-yellow-600" />;
    default:
      return <Calendar className="h-3 w-3" />;
  }
};

export function SemesterQuickNav({ semesters, onNavigateToSemester }: SemesterQuickNavProps) {
  const [activeSemesterId, setActiveSemesterId] = React.useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = React.useState(true); // Start collapsed

  React.useEffect(() => {
    const handleScroll = () => {
      const semesterElements = semesters.map(semester => ({
        id: semester.id,
        element: document.querySelector(`[data-semester-id="${semester.id}"]`)
      })).filter(item => item.element);

      let currentSemester: string | null = null;
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const { id, element } of semesterElements) {
        const rect = element!.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementBottom = elementTop + rect.height;

        if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
          currentSemester = id;
          break;
        }
      }

      // If no semester is in the middle, find the closest one
      if (!currentSemester && semesterElements.length > 0) {
        let closestDistance = Infinity;
        for (const { id, element } of semesterElements) {
          const rect = element!.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const distance = Math.abs(elementCenter - window.innerHeight / 2);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            currentSemester = id;
          }
        }
      }

      setActiveSemesterId(currentSemester);
    };

    handleScroll(); // Call once to set initial state
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [semesters]);

  const handleSemesterClick = (semesterId: string) => {
    onNavigateToSemester(semesterId);
  };

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (semesters.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-0 top-1/2 transform -translate-y-1/2 hidden lg:block">
      {/* Toggle Button - positioned at the very edge */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleCollapsed}
        className="h-8 w-8 p-0 shadow-md border-2 rounded-l-md rounded-r-none border-r-0 z-20"
        style={{ 
          position: 'relative',
          zIndex: 20
        }}
        title={isCollapsed ? 'Show semester navigation' : 'Hide semester navigation'}
      >
        {isCollapsed ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Navigation Panel - only appears when expanded */}
      {!isCollapsed && (
        <Card 
          className="absolute right-8 top-0 shadow-lg border-2 w-80 z-10 animate-in slide-in-from-right-2 duration-300"
          style={{
            transform: 'translateY(-50%)',
            top: '50%'
          }}
        >
          <CardContent className="p-2">
            <div className="space-y-1 max-h-[50vh] overflow-y-auto">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1 text-center">
                Quick Navigation
              </div>
              {semesters.map((semester) => {
                const isActive = activeSemesterId === semester.id;
                const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
                const completedCredits = semester.courses
                  .filter(course => course.isCompleted)
                  .reduce((sum, course) => sum + course.credits, 0);
                
                return (
                  <Button
                    key={semester.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSemesterClick(semester.id)}
                    className={`w-full justify-start text-left h-auto p-3 ${
                      isActive ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'
                    }`}
                  >
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-1">
                        {getSemesterIcon(semester.type)}
                        <span className="text-sm font-medium truncate leading-tight">
                          {semester.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0.5 ${
                            isActive ? 'border-primary-foreground/20 text-primary-foreground' : ''
                          }`}
                        >
                          {semester.courses.length} courses
                        </Badge>
                        <span className={`text-xs ${
                          isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {completedCredits}/{totalCredits}
                        </span>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}