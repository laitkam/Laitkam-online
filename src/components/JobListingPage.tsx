import { useState, useEffect } from 'react';
import { JobSearchForm } from './JobSearchForm';
import { JobCard } from './JobCard';
import { Job, JobFilter } from '@/types';
import { getAllJobs, filterJobs, getActiveJobs } from '@/lib/store';

export function JobListingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load active (non-expired) jobs on initial render
    const loadJobs = () => {
      setIsLoading(true);
      const activeJobs = getActiveJobs();
      setJobs(activeJobs);
      setIsLoading(false);
    };
    
    loadJobs();
  }, []);

  const handleSearch = (filter: JobFilter) => {
    setIsLoading(true);
    const filteredJobs = filter.gender || filter.age || filter.qualification
      ? filterJobs(filter)
      : getActiveJobs();
    setJobs(filteredJobs);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Job Listing Website</h1>
        <p className="text-muted-foreground">Find your ideal job based on your qualifications</p>
      </header>

      <div className="space-y-8">
        <JobSearchForm onSearch={handleSearch} />
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Jobs</h2>
          {isLoading ? (
            <div className="text-center py-8">Loading jobs...</div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No jobs matching your criteria. Try adjusting your search filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}