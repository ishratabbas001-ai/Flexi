import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  User,
  School,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Download,
  Eye,
  AlertTriangle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  uploadedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  fileUrl?: string;
  file?: File;
}

interface ApplicationDetails {
  id: string;
  student_name: string;
  student_class: string;
  student_roll_number: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  parent_cnic: string;
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
  documents: Document[];
  created_at: string;
  updated_at: string;
}

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);

  const requiredDocuments = [
    { type: 'cnic_front', name: 'CNIC Front', description: 'Clear photo of CNIC front side' },
    { type: 'cnic_back', name: 'CNIC Back', description: 'Clear photo of CNIC back side' },
    { type: 'education_registration', name: 'Educational Registration', description: 'Proof of registration with educational institute' },
    { type: 'bank_statement', name: 'Bank Statement', description: 'Bank statement for last 6 months' },
    { type: 'salary_slip', name: 'Salary Slip/Business Proof', description: 'Salary slip or proof of business income' },
    { type: 'residence_proof', name: 'Proof of Residence', description: 'Utility bill or rental agreement' },
    { type: 'utility_bills', name: 'Utility Bills', description: 'Electricity, Gas & Internet bills' },
    { type: 'fee_voucher', name: 'Fee Voucher/Challan', description: 'School fee voucher or challan' },
  ];

  useEffect(() => {
    loadApplicationDetails();
  }, [id]);

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      
      const { data: appData, error: appError } = await supabase
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
            phone,
            cnic
          )
        `)
        .eq('id', id)
        .single();
        
      if (appError) throw appError;
      
      // Load documents
      const { data: documentsData, error: docsError } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', id);
        
      if (docsError) throw docsError;
      
      // Create documents array with required documents
      const documents = requiredDocuments.map(reqDoc => {
        const existingDoc = documentsData?.find(doc => doc.document_type === reqDoc.type);
        return {
          id: existingDoc?.id || crypto.randomUUID(),
          name: reqDoc.name,
          type: reqDoc.type,
          status: existingDoc?.status || 'pending',
          uploadedAt: existingDoc?.uploaded_at ? new Date(existingDoc.uploaded_at).toLocaleDateString() : undefined,
          verifiedAt: existingDoc?.verified_at ? new Date(existingDoc.verified_at).toLocaleDateString() : undefined,
          rejectionReason: existingDoc?.rejection_reason,
          fileUrl: existingDoc?.file_url
        };
      });
      
      const transformedApplication: ApplicationDetails = {
        id: appData.id,
        student_name: appData.student?.name || 'Unknown Student',
        student_class: appData.student?.class || 'Unknown Class',
        student_roll_number: appData.student?.roll_number || 'N/A',
        parent_name: appData.parent?.name || 'Unknown Parent',
        parent_email: appData.parent?.email || 'No email',
        parent_phone: appData.parent?.phone || 'No phone',
        parent_cnic: appData.parent?.cnic || 'Not provided',
        school_name: appData.school?.name || 'Unknown School',
        school_id: appData.school_id,
        total_fee: appData.total_fee,
        down_payment: appData.down_payment,
        installment_amount: appData.installment_amount,
        installments: appData.installments,
        status: appData.status,
        applied_date: new Date(appData.created_at).toLocaleDateString(),
        approved_date: appData.approved_at ? new Date(appData.approved_at).toLocaleDateString() : undefined,
        reason: appData.rejection_reason,
        documents,
        created_at: appData.created_at,
        updated_at: appData.updated_at
      };
      
      setApplication(transformedApplication);
    } catch (error) {
      toast.error('Failed to load application details');
      console.error('Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentId: string, file: File) => {
    if (!application) return;
    
    try {
      setUploadingDocument(documentId);
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${application.id}/${documentId}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('application-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('application-documents')
        .getPublicUrl(fileName);
      
      // Save document record to database
      const document = application.documents.find(doc => doc.id === documentId);
      if (document) {
        const { error: dbError } = await supabase
          .from('application_documents')
          .upsert({
            id: documentId,
            application_id: application.id,
            document_type: document.type,
            document_name: document.name,
            file_url: publicUrl,
            status: 'uploaded',
            uploaded_at: new Date().toISOString()
          });
          
        if (dbError) throw dbError;
        
        // Update local state
        const updatedDocuments = application.documents.map(doc => {
          if (doc.id === documentId) {
            return {
              ...doc,
              status: 'uploaded' as const,
              fileUrl: publicUrl,
              uploadedAt: new Date().toLocaleDateString()
            };
          }
          return doc;
        });
        
        setApplication(prev => prev ? { ...prev, documents: updatedDocuments } : null);
        setEditingDocument(null);
        toast.success('Document uploaded successfully!');
      }
    } catch (error) {
      toast.error('Failed to upload document');
      console.error('Error uploading document:', error);
    } finally {
      setUploadingDocument(null);
    }
  };

  const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
    if (!application) return;

    if (newStatus === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else {
        updateData.rejection_reason = rejectionReason;
      }
      
      const { error } = await supabase
        .from('bnpl_applications')
        .update(updateData)
        .eq('id', application.id);
        
      if (error) throw error;
      
      // Update application state
      setApplication(prev => prev ? {
        ...prev,
        status: newStatus,
        approved_date: newStatus === 'approved' ? new Date().toLocaleDateString() : undefined,
        reason: newStatus === 'rejected' ? rejectionReason : undefined,
      } : null);
      
      const statusText = newStatus === 'approved' ? 'approved' : 'rejected';
      toast.success(`Application ${statusText} successfully!`);
    } catch (error) {
      toast.error('Failed to update application status');
      console.error('Error updating application:', error);
    }
  };

  const handleDocumentStatusChange = async (documentId: string, newStatus: 'verified' | 'rejected', reason?: string) => {
    if (!application) return;

    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (newStatus === 'verified') {
        updateData.verified_at = new Date().toISOString();
      } else {
        updateData.rejection_reason = reason;
      }
      
      const { error } = await supabase
        .from('application_documents')
        .update(updateData)
        .eq('id', documentId);
        
      if (error) throw error;

      const updatedDocuments = application.documents.map(doc => {
        if (doc.id === documentId) {
          return {
            ...doc,
            status: newStatus,
            verifiedAt: newStatus === 'verified' ? new Date().toLocaleDateString() : undefined,
            rejectionReason: newStatus === 'rejected' ? reason : undefined,
          };
        }
        return doc;
      });

      setApplication(prev => prev ? { ...prev, documents: updatedDocuments } : null);
      
      const statusText = newStatus === 'verified' ? 'verified' : 'rejected';
      toast.success(`Document ${statusText} successfully!`);
    } catch (error) {
      toast.error('Failed to update document status');
      console.error('Error updating document:', error);
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

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'uploaded':
        return <Badge className="bg-blue-100 text-blue-800">Uploaded</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDocumentIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'uploaded':
        return <Upload className="w-4 h-4 text-blue-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const calculateDocumentProgress = () => {
    if (!application) return 0;
    const verifiedDocs = application.documents.filter(doc => doc.status === 'verified').length;
    return (verifiedDocs / application.documents.length) * 100;
  };

  const canApprove = () => {
    if (!application) return false;
    const allDocumentsVerified = application.documents.every(doc => doc.status === 'verified');
    return allDocumentsVerified && application.status === 'pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/admin/applications')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Application not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/admin/applications')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(application.status)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Student Name</Label>
                  <p className="text-lg font-semibold">{application.student_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Class</Label>
                  <p>{application.student_class}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Roll Number</Label>
                  <p>{application.student_roll_number}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Parent Name</Label>
                  <p>{application.parent_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">CNIC</Label>
                  <p>{application.parent_cnic}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p>{application.parent_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p>{application.parent_phone}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">School</Label>
                <p className="flex items-center">
                  <School className="w-4 h-4 mr-2" />
                  {application.school_name}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">₨ {application.total_fee.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Fee</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">₨ {application.down_payment.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Down Payment</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">₨ {application.installment_amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Per Installment</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{application.installments}</p>
                  <p className="text-sm text-muted-foreground">Installments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Required Documents
              </CardTitle>
              <CardDescription>
                All documents must be verified before approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Document Verification Progress</span>
                  <span>{application.documents.filter(d => d.status === 'verified').length} of {application.documents.length} verified</span>
                </div>
                <Progress value={calculateDocumentProgress()} className="h-2" />
              </div>
              
              <div className="space-y-3">
                {application.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getDocumentIcon(document.status)}
                      <div>
                        <p className="font-medium">{document.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {requiredDocuments.find(d => d.type === document.type)?.description}
                        </p>
                        {document.rejectionReason && (
                          <p className="text-sm text-red-600 mt-1">
                            Reason: {document.rejectionReason}
                          </p>
                        )}
                        {editingDocument === document.id && (
                          <div className="mt-2 space-y-2">
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(document.id, file);
                                }
                              }}
                              disabled={uploadingDocument === document.id}
                            />
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingDocument(null)}
                                disabled={uploadingDocument === document.id}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getDocumentStatusBadge(document.status)}
                      
                      {/* Edit/Upload Button */}
                      {editingDocument !== document.id && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingDocument(document.id)}
                          disabled={uploadingDocument === document.id}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {/* Verification Buttons */}
                      {document.status === 'uploaded' && (
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDocumentStatusChange(document.id, 'verified')}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDocumentStatusChange(document.id, 'rejected', 'Document unclear or invalid')}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      
                      {/* View Button */}
                      {document.fileUrl && (
                        <Button size="sm" variant="outline">
                          <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                      
                      {/* Loading indicator */}
                      {uploadingDocument === document.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Applied Date</Label>
                <p className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {application.applied_date}
                </p>
              </div>
              
              {application.approved_date && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Approved Date</Label>
                  <p className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    {application.approved_date}
                  </p>
                </div>
              )}

              {application.status === 'pending' && (
                <>
                  <Separator />
                  
                  {!canApprove() && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          All documents must be verified before approval
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusChange('approved')}
                    disabled={!canApprove()}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Application
                  </Button>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">Rejection Reason</Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Enter reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => handleStatusChange('rejected')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                </>
              )}

              {application.reason && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Rejection Reason</Label>
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {application.reason}
                      </p>
                    </div>
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

export default ApplicationDetails;