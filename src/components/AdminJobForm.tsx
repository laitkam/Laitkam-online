import { useState, useRef, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { qualificationOptions, genderOptions } from '@/lib/store';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AdminJobFormProps {
  onAddJob: (job: {
    title: string;
    qualificationRequired: string;
    ageMin?: number;
    ageMax?: number;
    genderPreference?: string;
    applyLink: string;
    expirationDate?: string;
    attachmentUrl?: string;
    salary?: string;
    experience?: string;
    numberOfPosts?: number;
  }) => void;
  initialValues?: {
    id?: string;
    title: string;
    qualificationRequired: string;
    ageMin?: number;
    ageMax?: number;
    genderPreference?: string;
    applyLink: string;
    expirationDate?: string;
    attachmentUrl?: string;
    salary?: string;
    experience?: string;
    numberOfPosts?: number;
  };
  isEditing?: boolean;
}

export function AdminJobForm({ onAddJob, initialValues, isEditing = false }: AdminJobFormProps) {
  const [title, setTitle] = useState('');
  const [qualification, setQualification] = useState('');
  const [ageMin, setAgeMin] = useState<number | undefined>(undefined);
  const [ageMax, setAgeMax] = useState<number | undefined>(undefined);
  const [genderPreference, setGenderPreference] = useState('Any');
  const [applyLink, setApplyLink] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('');
  const [numberOfPosts, setNumberOfPosts] = useState<number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define resetForm function first
  const resetForm = () => {
    setTitle('');
    setQualification('');
    setAgeMin(undefined);
    setAgeMax(undefined);
    setGenderPreference('Any');
    setApplyLink('');
    setExpirationDate('');
    setAttachment(null);
    setAttachmentUrl('');
    setSalary('');
    setExperience('');
    setNumberOfPosts(undefined);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Update form when initialValues changes
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
      setQualification(initialValues.qualificationRequired || '');
      setAgeMin(initialValues.ageMin);
      setAgeMax(initialValues.ageMax);
      setGenderPreference(initialValues.genderPreference || 'Any');
      setApplyLink(initialValues.applyLink || '');
      setExpirationDate(initialValues.expirationDate || '');
      setAttachmentUrl(initialValues.attachmentUrl || '');
      setSalary(initialValues.salary || '');
      setExperience(initialValues.experience || '');
      setNumberOfPosts(initialValues.numberOfPosts);
    } else {
      // Reset form if initialValues is undefined
      resetForm();
    }
  }, [initialValues]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      
      // Create a local URL for preview
      const fileUrl = URL.createObjectURL(file);
      setAttachmentUrl(fileUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title) {
      toast.error('Please enter a job title');
      return;
    }
    
    if (!qualification) {
      toast.error('Please select a qualification');
      return;
    }
    
    if (ageMin && ageMax && ageMin > ageMax) {
      toast.error('Minimum age cannot be greater than maximum age');
      return;
    }
    
    if (!applyLink) {
      toast.error('Please enter an application link');
      return;
    }

    // Validate expiration date is in the future if provided
    if (expirationDate) {
      const expDate = new Date(expirationDate);
      const today = new Date();
      
      if (expDate <= today) {
        toast.error('Expiration date must be in the future');
        return;
      }
    }
    
    // Submit job
    onAddJob({
      title,
      qualificationRequired: qualification,
      ageMin,
      ageMax,
      genderPreference,
      applyLink,
      expirationDate: expirationDate || undefined,
      attachmentUrl: attachmentUrl || undefined,
      salary: salary || undefined,
      experience: experience || undefined,
      numberOfPosts: numberOfPosts,
    });
    
    if (!isEditing) {
      // Only reset form for new jobs
      resetForm();
      toast.success('Job added successfully!');
    } else {
      toast.success('Job updated successfully!');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Job Listing' : 'Add New Job Listing'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              placeholder="Enter job title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification Required</Label>
              <Select
                value={qualification}
                onValueChange={setQualification}
              >
                <SelectTrigger id="qualification">
                  <SelectValue placeholder="Select Qualification" />
                </SelectTrigger>
                <SelectContent>
                  {qualificationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender Preference</Label>
              <Select
                value={genderPreference}
                onValueChange={setGenderPreference}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select Gender Preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">Any</SelectItem>
                  {genderOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageMin">Minimum Age</Label>
              <Input
                id="ageMin"
                type="number"
                placeholder="Minimum age"
                value={ageMin || ''}
                onChange={(e) => setAgeMin(e.target.value ? Number(e.target.value) : undefined)}
                min={18}
                max={65}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ageMax">Maximum Age</Label>
              <Input
                id="ageMax"
                type="number"
                placeholder="Maximum age"
                value={ageMax || ''}
                onChange={(e) => setAgeMax(e.target.value ? Number(e.target.value) : undefined)}
                min={18}
                max={65}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                placeholder="e.g. ₹20,000 - ₹30,000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Required</Label>
              <Input
                id="experience"
                placeholder="e.g. 2-3 years"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfPosts">No. of Posts</Label>
              <Input
                id="numberOfPosts"
                type="number"
                placeholder="Enter number of positions"
                value={numberOfPosts || ''}
                onChange={(e) => setNumberOfPosts(e.target.value ? Number(e.target.value) : undefined)}
                min={1}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expirationDate">Expiration Date</Label>
            <Input
              id="expirationDate"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
            <p className="text-xs text-muted-foreground">Leave blank for no expiration</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="applyLink">Apply Link</Label>
            <Input
              id="applyLink"
              placeholder="https://example.com/apply"
              value={applyLink}
              onChange={(e) => setApplyLink(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment (PDF, Doc, etc.)</Label>
            <Input
              id="attachment"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
            />
            {attachmentUrl && (
              <div className="mt-2 p-2 bg-muted rounded-md flex items-center justify-between">
                <span className="text-sm truncate">File uploaded</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setAttachment(null);
                    setAttachmentUrl('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full">{isEditing ? 'Update Job' : 'Add Job'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}