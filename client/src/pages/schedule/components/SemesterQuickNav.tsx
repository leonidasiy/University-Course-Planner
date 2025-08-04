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
  const [isCollapsed, setIsCollapsed] = React.useState(false);

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
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden xl:block">
      {/* Navigation Panel */}
      <Card 
        className={`shadow-lg border-2 transition-all duration-300 ${
          isCollapsed ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
        }`}
      >
        <CardContent className="p-1">
          <div className="space-y-1 max-h-[50vh] overflow-y-auto">
            <div className="text-[10px] font-medium text-muted-foreground px-2 py-1 text-center">
              Quick Nav
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
                  className={`w-full justify-start text-left h-auto p-1.5 min-w-[140px] ${
                    isActive ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center gap-1.5 mb-1">
                      {getSemesterIcon(semester.type)}
                      <span className="text-[11px] font-medium truncate leading-tight">
                        {semester.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <Badge 
                        variant="outline" 
                        className={`text-[8px] px-1 py-0 h-4 ${
                          isActive ? 'border-primary-foreground/20 text-primary-foreground' : ''
                        }`}
                      >
                        {semester.courses.length}
                      </Badge>
                      <span className={`text-[9px] ${
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

      {/* Toggle Button - positioned on the right side */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'translate-x-0' : 'translate-x-[12px]'}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCollapsed}
          className={`absolute top-0 h-8 w-8 p-0 shadow-md border-2 transition-all duration-300 ${
            isCollapsed 
              ? 'left-full rounded-r-md rounded-l-none border-l-0' 
              : 'left-0 rounded-l-md rounded-r-none border-r-0'
          }`}
          title={isCollapsed ? 'Show semester navigation' : 'Hide semester navigation'}
        >
          {isCollapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}