import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Major } from '../types/major';
import { Settings, Plus, GripVertical, X, Palette } from 'lucide-react';

interface MajorSettingsProps {
  majors: Major[];
  onUpdateMajor: (majorId: string, updates: Partial<Major>) => void;
  onAddMajor: (major: Major) => void;
  onRemoveMajor: (majorId: string) => void;
  onReorderMajors: (dragIndex: number, dropIndex: number) => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#c026d3', '#d946ef', '#ec4899', '#f43f5e'
];

export function MajorSettings({
  majors,
  onUpdateMajor,
  onAddMajor,
  onRemoveMajor,
  onReorderMajors
}: MajorSettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingMajor, setEditingMajor] = React.useState<Major | null>(null);
  const [newMajor, setNewMajor] = React.useState({
    id: '',
    name: '',
    color: '#3b82f6',
    display_order: majors.length + 1
  });
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  const handleAddMajor = () => {
    if (newMajor.id && newMajor.name) {
      // Check if ID already exists
      if (majors.some(m => m.id === newMajor.id)) {
        alert('Major ID already exists. Please choose a different ID.');
        return;
      }

      onAddMajor({
        id: newMajor.id.toUpperCase(),
        name: newMajor.name,
        color: newMajor.color,
        display_order: majors.length + 1
      });
      
      setNewMajor({
        id: '',
        name: '',
        color: '#3b82f6',
        display_order: majors.length + 2
      });
      setIsDialogOpen(false);
    }
  };

  const handleEditMajor = (major: Major) => {
    setEditingMajor({ ...major });
  };

  const handleSaveEdit = () => {
    if (editingMajor && editingMajor.name.trim()) {
      onUpdateMajor(editingMajor.id, {
        name: editingMajor.name.trim(),
        color: editingMajor.color
      });
      setEditingMajor(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMajor(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== dropIndex) {
      onReorderMajors(dragIndex, dropIndex);
    }
    setDragIndex(null);
  };

  const canRemoveMajor = (majorId: string) => {
    // Don't allow removing if it's the last major or if it's being used
    return majors.length > 1;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Major Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Major Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="text-sm text-muted-foreground">
            Customize the major categories and their colors. Drag to reorder.
          </div>
          
          {majors.map((major, index) => (
            <Card key={major.id} className="relative">
              <CardContent className="p-4">
                {editingMajor?.id === major.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`edit-name-${major.id}`}>Major Name</Label>
                      <Input
                        id={`edit-name-${major.id}`}
                        value={editingMajor.name}
                        onChange={(e) => setEditingMajor({ ...editingMajor, name: e.target.value })}
                        placeholder="Enter major name"
                      />
                    </div>
                    
                    <div>
                      <Label>Color</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="color"
                          value={editingMajor.color}
                          onChange={(e) => setEditingMajor({ ...editingMajor, color: e.target.value })}
                          className="w-12 h-9 p-1 rounded border"
                        />
                        <div className="flex flex-wrap gap-1">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400"
                              style={{ backgroundColor: color }}
                              onClick={() => setEditingMajor({ ...editingMajor, color })}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className="cursor-move"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        style={{ 
                          borderColor: major.color, 
                          color: major.color,
                          backgroundColor: `${major.color}15`
                        }}
                      >
                        {major.id}
                      </Badge>
                      <span className="font-medium">{major.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMajor(major)}
                      >
                        Edit
                      </Button>
                      {canRemoveMajor(major.id) && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onRemoveMajor(major.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Major
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="new-major-id">Major ID</Label>
                    <Input
                      id="new-major-id"
                      value={newMajor.id}
                      onChange={(e) => setNewMajor({ ...newMajor, id: e.target.value })}
                      placeholder="e.g., MATH"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-major-name">Major Name</Label>
                    <Input
                      id="new-major-name"
                      value={newMajor.name}
                      onChange={(e) => setNewMajor({ ...newMajor, name: e.target.value })}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Color</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="color"
                      value={newMajor.color}
                      onChange={(e) => setNewMajor({ ...newMajor, color: e.target.value })}
                      className="w-12 h-9 p-1 rounded border"
                    />
                    <div className="flex flex-wrap gap-1">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400"
                          style={{ backgroundColor: color }}
                          onClick={() => setNewMajor({ ...newMajor, color })}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddMajor} 
                  disabled={!newMajor.id || !newMajor.name}
                  className="w-full"
                >
                  Add Major
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}