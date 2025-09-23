import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Search, 
  GraduationCap, 
  CreditCard, 
  Mail, 
  Phone,
  Edit,
  Eye,
  UserPlus
} from 'lucide-react';
import { db } from '@/lib/supabase';
import { toast } from 'sonner';

interface StudentData {
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
  has_bnpl: boolean;
  bnpl_status?: 'active' | 'pending' | 'completed';
  status: 'active' | 'inactive';
  created_at: string;
}

const Students = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      
      if (!user?.schoolId) {
        toast.error('School information not found');
        return;
      }
      
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          bnpl_applications(
            id,
            status
          )
        `)
        .eq('school_id', user.schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedStudents = data?.map(student => {
        const bnplApplication = student.bnpl_applications?.[0];
        return {
          id: student.id,
          name: student.name,
          email: student.email || 'No email',
          phone: student.phone || 'No phone',
          class: student.class,
          roll_number: student.roll_number,
          parent_name: student.parent_name || 'Not provided',
          parent_email: student.parent_email || 'No email',
          parent_phone: student.parent_phone || 'No phone',
          fee_amount: student.fee_amount || 0,
          has_bnpl: !!bnplApplication,
          bnpl_status: bnplApplication?.status as 'active' | 'pending' | 'completed' | undefined,
          status: student.status || 'active',
          created_at: new Date(student.created_at).toLocaleDateString()
        };
      }) || [];
      
      setStudents(transformedStudents);
    } catch (error) {
      toast.error('Students load nahi ho sake');
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parent_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = filterClass === 'all' || student.class === filterClass;
    
    return matchesSearch && matchesClass;
  });

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
  };

  const getBNPLStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Active Application</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Application Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Application Completed</Badge>;
      default:
        return null;
    }
  };

  const classes = ['all', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

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
          <h1 className="text-2xl sm:text-3xl font-bold">Students Management</h1>
          <p className="text-muted-foreground">
            Manage your student payment plans and applications.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => navigate('/school/add-student')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Student
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Student name, roll number ya parent name se search karein..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm w-full sm:w-auto"
            >
              {classes.map(cls => (
                <option key={cls} value={cls}>
                  {cls === 'all' ? 'All Classes' : cls}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <CardDescription>{student.roll_number}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(student.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Class:</span>
                  <span className="text-sm font-medium">{student.class}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fee:</span>
                  <span className="text-sm font-medium">₨ {student.fee_amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{student.email}</span>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Parent Details:</p>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{student.parent_name}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Phone className="w-3 h-3 mr-1" />
                    <span>{student.parent_phone}</span>
                  </div>
                </div>
              </div>

              {student.has_bnpl && (
                <div className="flex items-center justify-between pt-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  {getBNPLStatusBadge(student.bnpl_status)}
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/students/${student.id}/view`)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/students/${student.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterClass !== 'all' 
                ? 'Koi student nahi mila search criteria ke mutabiq' 
                : 'Abhi tak koi student register nahi hai'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Students;