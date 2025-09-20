import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, User } from 'lucide-react';
import { toast } from 'sonner';

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  class: string;
  roll_number: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  parent_cnic: string;
  fee_amount: number;
  status: string;
}

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    phone: '',
    class: '',
    roll_number: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    parent_cnic: '',
    fee_amount: 0,
    status: 'active'
  });

  const classes = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  useEffect(() => {
    loadStudentData();
  }, [id]);

  const loadStudentData = async () => {
    try {
      setInitialLoading(true);
      
      if (!user?.schoolId || !id) {
        toast.error('Invalid request');
        return;
      }

      const { data: student, error } = await supabase
        .from('students')
        .select(`
          *,
          parent:profiles!students_parent_id_fkey(cnic)
        `)
        .eq('id', id)
        .eq('school_id', user.schoolId)
        .single();

      if (error) throw error;

      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        class: student.class || '',
        roll_number: student.roll_number || '',
        parent_name: student.parent_name || '',
        parent_email: student.parent_email || '',
        parent_phone: student.parent_phone || '',
        parent_cnic: student.parent?.cnic || '',
        fee_amount: student.fee_amount || 0,
        status: student.status || 'active'
      });
    } catch (error) {
      console.error('Error loading student:', error);
      toast.error('Failed to load student data');
      navigate('/students');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fee_amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.schoolId || !id) {
      toast.error('Invalid request');
      return;
    }

    setLoading(true);

    try {
      // Update student record
      const { error: studentError } = await supabase
        .from('students')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          class: formData.class,
          roll_number: formData.roll_number,
          parent_name: formData.parent_name,
          parent_email: formData.parent_email,
          parent_phone: formData.parent_phone,
          fee_amount: formData.fee_amount,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('school_id', user.schoolId);

      if (studentError) throw studentError;

      // Update parent profile if exists
      if (formData.parent_email) {
        const { error: parentError } = await supabase
          .from('profiles')
          .upsert({
            name: formData.parent_name,
            email: formData.parent_email,
            phone: formData.parent_phone,
            cnic: formData.parent_cnic,
            role: 'parent',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'email'
          });

        if (parentError) {
          console.warn('Parent profile update failed:', parentError);
        }
      }

      toast.success('Student updated successfully!');
      navigate(`/students/${id}/view`);
    } catch (error: any) {
      console.error('Error updating student:', error);
      if (error.code === '23505') {
        toast.error('Roll number already exists for this school');
      } else {
        toast.error('Failed to update student. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(`/students/${id}/view`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Student Details
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Edit Student Details
          </CardTitle>
          <CardDescription>
            Update student information and parent details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Student Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Student Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter student's full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roll_number">Roll Number *</Label>
                  <Input
                    id="roll_number"
                    name="roll_number"
                    value={formData.roll_number}
                    onChange={handleInputChange}
                    placeholder="Enter unique roll number"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class *</Label>
                  <Select value={formData.class} onValueChange={(value) => handleSelectChange('class', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee_amount">Annual Fee (₨) *</Label>
                  <Input
                    id="fee_amount"
                    name="fee_amount"
                    type="number"
                    value={formData.fee_amount}
                    onChange={handleInputChange}
                    placeholder="Enter annual fee amount"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Student Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="student@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Student Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92-300-1234567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Parent/Guardian Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parent_name">Parent Name *</Label>
                  <Input
                    id="parent_name"
                    name="parent_name"
                    value={formData.parent_name}
                    onChange={handleInputChange}
                    placeholder="Enter parent's full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_cnic">Parent CNIC</Label>
                  <Input
                    id="parent_cnic"
                    name="parent_cnic"
                    value={formData.parent_cnic}
                    onChange={handleInputChange}
                    placeholder="12345-6789012-3"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parent_email">Parent Email *</Label>
                  <Input
                    id="parent_email"
                    name="parent_email"
                    type="email"
                    value={formData.parent_email}
                    onChange={handleInputChange}
                    placeholder="parent@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_phone">Parent Phone *</Label>
                  <Input
                    id="parent_phone"
                    name="parent_phone"
                    value={formData.parent_phone}
                    onChange={handleInputChange}
                    placeholder="+92-300-1234567"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Updating...' : 'Update Student'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/students/${id}/view`)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditStudent;