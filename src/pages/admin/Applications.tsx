import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  User,
  School,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface BNPLApplication {
  id: string;
  student_name: string;
  student_class: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  school_name: string;
  school_id: string;
  total_fee: number;
  down_payment: number;
  installment_amount: number;
  installments: number;
  status: 'pending' | 'approved' | 'rejected';
  applied_date: string;
  approved_date?: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<BNPLApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('bnpl_applications')
        .select(`
          *,
          student:students(
            name,
            class,
            roll_number
          ),
          school:schools(
            name
          ),
          parent:profiles!bnpl_applications_parent_id_fkey(
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match interface
      const transformedApplications = data?.map(app => ({
        id: app.id,
        student_name: app.student?.name || 'Unknown Student',
        student_class: app.student?.class || 'Unknown Class',
        parent_name: app.parent?.name || 'Unknown Parent',
        parent_email: app.parent?.email || 'No email',
        parent_phone: app.parent?.phone || 'No phone',
        school_name: app.school?.name || 'Unknown School',
        school_id: app.school_id,
        total_fee: app.total_fee,
        down_payment: app.down_payment,
        installment_amount: app.installment_amount,
        installments: app.installments,
        status: app.status,
        applied_date: new Date(app.created_at).toLocaleDateString(),
        approved_date: app.approved_at ? new Date(app.approved_at).toLocaleDateString() : undefined,
        reason: app.rejection_reason,
        created_at: app.created_at,
        updated_at: app.updated_at
      })) || [];
      
      setApplications(transformedApplications);
    } catch (error) {
      toast.error('Failed to load applications');
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('bnpl_applications')
        .update(updateData)
        .eq('id', applicationId);
        
      if (error) throw error;
      
      // Update local state
      const updatedApplications = applications.map(app => {
        if (app.id === applicationId) {
          return {
            ...app,
            status: newStatus,
            approved_date: newStatus === 'approved' ? new Date().toLocaleDateString() : undefined
          };
        }
        return app;
      });
      
      setApplications(updatedApplications);
      
      const statusText = newStatus === 'approved' ? 'approved' : 'rejected';
      toast.success(`Application ${statusText} successfully!`);
    } catch (error) {
      toast.error('Failed to update application status');
      console.error('Error updating application:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.school_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSchool = schoolFilter === 'all' || app.school_name === schoolFilter;
    
    return matchesSearch && matchesStatus && matchesSchool;
  });

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
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const uniqueSchools = [...new Set(applications.map(app => app.school_name))];

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">BNPL Applications</h1>
          <p className="text-muted-foreground">
            Manage student BNPL applications
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, parent name or school name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="School filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {uniqueSchools.map(school => (
                  <SelectItem key={school} value={school}>{school}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                        <h3 className="font-semibold text-lg">{application.student_name}</h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {application.student_class} - {application.school_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₨ {application.total_fee.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Fee</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{application.parent_name}</p>
                        <p className="text-xs text-muted-foreground">Parent</p>
                      </div>
                    </div>
                    
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
                  </div>

                  {application.reason && (
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>Rejection Reason:</strong> {application.reason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 lg:w-auto w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full lg:w-auto"
                    onClick={() => navigate(`/admin/applications/${application.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  
                  {application.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 lg:w-auto bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusChange(application.id, 'approved')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="flex-1 lg:w-auto"
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
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
              {searchTerm || statusFilter !== 'all' || schoolFilter !== 'all' 
                ? 'No applications found matching filter criteria' 
                : 'No BNPL applications received yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Applications;