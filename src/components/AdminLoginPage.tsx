import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// The admin password - in a real app this would be stored securely
const ADMIN_PASSWORD = 'Admin5433#';

export function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      // Set a flag in sessionStorage to indicate successful login
      // This is just for demo purposes - not a secure authentication method
      sessionStorage.setItem('adminAuthenticated', 'true');
      navigate('/admin/dashboard');
      toast.success('Login successful');
    } else {
      toast.error('Access Denied - Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="container mx-auto py-16 px-4 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')} 
                className="text-sm"
              >
                Return to Home
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}