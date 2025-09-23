import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Users, 
  DollarSign, 
  TrendingUp,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface BNPLStats {
  totalApplications: number;
  approvedPlans: number;
  pendingApplications: number;
  rejectedApplications: number;
  totalCollections: number;
  pendingPayments: number;
  approvalRate: number;
}

interface BNPLApplication {
  id: string;
  student_name: string;
  student_class: string;
  parent_name: string;
  total_fee: number;
  down_payment: number;
  installment_amount: number;
  installments: number;
  status: 'pending' | 'approved' | 'rejected';
  applied_date: string;
  approved_date?: string;
  next_payment_due?: string;
  payments_made: number;
  remaining_amount: number;
}

const BNPLPlans = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<BNPLStats | null>(null);
  const [applications, setApplications] = useState<BNPLApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadBNPLData();
  }, []);

  const loadBNPLData = async () => {
    try {
      setLoading(true);
      
      if (!user?.schoolId) {
        toast.error('School information not found');
        return;
      }

      // Load BNPL applications for this school
      const { data: applicationsData, error: appsError } = await supabase
        .from('bnpl_applications')
        .select(`
          *,
          student:students(name, class),
          parent:profiles!bnpl_applications_parent_id_fkey(name),
          payments(amount, status, paid_date)
        `)
        .eq('school_id', user.schoolId)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      // Calculate stats
      const totalApplications = applicationsData?.length || 0;
      const approvedPlans = applicationsData?.filter(app => app.status === 'approved').length || 0;
      const pendingApplications = applicationsData?.filter(app => app.status === 'pending').length || 0;
      const rejectedApplications = applicationsData?.filter(app => app.status === 'rejected').length || 0;
      const approvalRate = totalApplications > 0 ? (approvedPlans / totalApplications) * 100 : 0;

      // Calculate collections and pending payments
      let totalCollections = 0;
      let pendingPayments = 0;

      applicationsData?.forEach(app => {
        if (app.payments) {
          app.payments.forEach((payment: any) => {
            if (payment.status === 'paid') {
              totalCollections += parseFloat(payment.amount);
            } else if (payment.status === 'pending') {
              pendingPayments += parseFloat(payment.amount);
            }
          });
        }
      });

      setStats({
        totalApplications,
        approvedPlans,
        pendingApplications,
        rejectedApplications,
        totalCollections,
        pendingPayments,
        approvalRate
      });

      // Transform applications data
      const transformedApplications = applicationsData?.map(app => {
        const paidPayments = app.payments?.filter((p: any) => p.status === 'paid') || [];
        const totalPaid = paidPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
        const remainingAmount = app.total_fee - totalPaid;
        
        return {
          id: app.id,
          student_name: app.student?.name || 'Unknown Student',
          student_class: app.student?.class || 'Unknown Class',
          parent_name: app.parent?.name || 'Unknown Parent',
          total_fee: app.total_fee,
          down_payment: app.down_payment,
          installment_amount: app.installment_amount,
          installments: app.installments,
          status: app.status,
          applied_date: new Date(app.created_at).toLocaleDateString(),
          approved_date: app.approved_at ? new Date(app.approved_at).toLocaleDateString() : undefined,
          payments_made: paidPayments.length,
          remaining_amount: remainingAmount,
          next_payment_due: '2024-02-15' // This would be calculated from payments table
        };
      }) || [];

      setApplications(transformedApplications);
    } catch (error) {
      console.error('Error loading BNPL data:', error);
      toast.error('Failed to load BNPL data');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.student_class.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl sm:text-3xl font-bold">BNPL Plans</h1>
          <p className="text-muted-foreground">
            Manage applications and payment plans
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {stats.approvalRate.toFixed(1)}% approval rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Plans</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedPlans}</div>
              <p className="text-xs text-muted-foreground">
                Active payment plans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₨ {stats.totalCollections.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From Installment payments
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
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, parent name or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(application.status)}
                        <h3 className="font-semibold text-lg">{application.student_name}</h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {application.student_class} • Parent: {application.parent_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₨ {application.total_fee.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Fee</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">₨ {application.down_payment.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Down Payment</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">₨ {application.installment_amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{application.installments} Installments</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{application.applied_date}</p>
                        <p className="text-xs text-muted-foreground">Applied Date</p>
                      </div>
                    </div>
                    
                    {application.status === 'approved' && (
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{application.payments_made}/{application.installments + 1}</p>
                          <p className="text-xs text-muted-foreground">Payments Made</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {application.status === 'approved' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Progress</span>
                        <span>₨ {(application.total_fee - application.remaining_amount).toLocaleString()} / ₨ {application.total_fee.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={((application.total_fee - application.remaining_amount) / application.total_fee) * 100} 
                        className="h-2" 
                      />
                      <p className="text-xs text-muted-foreground">
                        Remaining: ₨ {application.remaining_amount.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {application.status === 'approved' && application.next_payment_due && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-blue-600" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Next payment of ₨ {application.installment_amount.toLocaleString()} due on {application.next_payment_due}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'No applications found matching filter criteria' 
                : 'No applications received yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BNPLPlans;