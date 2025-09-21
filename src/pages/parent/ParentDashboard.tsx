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
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  FileText,
  School,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface StudentData {
  id: string;
  name: string;
  class: string;
  school_name: string;
  fee_amount: number;
  has_bnpl: boolean;
  bnpl_status?: string;
}

interface BNPLApplication {
  id: string;
  student_name: string;
  total_fee: number;
  down_payment: number;
  installment_amount: number;
  installments: number;
  status: string;
  created_at: string;
  payments_made: number;
  remaining_amount: number;
}

interface PendingPayment {
  id: string;
  amount: number;
  payment_type: string;
  installment_number: number;
  due_date: string;
  student_name: string;
}

const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [bnplApplications, setBnplApplications] = useState<BNPLApplication[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) return;

      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          class,
          fee_amount,
          school:schools(name),
          bnpl_applications(id, status)
        `)
        .eq('parent_id', user.id);

      if (studentsError) throw studentsError;

      const transformedStudents = studentsData?.map(student => ({
        id: student.id,
        name: student.name,
        class: student.class,
        school_name: student.school?.name || 'Unknown School',
        fee_amount: student.fee_amount || 0,
        has_bnpl: !!student.bnpl_applications?.[0],
        bnpl_status: student.bnpl_applications?.[0]?.status
      })) || [];

      setStudents(transformedStudents);

      // Load BNPL applications
      const { data: bnplData, error: bnplError } = await supabase
        .from('bnpl_applications')
        .select(`
          *,
          student:students(name),
          payments(amount, status)
        `)
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      if (bnplError) throw bnplError;

      const transformedBnpl = bnplData?.map(app => {
        const paidPayments = app.payments?.filter((p: any) => p.status === 'paid') || [];
        const totalPaid = paidPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
        
        return {
          id: app.id,
          student_name: app.student?.name || 'Unknown Student',
          total_fee: app.total_fee,
          down_payment: app.down_payment,
          installment_amount: app.installment_amount,
          installments: app.installments,
          status: app.status,
          created_at: new Date(app.created_at).toLocaleDateString(),
          payments_made: paidPayments.length,
          remaining_amount: app.total_fee - totalPaid
        };
      }) || [];

      setBnplApplications(transformedBnpl);

      // Load pending payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          student:students(name)
        `)
        .eq('parent_id', user.id)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(5);

      if (paymentsError) throw paymentsError;

      const transformedPayments = paymentsData?.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        payment_type: payment.payment_type,
        installment_number: payment.installment_number,
        due_date: new Date(payment.due_date).toLocaleDateString(),
        student_name: payment.student?.name || 'Unknown Student'
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

  const getPaymentTypeLabel = (type: string, installmentNumber: number) => {
    return type === 'down_payment' ? 'Down Payment' : `Installment ${installmentNumber}`;
  };

  const calculateProgress = (app: BNPLApplication) => {
    const totalPayments = app.installments + 1; // +1 for down payment
    return (app.payments_made / totalPayments) * 100;
  };

  const stats = {
    totalStudents: students.length,
    activeBNPL: bnplApplications.filter(app => app.status === 'approved').length,
    pendingApplications: bnplApplications.filter(app => app.status === 'pending').length,
    totalPendingAmount: pendingPayments.reduce((sum, payment) => sum + payment.amount, 0)
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
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your children's education payments.
          </p>
        </div>
        <Button onClick={() => navigate('/bnpl/apply')}>
          <Plus className="mr-2 h-4 w-4" />
          Apply for BNPL
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#dcebfe66]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#defce966]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active BNPL Plans</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBNPL}</div>
            <p className="text-xs text-muted-foreground">
              Payment plans running
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#f2e5ff66]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#ffedd666]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₨ {stats.totalPendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Due payments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* My Children */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                My Children
              </CardTitle>
              <CardDescription>
                Overview of your children's enrollment and BNPL status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <School className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No students enrolled yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.class} - {student.school_name}
                        </p>
                        <p className="text-sm font-medium">
                          Annual Fee: ₨ {student.fee_amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        {student.has_bnpl ? (
                          <div className="space-y-1">
                            {getStatusBadge(student.bnpl_status || 'unknown')}
                            <p className="text-xs text-muted-foreground">BNPL Active</p>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => navigate('/bnpl/apply')}
                          >
                            Apply BNPL
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* BNPL Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                BNPL Applications
              </CardTitle>
              <CardDescription>
                Status and progress of your payment plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bnplApplications.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No BNPL applications yet</p>
                  <Button onClick={() => navigate('/bnpl/apply')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Apply for BNPL
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bnplApplications.map((app) => (
                    <div key={app.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{app.student_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Applied: {app.created_at}
                          </p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold">₨ {app.total_fee.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Total Fee</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold">₨ {app.down_payment.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Down Payment</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold">₨ {app.installment_amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Per Installment</p>
                        </div>
                      </div>

                      {app.status === 'approved' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Payment Progress</span>
                            <span>{app.payments_made} of {app.installments + 1} payments</span>
                          </div>
                          <Progress value={calculateProgress(app)} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            Remaining: ₨ {app.remaining_amount.toLocaleString()}
                          </p>
                        </div>
                      )}
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
                Upcoming Payments
              </CardTitle>
              <CardDescription>
                Payments due soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-sm text-muted-foreground">No pending payments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {getPaymentTypeLabel(payment.payment_type, payment.installment_number)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.student_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {payment.due_date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₨ {payment.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  <Button 
                    className="w-full mt-3" 
                    onClick={() => navigate('/parent/payments')}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Make Payment
                  </Button>
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
                onClick={() => navigate('/bnpl/apply')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Apply for BNPL
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/parent/payments')}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Make Payment
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/parent/history')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Payment History
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/parent/settings')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;