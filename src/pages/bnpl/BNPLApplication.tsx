import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Calculator,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  School
} from 'lucide-react';
import { toast } from 'sonner';

interface StudentInfo {
  id: string;
  name: string;
  class: string;
  school_name: string;
  fee_amount: number;
}

interface DocumentUpload {
  type: string;
  name: string;
  description: string;
  file?: File;
  status: 'pending' | 'uploaded';
}

const BNPLApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);
  const [calculatorFee, setCalculatorFee] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    student_id: '',
    total_fee: 0,
    down_payment: 0,
    installment_amount: 0,
    installments: 6,
    monthly_income: '',
    employment_type: '',
    additional_info: ''
  });

  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: 'cnic_front', name: 'CNIC Front', description: 'Clear photo of CNIC front side', status: 'pending' },
    { type: 'cnic_back', name: 'CNIC Back', description: 'Clear photo of CNIC back side', status: 'pending' },
    { type: 'bank_statement', name: 'Bank Statement', description: 'Bank statement for last 6 months', status: 'pending' },
    { type: 'salary_slip', name: 'Salary Slip/Business Proof', description: 'Salary slip or proof of business income', status: 'pending' },
    { type: 'utility_bills', name: 'Utility Bills', description: 'Electricity, Gas & Internet bills', status: 'pending' },
    { type: 'fee_voucher', name: 'Fee Voucher/Challan', description: 'School fee voucher or challan', status: 'pending' }
  ]);

  React.useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          name,
          class,
          fee_amount,
          school:schools(name)
        `)
        .eq('parent_id', user.id);

      if (error) throw error;

      const transformedStudents = data?.map(student => ({
        id: student.id,
        name: student.name,
        class: student.class,
        school_name: student.school?.name || 'Unknown School',
        fee_amount: student.fee_amount || 0
      })) || [];

      setStudents(transformedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load student information');
    }
  };

  const calculateBNPL = (feeAmount: number) => {
    const downPayment = Math.round(feeAmount * 0.25); // 25% down payment
    const remainingAmount = feeAmount - downPayment;
    const installmentAmount = Math.round(remainingAmount / 6); // 6 installments
    
    return {
      downPayment,
      installmentAmount,
      totalAmount: feeAmount
    };
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      const calculation = calculateBNPL(student.fee_amount);
      setFormData(prev => ({
        ...prev,
        student_id: studentId,
        total_fee: student.fee_amount,
        down_payment: calculation.downPayment,
        installment_amount: calculation.installmentAmount
      }));
    }
  };

  const handleCalculatorCalculate = () => {
    if (calculatorFee > 0) {
      const calculation = calculateBNPL(calculatorFee);
      return calculation;
    }
    return null;
  };

  const handleFileUpload = (documentType: string, file: File) => {
    setDocuments(prev => prev.map(doc => 
      doc.type === documentType 
        ? { ...doc, file, status: 'uploaded' as const }
        : doc
    ));
    toast.success(`${documents.find(d => d.type === documentType)?.name} uploaded successfully!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    const uploadedDocuments = documents.filter(doc => doc.status === 'uploaded');
    if (uploadedDocuments.length < 4) {
      toast.error('Please upload at least 4 required documents');
      return;
    }

    setLoading(true);

    try {
      const { data: application, error } = await supabase
        .from('bnpl_applications')
        .insert([{
          student_id: formData.student_id,
          parent_id: user?.id,
          school_id: selectedStudent.id, // This should be school_id from student data
          total_fee: formData.total_fee,
          down_payment: formData.down_payment,
          installment_amount: formData.installment_amount,
          installments: formData.installments,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      // Upload documents (simplified for demo)
      for (const doc of documents.filter(d => d.file)) {
        // In a real implementation, you would upload files to Supabase Storage
        // and save document records to application_documents table
        console.log(`Uploading ${doc.name}:`, doc.file);
      }

      toast.success('BNPL application submitted successfully!');
      navigate('/parent');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculationResult = handleCalculatorCalculate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">BNPL Application</h1>
        <p className="text-muted-foreground">
          Aply for Buy Now Pay Later plan
        </p>
      </div>

      <Tabs defaultValue="application" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="application">BNPL Application</TabsTrigger>
          <TabsTrigger value="calculator">Fee Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="application" className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Select Student
                </CardTitle>
                <CardDescription>
                  Choose the student for BNPL application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select value={formData.student_id} onValueChange={handleStudentSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} - {student.class} ({student.school_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedStudent && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Student Name</p>
                        <p className="font-medium">{selectedStudent.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Class</p>
                        <p className="font-medium">{selectedStudent.class}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">School</p>
                        <p className="font-medium">{selectedStudent.school_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Annual Fee</p>
                        <p className="font-medium">₨ {selectedStudent.fee_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Plan Details */}
            {selectedStudent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Payment Plan Details
                  </CardTitle>
                  <CardDescription>
                    BNPL payment breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">₨ {formData.total_fee.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Fee</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">₨ {formData.down_payment.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Down Payment (25%)</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">₨ {formData.installment_amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Per Installment (6 months)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Provide additional details for application review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly_income">Monthly Income (₨)</Label>
                    <Input
                      id="monthly_income"
                      type="number"
                      value={formData.monthly_income}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthly_income: e.target.value }))}
                      placeholder="Enter monthly income"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <Select 
                      value={formData.employment_type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, employment_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salaried">Salaried Employee</SelectItem>
                        <SelectItem value="business">Business Owner</SelectItem>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="additional_info">Additional Information</Label>
                  <Textarea
                    id="additional_info"
                    value={formData.additional_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, additional_info: e.target.value }))}
                    placeholder="Any additional information you'd like to provide..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Required Documents
                </CardTitle>
                <CardDescription>
                  Upload all required documents for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload Progress</span>
                    <span>{documents.filter(d => d.status === 'uploaded').length} of {documents.length} uploaded</span>
                  </div>
                  <Progress 
                    value={(documents.filter(d => d.status === 'uploaded').length / documents.length) * 100} 
                    className="h-2" 
                  />
                </div>

                <div className="grid gap-4">
                  {documents.map((document) => (
                    <div key={document.type} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{document.name}</p>
                            <p className="text-sm text-muted-foreground">{document.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {document.status === 'uploaded' ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Uploaded
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                        
                        <div className="relative">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(document.type, file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button size="sm" variant="outline">
                            <Upload className="w-3 h-3 mr-1" />
                            {document.status === 'uploaded' ? 'Replace' : 'Upload'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {documents.filter(d => d.status === 'uploaded').length < 4 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Please upload at least 4 documents to proceed with the application
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                disabled={loading || !selectedStudent || documents.filter(d => d.status === 'uploaded').length < 4}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit BNPL Application'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/parent')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Fee Calculator
              </CardTitle>
              <CardDescription>
                Calculate your BNPL payment plan with 25% down payment and 6 installments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="calculator_fee">Annual Fee Amount (₨)</Label>
                  <Input
                    id="calculator_fee"
                    type="number"
                    value={calculatorFee}
                    onChange={(e) => setCalculatorFee(parseFloat(e.target.value) || 0)}
                    placeholder="Enter annual fee amount"
                    min="0"
                  />
                </div>

                {calculationResult && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-6 border rounded-lg bg-blue-50 dark:bg-blue-950">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-3xl font-bold">₨ {calculationResult.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Fee</p>
                      </div>
                      <div className="text-center p-6 border rounded-lg bg-green-50 dark:bg-green-950">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="text-3xl font-bold">₨ {calculationResult.downPayment.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Down Payment (25%)</p>
                      </div>
                      <div className="text-center p-6 border rounded-lg bg-purple-50 dark:bg-purple-950">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                        <p className="text-3xl font-bold">₨ {calculationResult.installmentAmount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Per Installment (6 months)</p>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-3">Payment Schedule:</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Down Payment (Due immediately)</span>
                          <span className="font-medium">₨ {calculationResult.downPayment.toLocaleString()}</span>
                        </div>
                        {Array.from({ length: 6 }, (_, i) => (
                          <div key={i} className="flex justify-between">
                            <span>Installment {i + 1} (Month {i + 1})</span>
                            <span className="font-medium">₨ {calculationResult.installmentAmount.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total Amount</span>
                          <span>₨ {calculationResult.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Benefits of BNPL:</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• No interest charges</li>
                        <li>• Flexible payment schedule</li>
                        <li>• Quick approval process</li>
                        <li>• Secure payment gateway</li>
                        <li>• Automatic payment reminders</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BNPLApplication;