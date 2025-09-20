import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  UserPlus, 
  Users, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface EnrollmentStats {
  totalStudents: number;
  newThisMonth: number;
  activeStudents: number;
  pendingEnrollments: number;
  monthlyGrowth: number;
  classDistribution: Array<{ class: string; count: number }>;
}

interface RecentEnrollment {
  id: string;
  student_name: string;
  class: string;
  parent_name: string;
  enrollment_date: string;
  status: 'active' | 'pending' | 'inactive';
  fee_amount: number;
}

const Enrollment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<EnrollmentStats | null>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEnrollmentData();
  }, []);

  const loadEnrollmentData = async () => {
    try {
      setLoading(true);
      
      if (!user?.schoolId) {
        toast.error('School information not found');
        return;
      }

      // Load students data
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', user.schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate stats
      const totalStudents = students?.length || 0;
      const activeStudents = students?.filter(s => s.status === 'active').length || 0;
      const pendingEnrollments = students?.filter(s => s.status === 'pending').length || 0;
      
      // Calculate new enrollments this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newThisMonth = students?.filter(s => {
        const enrollmentDate = new Date(s.created_at);
        return enrollmentDate.getMonth() === currentMonth && 
               enrollmentDate.getFullYear() === currentYear;
      }).length || 0;

      // Calculate monthly growth
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const newLastMonth = students?.filter(s => {
        const enrollmentDate = new Date(s.created_at);
        return enrollmentDate.getMonth() === lastMonth && 
               enrollmentDate.getFullYear() === lastMonthYear;
      }).length || 0;

      const monthlyGrowth = newLastMonth > 0 ? ((newThisMonth - newLastMonth) / newLastMonth) * 100 : 0;

      // Calculate class distribution
      const classDistribution: { [key: string]: number } = {};
      students?.forEach(student => {
        classDistribution[student.class] = (classDistribution[student.class] || 0) + 1;
      });

      const classDistributionArray = Object.entries(classDistribution).map(([className, count]) => ({
        class: className,
        count
      })).sort((a, b) => b.count - a.count);

      setStats({
        totalStudents,
        newThisMonth,
        activeStudents,
        pendingEnrollments,
        monthlyGrowth,
        classDistribution: classDistributionArray
      });

      // Transform recent enrollments
      const recentEnrollmentsData = students?.slice(0, 10).map(student => ({
        id: student.id,
        student_name: student.name,
        class: student.class,
        parent_name: student.parent_name || 'Not provided',
        enrollment_date: new Date(student.created_at).toLocaleDateString(),
        status: student.status as 'active' | 'pending' | 'inactive',
        fee_amount: student.fee_amount || 0
      })) || [];

      setRecentEnrollments(recentEnrollmentsData);
    } catch (error) {
      console.error('Error loading enrollment data:', error);
      toast.error('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredEnrollments = recentEnrollments.filter(enrollment =>
    enrollment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Student Enrollment</h1>
          <p className="text-muted-foreground">
            Manage student enrollments and track admission statistics
          </p>
        </div>
        <Button onClick={() => navigate('/school/add-student')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Student
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeStudents} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalStudents > 0 ? ((stats.activeStudents / stats.totalStudents) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Recent Enrollments
              </CardTitle>
              <CardDescription>
                Latest student enrollments and their status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {filteredEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(enrollment.status)}
                      <div>
                        <p className="font-medium">{enrollment.student_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.class} • Parent: {enrollment.parent_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enrolled: {enrollment.enrollment_date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium">₨ {enrollment.fee_amount.toLocaleString()}</p>
                      {getStatusBadge(enrollment.status)}
                    </div>
                  </div>
                ))}
              </div>

              {filteredEnrollments.length === 0 && (
                <div className="text-center py-8">
                  <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No enrollments found matching search criteria' : 'No recent enrollments'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Class Distribution */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Class Distribution</CardTitle>
                <CardDescription>
                  Student distribution across classes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.classDistribution.slice(0, 8).map((classData, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{classData.class}</span>
                      <span>{classData.count} students</span>
                    </div>
                    <Progress 
                      value={stats.totalStudents > 0 ? (classData.count / stats.totalStudents) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/school/add-student')}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Student
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/students')}
              >
                <Users className="mr-2 h-4 w-4" />
                View All Students
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/reports')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Enrollment Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Enrollment;