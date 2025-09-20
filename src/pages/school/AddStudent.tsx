import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  address: string;
}

const AddStudent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    address: ''
  });

  const classes = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fee_amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, class: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.schoolId) {
      toast.error('School information not found');
      return;
    }

    setLoading(true);

    try {
      // First, create or find parent profile
      let parentId = null;
      
      if (formData.parent_email) {
        // Check if parent already exists
        const { data: existingParent } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', formData.parent_email)
          .single();

        if (existingParent) {
          parentId = existingParent.id;
        } else {
          // Create new parent profile
          const { data: newParent, error: parentError } = await supabase
            .from('profiles')
            .insert([{
              name: formData.parent_name,
              email: formData.parent_email,
              phone: formData.parent_phone,
              cnic: formData.parent_cnic,
              role: 'parent'
            }])
            .select()
            .single();

          if (parentError) throw parentError;
          parentId = newParent.id;
        }
      }

      // Create student record
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          class: formData.class,
          roll_number: formData.roll_number,
          parent_name: formData.parent_name,
          parent_email: formData.parent_email,
          parent_phone: formData.parent_phone,
          parent_id: parentId,
          school_id: user.schoolId,
          fee_amount: formData.fee_amount,
          status: 'active'
        }])
        .select()
        .single();

      if (studentError) throw studentError;

      toast.success('Student added successfully!');
      navigate('/students');
    } catch (error: any) {
      console.error('Error adding student:', error);
      if (error.code === '23505') {
        toast.error('Roll number already exists for this school');
      } else {
        toast.error('Failed to add student. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/students')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Add New Student
          </CardTitle>
          <CardDescription>
            Enter student details to add them to your school
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
                  <Select value={formData.class} onValueChange={handleSelectChange}>
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
                  <Label htmlFor="parent_cnic">Parent CNIC *</Label>
                  <Input
                    id="parent_cnic"
                    name="parent_cnic"
                    value={formData.parent_cnic}
                    onChange={handleInputChange}
                    placeholder="12345-6789012-3"
                    required
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

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Adding Student...' : 'Add Student'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/students')}
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

export default AddStudent;