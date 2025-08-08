import { useEffect, useState } from 'react';
import { AdminJobForm } from './AdminJobForm';
import { getAllJobs, addJob, removeJob, updateJob, getJobMetrics, getJobById } from '@/lib/store';
import { Job } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Trash2, Calendar, FileText, Edit2, BarChart, Share2, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const navigate = useNavigate();
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [metrics, setMetrics] = useState<ReturnType<typeof getJobMetrics> | null>(null);

  // Check authentication
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [navigate]);

  // Load jobs and metrics
  useEffect(() => {
    const loadJobs = () => {
      const allJobs = getAllJobs();
      setJobs(allJobs);
      setMetrics(getJobMetrics(allJobs));
    };
    
    loadJobs();
  }, []);

  const handleAddJob = (jobData: Parameters<typeof addJob>[0]) => {
    if (isEditing && jobToEdit) {
      // Update existing job
      const updatedJob = updateJob(jobToEdit.id, jobData);
      setJobs(prevJobs => 
        prevJobs.map(job => job.id === jobToEdit.id ? updatedJob : job)
      );
      setJobToEdit(null);
      setIsEditing(false);
    } else {
      // Add new job
      const newJob = addJob(jobData);
      setJobs(prevJobs => [...prevJobs, newJob]);
    }
    // Update metrics after job changes
    setMetrics(getJobMetrics(getAllJobs()));
  };

  const handleEditJob = (job: Job) => {
    // Make sure we have all the job data
    const fullJobData = getJobById(job.id) || job;
    setJobToEdit(fullJobData);
    setIsEditing(true);
  };

  // Open confirm dialog before deletion
  const confirmDeleteJob = (id: string) => {
    setJobToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Actually delete the job after confirmation
  const handleDeleteJob = () => {
    if (jobToDelete) {
      removeJob(jobToDelete);
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobToDelete));
      // Update metrics after job deletion
      setMetrics(getJobMetrics(getAllJobs()));
      toast.success('Job deleted successfully');
      setJobToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    navigate('/');
    toast.info('Logged out successfully');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="space-x-2">
          <Button onClick={() => navigate('/')} variant="outline">
            View Public Site
          </Button>
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>
      </div>

      {metrics && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Metrics Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
                <CardDescription className="text-2xl font-bold">{metrics.activeJobs}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {metrics.percentActive}% of total jobs
                </div>
                <Progress value={metrics.percentActive} className="h-1 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Job Shares</CardTitle>
                <CardDescription className="text-2xl font-bold">{metrics.totalShares}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Avg {metrics.avgSharesPerJob} shares per job
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Share2 className="h-3 w-3" />
                  <span>Most shared: {metrics.mostSharedJobTitle || 'None'}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
                <CardDescription className="text-2xl font-bold">{metrics.jobsExpiringSoon}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  In the next 7 days
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Expired jobs: {metrics.expiredJobs}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Edit Job' : 'Add New Job'}
          </h2>
          <AdminJobForm 
            onAddJob={handleAddJob} 
            initialValues={jobToEdit || undefined}
            isEditing={isEditing}
          />
          {isEditing && (
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => {
                setIsEditing(false);
                setJobToEdit(null);
              }}
            >
              Cancel Editing
            </Button>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Manage Existing Jobs ({jobs.length})</h2>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="absolute top-4 right-4 flex">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditJob(job)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 mr-1"
                      >
                        <Edit2 size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => confirmDeleteJob(job.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                    <h3 className="font-medium text-lg mb-2">{job.title}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Qualification: {job.qualificationRequired}</p>
                      {(job.ageMin || job.ageMax) && (
                        <p>
                          Age: {job.ageMin || 'Any'} - {job.ageMax || 'Any'}
                        </p>
                      )}
                      {job.genderPreference && job.genderPreference !== 'Any' && (
                        <p>Gender Preference: {job.genderPreference}</p>
                      )}
                      {job.salary && <p>Salary: {job.salary}</p>}
                      {job.experience && <p>Experience: {job.experience}</p>}
                      <p className="text-xs truncate">Apply Link: {job.applyLink}</p>
                      
                      {job.expirationDate && (
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Expires: {format(new Date(job.expirationDate), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      
                      {job.attachmentUrl && (
                        <div className="flex items-center gap-1 mt-1">
                          <FileText className="h-3.5 w-3.5" />
                          <a href={job.attachmentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            View attachment
                          </a>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 mt-1">
                        <Share2 className="h-3.5 w-3.5" />
                        <span className="text-sm">Shares: {job.shareCount || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground">No jobs added yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJobToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}