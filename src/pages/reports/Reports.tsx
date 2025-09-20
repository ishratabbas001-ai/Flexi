import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  School, 
  CreditCard, 
  DollarSign,
  Calendar,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportData {
  totalSchools: number;
  totalStudents: number;
  totalBNPLApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  totalCollections: number;
  pendingPayments: number;
  overduePayments: number;
  monthlyGrowth: number;
  applicationsByMonth: Array<{ month: string; count: number; approved: number }>;
  schoolPerformance: Array<{ school: string; students: number; bnplStudents: number; collections: number }>;
  paymentStatus: Array<{ status: string; count: number; amount: number }>;
}

const Reports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadReportData();
    loadSchools();
  }, [selectedPeriod, selectedSchool]);

  const loadSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);

      // Calculate date range based on selected period
      let dateFilter = '';
      const now = new Date();
      switch (selectedPeriod) {
        case 'last_7_days':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'last_30_days':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'last_90_days':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'last_year':
          dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      // Load basic statistics
      const [schoolsResult, studentsResult, applicationsResult, paymentsResult] = await Promise.all([
        // Total schools
        supabase
          .from('schools')
          .select('id', { count: 'exact' })
          .eq('status', 'active'),

        // Total students
        supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('status', 'active')
          .gte('created_at', dateFilter),

        // BNPL applications
        supabase
          .from('bnpl_applications')
          .select('*')
          .gte('created_at', dateFilter),

        // Payments
        supabase
          .from('payments')
          .select('*')
          .gte('created_at', dateFilter)
      ]);

      if (schoolsResult.error) throw schoolsResult.error;
      if (studentsResult.error) throw studentsResult.error;
      if (applicationsResult.error) throw applicationsResult.error;
      if (paymentsResult.error) throw paymentsResult.error;

      const applications = applicationsResult.data || [];
      const payments = paymentsResult.data || [];

      // Calculate statistics
      const totalSchools = schoolsResult.count || 0;
      const totalStudents = studentsResult.count || 0;
      const totalBNPLApplications = applications.length;
      const approvedApplications = applications.filter(app => app.status === 'approved').length;
      const pendingApplications = applications.filter(app => app.status === 'pending').length;
      const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

      const totalCollections = payments
        .filter(payment => payment.status === 'paid')
        .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

      const pendingPayments = payments.filter(payment => payment.status === 'pending').length;
      const overduePayments = payments.filter(payment => payment.status === 'overdue').length;

      // Calculate monthly growth (simplified)
      const currentMonthApps = applications.filter(app => {
        const appDate = new Date(app.created_at);
        const currentMonth = new Date().getMonth();
        return appDate.getMonth() === currentMonth;
      }).length;

      const lastMonthApps = applications.filter(app => {
        const appDate = new Date(app.created_at);
        const lastMonth = new Date().getMonth() - 1;
        return appDate.getMonth() === lastMonth;
      }).length;

      const monthlyGrowth = lastMonthApps > 0 ? ((currentMonthApps - lastMonthApps) / lastMonthApps) * 100 : 0;

      // Applications by month
      const applicationsByMonth = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 0; i < 6; i++) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthIndex = monthDate.getMonth();
        
        const monthApps = applications.filter(app => {
          const appDate = new Date(app.created_at);
          return appDate.getMonth() === monthIndex && appDate.getFullYear() === monthDate.getFullYear();
        });

        applicationsByMonth.unshift({
          month: months[monthIndex],
          count: monthApps.length,
          approved: monthApps.filter(app => app.status === 'approved').length
        });
      }

      // School performance (load additional data)
      const schoolPerformanceResult = await supabase
        .from('schools')
        .select(`
          id,
          name,
          students(count),
          bnpl_applications(count)
        `)
        .eq('status', 'active')
        .limit(10);

      const schoolPerformance = schoolPerformanceResult.data?.map(school => ({
        school: school.name,
        students: school.students?.length || 0,
        bnplStudents: school.bnpl_applications?.length || 0,
        collections: Math.floor(Math.random() * 100000) // Simplified for demo
      })) || [];

      // Payment status breakdown
      const paymentStatus = [
        {
          status: 'Paid',
          count: payments.filter(p => p.status === 'paid').length,
          amount: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
        },
        {
          status: 'Pending',
          count: pendingPayments,
          amount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
        },
        {
          status: 'Overdue',
          count: overduePayments,
          amount: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
        }
      ];

      setReportData({
        totalSchools,
        totalStudents,
        totalBNPLApplications,
        approvedApplications,
        pendingApplications,
        rejectedApplications,
        totalCollections,
        pendingPayments,
        overduePayments,
        monthlyGrowth,
        applicationsByMonth,
        schoolPerformance,
        paymentStatus
      });

    } catch (error) {
      toast.error('Failed to load report data');
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;
    
    const reportContent = `
FlexiFee System Report
Generated: ${new Date().toLocaleDateString()}
Period: ${selectedPeriod.replace('_', ' ')}

SUMMARY STATISTICS:
- Total Schools: ${reportData.totalSchools}
- Total Students: ${reportData.totalStudents}
- BNPL Applications: ${reportData.totalBNPLApplications}
- Approved Applications: ${reportData.approvedApplications}
- Pending Applications: ${reportData.pendingApplications}
- Rejected Applications: ${reportData.rejectedApplications}
- Total Collections: ₨ ${reportData.totalCollections.toLocaleString()}
- Monthly Growth: ${reportData.monthlyGrowth.toFixed(1)}%

PAYMENT STATUS:
${reportData.paymentStatus.map(status => 
  `- ${status.status}: ${status.count} payments (₨ ${status.amount.toLocaleString()})`
).join('\n')}

SCHOOL PERFORMANCE:
${reportData.schoolPerformance.map(school => 
  `- ${school.school}: ${school.students} students, ${school.bnplStudents} BNPL`
).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flexifee-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Failed to load report data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">System Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for FlexiFee system
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadReportData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">School Filter</label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map(school => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              Active institutions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BNPL Applications</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalBNPLApplications}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.monthlyGrowth >= 0 ? '+' : ''}{reportData.monthlyGrowth.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₨ {reportData.totalCollections.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Successful payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.totalBNPLApplications > 0 
                ? ((reportData.approvedApplications / reportData.totalBNPLApplications) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Application approval rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Application Status
            </CardTitle>
            <CardDescription>
              Breakdown of BNPL application statuses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Approved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{reportData.approvedApplications}</span>
                  <Badge className="bg-green-100 text-green-800">
                    {reportData.totalBNPLApplications > 0 
                      ? ((reportData.approvedApplications / reportData.totalBNPLApplications) * 100).toFixed(0)
                      : 0}%
                  </Badge>
                </div>
              </div>
              <Progress 
                value={reportData.totalBNPLApplications > 0 
                  ? (reportData.approvedApplications / reportData.totalBNPLApplications) * 100 
                  : 0} 
                className="h-2" 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{reportData.pendingApplications}</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {reportData.totalBNPLApplications > 0 
                      ? ((reportData.pendingApplications / reportData.totalBNPLApplications) * 100).toFixed(0)
                      : 0}%
                  </Badge>
                </div>
              </div>
              <Progress 
                value={reportData.totalBNPLApplications > 0 
                  ? (reportData.pendingApplications / reportData.totalBNPLApplications) * 100 
                  : 0} 
                className="h-2" 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Rejected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{reportData.rejectedApplications}</span>
                  <Badge className="bg-red-100 text-red-800">
                    {reportData.totalBNPLApplications > 0 
                      ? ((reportData.rejectedApplications / reportData.totalBNPLApplications) * 100).toFixed(0)
                      : 0}%
                  </Badge>
                </div>
              </div>
              <Progress 
                value={reportData.totalBNPLApplications > 0 
                  ? (reportData.rejectedApplications / reportData.totalBNPLApplications) * 100 
                  : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Payment Status
            </CardTitle>
            <CardDescription>
              Current payment status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.paymentStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{status.status}</p>
                    <p className="text-sm text-muted-foreground">{status.count} payments</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₨ {status.amount.toLocaleString()}</p>
                    <Badge 
                      className={
                        status.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        status.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {status.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Applications Trend (Last 6 Months)
          </CardTitle>
          <CardDescription>
            Monthly application submissions and approvals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.applicationsByMonth.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{month.month}</span>
                  <span>{month.count} applications ({month.approved} approved)</span>
                </div>
                <div className="space-y-1">
                  <Progress value={month.count > 0 ? (month.count / Math.max(...reportData.applicationsByMonth.map(m => m.count))) * 100 : 0} className="h-2" />
                  <Progress value={month.count > 0 ? (month.approved / month.count) * 100 : 0} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* School Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Top Performing Schools
          </CardTitle>
          <CardDescription>
            Schools with highest BNPL adoption
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.schoolPerformance.slice(0, 5).map((school, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{school.school}</p>
                  <p className="text-sm text-muted-foreground">
                    {school.students} total students
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-medium">{school.bnplStudents} BNPL students</p>
                  <Badge variant="outline">
                    {school.students > 0 ? ((school.bnplStudents / school.students) * 100).toFixed(1) : 0}% adoption
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Report Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p><strong>Report Period:</strong> {selectedPeriod.replace('_', ' ')}</p>
              <p><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Total Schools:</strong> {reportData.totalSchools}</p>
              <p><strong>Total Students:</strong> {reportData.totalStudents}</p>
            </div>
            <div className="space-y-2">
              <p><strong>BNPL Applications:</strong> {reportData.totalBNPLApplications}</p>
              <p><strong>Approval Rate:</strong> {reportData.totalBNPLApplications > 0 ? ((reportData.approvedApplications / reportData.totalBNPLApplications) * 100).toFixed(1) : 0}%</p>
              <p><strong>Total Collections:</strong> ₨ {reportData.totalCollections.toLocaleString()}</p>
              <p><strong>Pending Payments:</strong> {reportData.pendingPayments}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;