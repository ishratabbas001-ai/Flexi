import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  User,
  School,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  DollarSign,
  Edit,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface StudentDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  roll_number: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  fee_amount: number;
  status: string;
  created_at: string;
  bnpl_application?: {
    id: string;
    status: string;
    total_fee: number;
    down_payment: number;
    installment_amount: number;
    installments: number;
    created_at: string;
    payments: Array<{
      id: string;
      amount: number;
      status: string;
      due_date: string;
      paid_date?: string;
      payment_type: string;
      installment_number: number;
    }>;
  };
}

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentDetails();
  }, [id]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      
      if (!user?.schoolId || !id) {
        toast.error('Invalid request');
        return;
      }

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          bnpl_applications(
            id,
            status,
            total_fee,
            down_payment,
            installment_amount,
            installments,
            created_at,
            payments(
              id,
              amount,
              status,
              due_date,
              paid_date,
              payment_type,
              installment_number
            )
          )
        `)
        .eq('id', id)
        .eq('school_id', user.schoolId)
        .single();

      if (studentError) throw studentError;

      const transformedStudent: StudentDetails = {
        id: studentData.id,
        name: studentData.name,
        email: studentData.email || 'No email',
        phone: studentData.phone || 'No phone',
        class: studentData.class,
        roll_number: studentData.roll_number,
        parent_name: studentData.parent_name || 'Not provided',
        parent_email: studentData.parent_email || 'No email',
        parent_phone: studentData.parent_phone || 'No phone',
        fee_amount: studentData.fee_amount || 0,
        status: studentData.status,
        created_at: new Date(studentData.created_at).toLocaleDateString(),
        bnpl_application: studentData.bnpl_applications?.[0] ? {
          id: studentData.bnpl_applications[0].id,
          status: studentData.bnpl_applications[0].status,
          total_fee: studentData.bnpl_applications[0].total_fee,
          down_payment: studentData.bnpl_applications[0].down_payment,
          installment_amount: studentData.bnpl_applications[0].installment_amount,
          installments: studentData.bnpl_applications[0].installments,
          created_at: new Date(studentData.bnpl_applications[0].created_at).toLocaleDateString(),
          payments: studentData.bnpl_applications[0].payments || []
        } : undefined
      };

      setStudent(transformedStudent);
    } catch (error) {
      console.error('Error loading student details:', error);
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBNPLStatusBadge = (status: string) => {
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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculatePaymentProgress = () => {
    if (!student?.bnpl_application?.payments) return 0;
    const paidPayments = student.bnpl_application.payments.filter(p => p.status === 'paid').length;
    const totalPayments = student.bnpl_application.installments + 1; // +1 for down payment
    return (paidPayments / totalPayments) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/students')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Student not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/students')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate(`/students/${student.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Student
          </Button>
          {getStatusBadge(student.status)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="font-medium">{student.roll_number}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{student.class}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual Fee</p>
                  <p className="font-medium">₨ {student.fee_amount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {student.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {student.phone}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Enrollment Date</p>
                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {student.created_at}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card>
            <CardHeader>
              <CardTitle>Parent/Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Parent Name</p>
                  <p className="font-medium">{student.parent_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parent Email</p>
                  <p className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {student.parent_email}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Parent Phone</p>
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {student.parent_phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* BNPL Information */}
          {student.bnpl_application && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Plan Details
                </CardTitle>
                <CardDescription>
                  Plan information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span>Application Status:</span>
                  {getBNPLStatusBadge(student.bnpl_application.status)}
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">₨ {student.bnpl_application.total_fee.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Fee</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">₨ {student.bnpl_application.down_payment.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Down Payment</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">₨ {student.bnpl_application.installment_amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Per Installment</p>
                  </div>
                </div>

                {student.bnpl_application.status === 'approved' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Progress</span>
                        <span>
                          {student.bnpl_application.payments.filter(p => p.status === 'paid').length} of {student.bnpl_application.installments + 1} payments
                        </span>
                      </div>
                      <Progress value={calculatePaymentProgress()} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Payment History</h4>
                      {student.bnpl_application.payments
                        .sort((a, b) => a.installment_number - b.installment_number)
                        .map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">
                              {payment.payment_type === 'down_payment' ? 'Down Payment' : `Installment ${payment.installment_number}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(payment.due_date).toLocaleDateString()}
                              {payment.paid_date && ` • Paid: ${new Date(payment.paid_date).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-medium">₨ {payment.amount.toLocaleString()}</p>
                            {getPaymentStatusBadge(payment.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" onClick={() => navigate(`/students/${student.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Student Details
              </Button>
              
              {student.bnpl_application && (
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Application
                </Button>
              )}
              
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Payment History
              </Button>
            </CardContent>
          </Card>

          {/* Student Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Student Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Status</span>
                <span className="text-sm font-medium capitalize">{student.status}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Payment Plan</span>
                <span className="text-sm font-medium">
                  {student.bnpl_application ? 'Active' : 'None'}
                </span>
              </div>
              
              {student.bnpl_application && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm">Payments Made</span>
                    <span className="text-sm font-medium">
                      {student.bnpl_application.payments.filter(p => p.status === 'paid').length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Remaining Payments</span>
                    <span className="text-sm font-medium">
                      {(student.bnpl_application.installments + 1) - student.bnpl_application.payments.filter(p => p.status === 'paid').length}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;