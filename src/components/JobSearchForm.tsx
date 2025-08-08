import { useState, useMemo } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JobFilter, QualificationOption, GenderOption } from '@/types';
import { qualificationOptions, genderOptions } from '@/lib/store';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface JobSearchFormProps {
  onSearch: (filter: JobFilter) => void;
}

export function JobSearchForm({ onSearch }: JobSearchFormProps) {
  const [gender, setGender] = useState<GenderOption | undefined>(undefined);
  const [age, setAge] = useState<number | undefined>(undefined);
  const [qualification, setQualification] = useState<QualificationOption | undefined>(undefined);

  const handleSearch = () => {
    onSearch({
      gender,
      age,
      qualification,
    });
  };
  
  // Show explanation text based on selected qualification
  const qualificationExplanation = useMemo(() => {
    if (!qualification) return null;
    
    const qualMap: Record<string, string> = {
      'VI': 'Class VI',
      'VII': 'Class VII',
      'VIII': 'Class VIII',
      'IX': 'Class IX',
      '10th': 'Class X/Matric',
      '11th': 'Class XI',
      '12th': 'Class XII/HS/PU',
      'Diploma': 'Diploma',
      'Graduate': 'Graduate/Bachelor\'s',
      'Post Graduate': 'Postgraduate/Master\'s',
      'M.Phil': 'M.Phil',
      'PhD': 'PhD'
    };
    
    return `Showing jobs requiring ${qualMap[qualification]} or lower qualifications`;
  }, [qualification]);

  const handleClear = () => {
    // Reset all state variables to their initial values
    setGender(undefined);
    setAge(undefined);
    setQualification(undefined);
    
    // Trigger search with empty filter to show all jobs
    onSearch({});
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">Find Your Ideal Job</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gender Selection */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={gender || ""}
                onValueChange={(value) => setGender(value as GenderOption)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Age Input */}
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={age || ''}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
                min={18}
                max={65}
              />
            </div>

            {/* Qualification Selection */}
            <div className="space-y-2">
              <Label htmlFor="qualification">Your Qualification</Label>
              <Select
                value={qualification || ""}
                onValueChange={(value) => setQualification(value as QualificationOption)}
              >
                <SelectTrigger id="qualification">
                  <SelectValue placeholder="Select Your Qualification" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="VI">Class VI</SelectItem>
                  <SelectItem value="VII">Class VII</SelectItem>
                  <SelectItem value="VIII">Class VIII</SelectItem>
                  <SelectItem value="IX">Class IX</SelectItem>
                  <SelectItem value="10th">Class X/Matric</SelectItem>
                  <SelectItem value="11th">Class XI</SelectItem>
                  <SelectItem value="12th">Class XII/HS/PU</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Graduate">Graduate/Bachelor's</SelectItem>
                  <SelectItem value="Post Graduate">Postgraduate/Master's</SelectItem>
                  <SelectItem value="M.Phil">M.Phil</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Shows jobs requiring qualifications up to your level
              </p>
            </div>
          </div>

          {qualification && (
            <div className="text-sm text-blue-600 pb-2">
              {qualificationExplanation}
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={handleClear}>
              Clear Filters
            </Button>
            <Button onClick={handleSearch}>
              Search Jobs
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}