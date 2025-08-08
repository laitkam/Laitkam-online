import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types';
import { ExternalLink, Share2, Calendar, FileText } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { ButtonGroup } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const shareOnWhatsApp = () => {
    // Track share count
    fetch(`/api/track-share?id=${job.id}`, { method: 'POST' })
      .catch(() => {
        // If fetch fails (because this is local storage with no API), 
        // handle it with direct store access
        try {
          // Import the function directly to avoid require
          import('@/lib/store').then(module => {
            module.incrementShareCount(job.id);
          }).catch(error => {
            console.error('Failed to track share:', error);
          });
        } catch (error) {
          console.error('Failed to track share:', error);
        }
      });
    
    const jobText = `Job Opening: ${job.title}\nQualification: ${job.qualificationRequired}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(jobText + "\n\n" + job.applyLink)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const isExpired = job.expirationDate ? isPast(new Date(job.expirationDate)) : false;

  return (
    <Card className={`h-full ${isExpired ? 'opacity-70' : ''}`}>
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div className="flex items-center">
            <span>{job.title}</span>
            {isExpired && (
              <Badge variant="destructive" className="ml-2">
                Expired
              </Badge>
            )}
          </div>
          {job.genderPreference && job.genderPreference !== 'Any' && (
            <Badge variant="outline">
              {job.genderPreference}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-3">
        <div className="text-sm">
          <span className="font-medium">Qualification:</span> {job.qualificationRequired}
        </div>
        
        {(job.ageMin !== undefined || job.ageMax !== undefined) && (
          <div className="text-sm">
            <span className="font-medium">Age:</span>{' '}
            {job.ageMin !== undefined && job.ageMax !== undefined 
              ? `${job.ageMin} - ${job.ageMax} years`
              : job.ageMin 
                ? `Min ${job.ageMin} years` 
                : `Max ${job.ageMax} years`
            }
          </div>
        )}
        
        {job.salary && (
          <div className="text-sm">
            <span className="font-medium">Salary:</span> {job.salary}
          </div>
        )}
        
        {job.experience && (
          <div className="text-sm">
            <span className="font-medium">Experience:</span> {job.experience}
          </div>
        )}
        
        {job.expirationDate && (
          <div className="text-sm flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">Expires:</span>{' '}
            {format(new Date(job.expirationDate), 'MMM dd, yyyy')}
          </div>
        )}
        
        {job.attachmentUrl && (
          <div className="mt-1">
            <Button variant="outline" size="sm" asChild className="w-full text-xs">
              <a 
                href={job.attachmentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <FileText className="mr-1 h-3.5 w-3.5" /> View Attachment
              </a>
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="grid grid-cols-5 w-full gap-2">
          <Button asChild className="col-span-4">
            <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
              Apply Now <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={shareOnWhatsApp} type="button">
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share on WhatsApp</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
}