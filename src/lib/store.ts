import { Job, JobFilter, QualificationOption } from "@/types";

// Local Storage Keys
const JOBS_STORAGE_KEY = 'job-listing-jobs';

// Sample data for initial setup
const sampleJobs: Job[] = [
  {
    id: '1',
    title: 'Software Developer',
    qualificationRequired: 'Graduate',
    ageMin: 21,
    ageMax: 35,
    genderPreference: 'Any',
    applyLink: 'https://example.com/apply/1',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Data Analyst',
    qualificationRequired: 'Graduate',
    ageMin: 22,
    ageMax: 40,
    genderPreference: 'Any',
    applyLink: 'https://example.com/apply/2',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'HR Assistant',
    qualificationRequired: '12th',
    ageMin: 20,
    ageMax: 30,
    genderPreference: 'Female',
    applyLink: 'https://example.com/apply/3',
    createdAt: new Date().toISOString()
  }
];

// Initialize job store
const initializeJobs = (): Job[] => {
  const storedJobs = localStorage.getItem(JOBS_STORAGE_KEY);
  if (!storedJobs) {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(sampleJobs));
    return sampleJobs;
  }
  return JSON.parse(storedJobs);
};

// Get all jobs
export const getAllJobs = (includeExpired: boolean = true): Job[] => {
  const jobs = initializeJobs();
  
  // If we need to include expired jobs, return all jobs
  if (includeExpired) {
    return jobs;
  }
  
  // Return only non-expired jobs
  const currentDate = new Date();
  return jobs.filter(job => {
    if (!job.expirationDate) return true;
    return new Date(job.expirationDate) >= currentDate;
  });
};

// Get only active (non-expired) jobs
export const getActiveJobs = (): Job[] => {
  return getAllJobs(false);
};

// Add a new job
export const addJob = (job: Omit<Job, 'id' | 'createdAt'>): Job => {
  const newJob: Job = {
    ...job,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    shareCount: 0,
  };
  
  const jobs = getAllJobs();
  const updatedJobs = [...jobs, newJob];
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));
  
  return newJob;
};

// Update an existing job
export const updateJob = (id: string, jobData: Omit<Job, 'id' | 'createdAt'>): Job => {
  const jobs = getAllJobs();
  const existingJob = jobs.find(job => job.id === id);
  
  if (!existingJob) {
    throw new Error(`Job with id ${id} not found`);
  }
  
  const updatedJob: Job = {
    ...existingJob,
    ...jobData,
    id,
    createdAt: existingJob.createdAt,
    shareCount: existingJob.shareCount || 0
  };
  
  const updatedJobs = jobs.map(job => job.id === id ? updatedJob : job);
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));
  
  return updatedJob;
};

// Get job by id
export const getJobById = (id: string): Job | undefined => {
  const jobs = getAllJobs();
  return jobs.find(job => job.id === id);
};

// Increment share count for a job
export const incrementShareCount = (id: string): void => {
  const jobs = getAllJobs();
  const updatedJobs = jobs.map(job => {
    if (job.id === id) {
      return {
        ...job,
        shareCount: (job.shareCount || 0) + 1
      };
    }
    return job;
  });
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));
};

// Filter jobs
export const filterJobs = (filter: JobFilter): Job[] => {
  // Only get non-expired jobs for public viewing
  const jobs = getActiveJobs();
  
  return jobs.filter(job => {
    // Gender filter
    if (filter.gender && job.genderPreference && 
        job.genderPreference !== 'Any' && 
        job.genderPreference !== filter.gender) {
      return false;
    }
    
    // Age filter
    if (filter.age !== undefined) {
      if (
        (job.ageMin !== undefined && filter.age < job.ageMin) ||
        (job.ageMax !== undefined && filter.age > job.ageMax)
      ) {
        return false;
      }
    }
    
    // Qualification filter - show jobs with required qualification level <= user's qualification level
    if (filter.qualification) {
      const userQualificationLevel = getQualificationLevel(filter.qualification);
      const jobQualificationLevel = getQualificationLevel(job.qualificationRequired);
      
      // Only show jobs where the required qualification level is less than or equal to user's level
      if (jobQualificationLevel > userQualificationLevel) {
        return false;
      }
    }
    
    return true;
  });
};

// Remove a job
export const removeJob = (id: string): void => {
  const jobs = getAllJobs();
  const updatedJobs = jobs.filter(job => job.id !== id);
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));
};

// Get metrics for the admin dashboard
export const getJobMetrics = (jobsData?: Job[]) => {
  const jobs = jobsData || getAllJobs();
  const currentDate = new Date();
  const nextWeek = new Date(currentDate);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  // Total active jobs
  const activeJobs = jobs.filter(job => {
    if (!job.expirationDate) return true;
    return new Date(job.expirationDate) >= currentDate;
  });
  
  // Jobs expiring in the next 7 days
  const expiringJobs = jobs.filter(job => {
    if (!job.expirationDate) return false;
    const expDate = new Date(job.expirationDate);
    return expDate >= currentDate && expDate <= nextWeek;
  });
  
  // Most shared jobs (top 5)
  const mostSharedJobs = [...jobs]
    .sort((a, b) => (b.shareCount || 0) - (a.shareCount || 0))
    .slice(0, 5);
    
  // Get most shared job title
  const mostSharedJobTitle = mostSharedJobs.length > 0 ? mostSharedJobs[0].title : 'None';
  
  // Calculate total shares
  const totalShares = jobs.reduce((sum, job) => sum + (job.shareCount || 0), 0);
  
  // Calculate average shares per job
  const avgSharesPerJob = jobs.length > 0 ? (totalShares / jobs.length).toFixed(1) : '0';
  
  // Count expired jobs
  const expiredJobs = jobs.filter(job => {
    if (!job.expirationDate) return false;
    return new Date(job.expirationDate) < currentDate;
  }).length;
  
  return {
    activeJobs: activeJobs.length,
    percentActive: jobs.length > 0 ? Math.round((activeJobs.length / jobs.length) * 100) : 0,
    jobsExpiringSoon: expiringJobs.length,
    expiredJobs,
    mostSharedJobs,
    mostSharedJobTitle,
    totalShares,
    avgSharesPerJob
  };
};

// Get qualification level for sorting/comparing
export const getQualificationLevel = (qualification: string): number => {
  const levels: Record<string, number> = {
    'VI': 1,
    'VII': 2,
    'VIII': 3,
    'IX': 4,
    '10th': 5,
    '11th': 6,
    '12th': 7,
    'Diploma': 8,
    'Graduate': 9,
    'Post Graduate': 10,
    'M.Phil': 11,
    'PhD': 12
  };
  return levels[qualification] || 0;
};

// Get qualification options for dropdown
export const qualificationOptions: QualificationOption[] = [
  'VI', 'VII', 'VIII', 'IX', '10th', '11th', '12th', 'Diploma', 'Graduate', 'Post Graduate', 'M.Phil', 'PhD'
];

// Get gender options for dropdown
export const genderOptions = ['Male', 'Female', 'Other'];