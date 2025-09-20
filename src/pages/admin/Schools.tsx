import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  School, 
  Plus, 
  Search, 
  Users, 
  MapPin, 
  Mail, 
  Phone,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { db } from '@/lib/supabase';
import { toast } from 'sonner';

interface SchoolData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  principal_name: string;
  password: string;
  student_count: number;
  bnpl_students: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface SchoolFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  principal_name: string;
  password: string;
  status: 'active' | 'inactive';
}

const Schools = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    principal_name: '',
    password: '',
    status: 'active'
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('schools')
        .select(`
          *,
          students(count),
          bnpl_applications(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedSchools = data?.map(school => ({
        id: school.id,
        name: school.name,
        email: school.email,
        phone: school.phone || 'Not provided',
        address: school.address || 'Not provided',
        principal_name: school.principal_name || 'Not provided',
        password: school.password || 'password123', // For display purposes
        student_count: school.students?.length || 0,
        bnpl_students: school.bnpl_applications?.length || 0,
        status: school.status || 'active',
        created_at: new Date(school.created_at).toLocaleDateString()
      })) || [];
      
      setSchools(transformedSchools);
    } catch (error) {
      toast.error('Schools load nahi ho sake');
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      principal_name: '',
      password: '',
      status: 'active'
    });
  };

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const { data, error } = await supabase
        .from('schools')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          principal_name: formData.principal_name,
          password: formData.password,
          status: formData.status
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      const newSchool: SchoolData = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        principal_name: data.principal_name,
        password: data.password,
        student_count: 0,
        bnpl_students: 0,
        status: data.status,
        created_at: new Date(data.created_at).toLocaleDateString()
      };

      const updatedSchools = [newSchool, ...schools];
      setSchools(updatedSchools);
      
      toast.success('School added successfully!');
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error adding school');
      console.error('Error adding school:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;

    setFormLoading(true);

    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          principal_name: formData.principal_name,
          password: formData.password,
          status: formData.status
        })
        .eq('id', editingSchool.id);
        
      if (error) throw error;
      
      const updatedSchool: SchoolData = {
        ...editingSchool,
        ...formData
      };

      const updatedSchools = schools.map(school => 
        school.id === editingSchool.id ? updatedSchool : school
      );
      
      setSchools(updatedSchools);

      toast.success('School details updated successfully!');
      setIsEditDialogOpen(false);
      setEditingSchool(null);
      resetForm();
    } catch (error) {
      toast.error('Error updating school');
      console.error('Error updating school:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);
        
      if (error) throw error;
      
      const updatedSchools = schools.filter(school => school.id !== schoolId);
      setSchools(updatedSchools);
      
      toast.success(`${schoolName} deleted successfully!`);
    } catch (error) {
      toast.error('Error deleting school');
      console.error('Error deleting school:', error);
    }
  };

  const openEditDialog = (school: SchoolData) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      email: school.email,
      phone: school.phone,
      address: school.address,
      principal_name: school.principal_name,
      password: school.password,
      status: school.status
    });
    setIsEditDialogOpen(true);
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.principal_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
  };

  const SchoolForm = ({ onSubmit, title, submitText, isEdit = false }: { 
    onSubmit: (e: React.FormEvent) => void; 
    title: string; 
    submitText: string;
    isEdit?: boolean;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">School Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter school name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="principal_name">Principal Name *</Label>
          <Input
            id="principal_name"
            value={formData.principal_name}
            onChange={(e) => setFormData(prev => ({ ...prev, principal_name: e.target.value }))}
            placeholder="Enter principal name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="school@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+92-300-1234567"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
            type={isEdit ? (showEditPassword ? 'text' : 'password') : (showPassword ? 'text' : 'password')}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Enter school password"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => isEdit ? setShowEditPassword(!showEditPassword) : setShowPassword(!showPassword)}
          >
            {(isEdit ? showEditPassword : showPassword) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Enter complete school address"
          required
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => 
          setFormData(prev => ({ ...prev, status: value }))
        }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={formLoading}>
          <Save className="w-4 h-4 mr-2" />
          {formLoading ? 'Saving...' : submitText}
        </Button>
      </DialogFooter>
    </form>
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
          <h1 className="text-2xl sm:text-3xl font-bold">Schools Management</h1>
          <p className="text-muted-foreground">
            Manage registered schools and their details
          </p>
        </div>
        
        {/* Add New School Dialog */}
        <Button className="w-full sm:w-auto" onClick={() => navigate('/admin/add-school')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New School
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by school name, email or principal name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schools Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <School className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    <CardDescription>{school.principal_name}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(school.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{school.email}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{school.phone}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="truncate">{school.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-blue-600 mr-1" />
                  </div>
                  <p className="text-2xl font-bold">{school.student_count}</p>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <School className="w-4 h-4 text-green-600 mr-1" />
                  </div>
                  <p className="text-2xl font-bold">{school.bnpl_students}</p>
                  <p className="text-xs text-muted-foreground">BNPL Students</p>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                {/* Edit School Dialog */}
                <Dialog open={isEditDialogOpen && editingSchool?.id === school.id} onOpenChange={(open) => {
                  if (!open) {
                    setIsEditDialogOpen(false);
                    setEditingSchool(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openEditDialog(school)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>School Details Edit Karein</DialogTitle>
                      <DialogDescription>
                        Update details for {school.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <SchoolForm 
                      onSubmit={handleEditSchool}
                      title="Edit School"
                      submitText="Update School"
                      isEdit={true}
                    />
                  </DialogContent>
                </Dialog>

                {/* Delete School Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete School?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete <strong>{school.name}</strong>? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteSchool(school.id, school.name)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete School
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <School className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No schools found matching search criteria' : 'No schools registered yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Schools;