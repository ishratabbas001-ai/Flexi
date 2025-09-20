import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserPlus,
  FileText,
  BarChart3,
  Calendar,
  School
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalStudents: number;
  activeBNPLStudents: number;
  pendingApplications: number;
  totalCollections: number;
  monthlyGrowth: number;
  newStudentsThisMonth: number;
}

interface RecentStudent {
  id: string;
  name: string;
  class: string;
  roll_number: string;
  parent_name: string;
  fee_amount: number;
  enrollment_date: string;
  has_bnpl: boolean;
  bnpl_status?: string;
}

interface BNPLApplication {
  id: string;
  student_name: string;
  parent_name: string;
  total_fee: number;
  status: string;
  applied_date: string;
}

interface PendingPayment {
  id: string;
  student_name: string;
  amount: number;
  payment_type: string;
  installment_number: number;
  due_date: string;
  status: string;
}

const SchoolDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [recentApplications, setRecentApplications] = useState<BNPLApplication[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user?.schoolId) {
        toast.error('School information not found');
        return;
      }

      // Load students data
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          bnpl_applications(id, status, created_at)
        `)
        .eq('school_id', user.schoolId)
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;

      // Calculate stats
      const totalStudents = studentsData?.length || 0;
      const activeBNPLStudents = studentsData?.filter(s => 
        s.bnpl_applications?.some((app: any) => app.status === 'approved')
      ).length || 0;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newStudentsThisMonth = studentsData?.filter(s => {
        const enrollmentDate = new Date(s.created_at);
        return enrollmentDate.getMonth() === currentMonth && 
               enrollmentDate.getFullYear() === currentYear;
      }).length || 0;

      // Load BNPL applications
      const { data: applicationsData, error: appsError } = await supabase
        .from('bnpl_applications')
        .select(`
          *,
          student:students(name),
          parent:profiles!bnpl_applications_parent_id_fkey(name)
        `)
        .eq('school_id', user.schoolId)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      const pendingApplications = applicationsData?.filter(app => app.status === 'pending').length || 0;

      // Load payments data
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          student:students(name)
        `)
        .in('student_id', studentsData?.map(s => s.id) || [])
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      const totalCollections = paymentsData?.filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

      // Calculate monthly growth (simplified)
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const newStudentsLastMonth = studentsData?.filter(s => {
        const enrollmentDate = new Date(s.created_at);
        return enrollmentDate.getMonth() === lastMonth && 
               enrollmentDate.getFullYear() === lastMonthYear;
      }).length || 0;

      const monthlyGrowth = newStudentsLastMonth > 0 ? 
        ((newStudentsThisMonth - newStudentsLastMonth) / newStudentsLastMonth) * 100 : 0;

      setStats({
        totalStudents,
        activeBNPLStudents,
        pendingApplications,
        totalCollections,
        monthlyGrowth,
        newStudentsThisMonth
      });

      // Transform recent students
      const transformedStudents = studentsData?.slice(0, 5).map(student => ({
        id: student.id,
        name: student.name,
        class: student.class,
        roll_number: student.roll_number,
        parent_name: student.parent_name || 'Not provided',
        fee_amount: student.fee_amount || 0,
        enrollment_date: new Date(student.created_at).toLocaleDateString(),
        has_bnpl: !!student.bnpl_applications?.[0],
        bnpl_status: student.bnpl_applications?.[0]?.status
      })) || [];

      setRecentStudents(transformedStudents);

      // Transform recent applications
      const transformedApplications = applicationsData?.slice(0, 5).map(app => ({
        id: app.id,
        student_name: app.student?.name || 'Unknown Student',
        parent_name: app.parent?.name || 'Unknown Parent',
        total_fee: app.total_fee,
        status: app.status,
        applied_date: new Date(app.created_at).toLocaleDateString()
      })) || [];

      setRecentApplications(transformedApplications);

      // Transform pending payments
      const transformedPayments = paymentsData?.filter(p => p.status === 'pending')
        .slice(0, 5)
        .map(payment => ({
          id: payment.id,
          student_name: payment.student?.name || 'Unknown Student',
          amount: payment.amount,
          payment_type: payment.payment_type,
          installment_number: payment.installment_number,
          due_date: new Date(payment.due_date).toLocaleDateString(),
          status: payment.status
        })) || [];

      setPendingPayments(transformedPayments);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBNPLStatusBadge = (status?: string) => {
    if (!status) return null;
    switch (status) {
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">BNPL Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">BNPL Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">BNPL Rejected</Badge>;
      default:
        return null;
    }
  };

  const getPaymentTypeLabel = (type: string, installmentNumber: number) => {
    return type === 'down_payment' ? 'Down Payment' : `Installment ${installmentNumber}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your students and BNPL applications.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/school/add-student')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
          <Button onClick={() => navigate('/reports')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
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
                +{stats.newStudentsThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BNPL Students</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBNPLStudents}</div>
              <p className="text-xs text-muted-foreground">
                Active payment plans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₨ {stats.totalCollections.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From BNPL payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5" />
                Recent Enrollments
              </CardTitle>
              <CardDescription>
                Latest student enrollments in your school
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No recent enrollments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{student.name}</p>
                          {getBNPLStatusBadge(student.bnpl_status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {student.class} • Roll: {student.roll_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Parent: {student.parent_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enrolled: {student.enrollment_date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₨ {student.fee_amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Annual Fee</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent BNPL Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Recent BNPL Applications
              </CardTitle>
              <CardDescription>
                Latest Buy Now Pay Later applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No recent applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{app.student_name}</p>
                          {getStatusBadge(app.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Parent: {app.parent_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applied: {app.applied_date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₨ {app.total_fee.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Pending Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Pending Payments
              </CardTitle>
              <CardDescription>
                Student payments due soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-sm text-muted-foreground">All payments up to date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{payment.student_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getPaymentTypeLabel(payment.payment_type, payment.installment_number)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {payment.due_date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">₨ {payment.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
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
                Manage Students
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/school/bnpl-plans')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                BNPL Applications
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/school/enrollment')}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Enrollment Management
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/reports')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          {/* School Performance */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>School Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total Students</span>
                  <span className="text-sm font-medium">{stats.totalStudents}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">BNPL Adoption</span>
                  <span className="text-sm font-medium">
                    {stats.totalStudents > 0 ? ((stats.activeBNPLStudents / stats.totalStudents) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Growth</span>
                  <span className={`text-sm font-medium ${stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}%
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>BNPL Adoption Rate</span>
                    <span>{stats.totalStudents > 0 ? ((stats.activeBNPLStudents / stats.totalStudents) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <Progress 
                    value={stats.totalStudents > 0 ? (stats.activeBNPLStudents / stats.totalStudents) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;