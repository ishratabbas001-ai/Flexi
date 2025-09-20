/*
  # Insert Sample Data

  1. Sample Data
    - Insert sample schools
    - Insert sample profiles (parents)
    - Insert sample students
    - Insert sample BNPL applications

  2. Notes
    - This data is for testing and demonstration purposes
    - Passwords are simple for demo (should be hashed in production)
*/

-- Insert sample schools
INSERT INTO schools (id, name, email, password, phone, address, principal_name, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Green Valley School', 'school@greenvalley.edu', 'password123', '+92-300-1234567', '123 Education Street, Lahore, Pakistan', 'Dr. Ahmad Hassan', 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'City Public School', 'admin@citypublic.edu.pk', 'password123', '+92-301-2345678', '456 Learning Avenue, Karachi, Pakistan', 'Mrs. Fatima Khan', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Sunrise Academy', 'contact@sunriseacademy.edu', 'password123', '+92-302-3456789', '789 Knowledge Road, Islamabad, Pakistan', 'Mr. Ali Ahmed', 'active'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Elite School System', 'info@eliteschool.edu.pk', 'password123', '+92-303-4567890', '321 Excellence Boulevard, Faisalabad, Pakistan', 'Dr. Sarah Sheikh', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample parent profiles
INSERT INTO profiles (id, name, email, phone, cnic, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'Muhammad Ali Khan', 'parent@example.com', '+92-310-1111111', '12345-6789012-3', 'parent'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Ayesha Ahmed', 'ayesha.ahmed@email.com', '+92-311-2222222', '12345-6789012-4', 'parent'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Hassan Sheikh', 'hassan.sheikh@email.com', '+92-312-3333333', '12345-6789012-5', 'parent'),
  ('550e8400-e29b-41d4-a716-446655440014', 'Fatima Malik', 'fatima.malik@email.com', '+92-313-4444444', '12345-6789012-6', 'parent')
ON CONFLICT (email) DO NOTHING;

-- Insert sample students
INSERT INTO students (id, name, email, phone, class, roll_number, parent_name, parent_email, parent_phone, parent_id, school_id, fee_amount, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', 'Ahmad Ali', 'ahmad.ali@student.com', '+92-320-1111111', 'Grade 10', 'GV-2024-001', 'Muhammad Ali Khan', 'parent@example.com', '+92-310-1111111', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 25000.00, 'active'),
  ('550e8400-e29b-41d4-a716-446655440022', 'Sara Khan', 'sara.khan@student.com', '+92-321-2222222', 'Grade 9', 'CP-2024-002', 'Ayesha Ahmed', 'ayesha.ahmed@email.com', '+92-311-2222222', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 18000.00, 'active'),
  ('550e8400-e29b-41d4-a716-446655440023', 'Hassan Ahmed', 'hassan.ahmed@student.com', '+92-322-3333333', 'Grade 11', 'SA-2024-003', 'Hassan Sheikh', 'hassan.sheikh@email.com', '+92-312-3333333', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 22000.00, 'active'),
  ('550e8400-e29b-41d4-a716-446655440024', 'Fatima Sheikh', 'fatima.sheikh@student.com', '+92-323-4444444', 'Grade 8', 'ES-2024-004', 'Fatima Malik', 'fatima.malik@email.com', '+92-313-4444444', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 30000.00, 'active')
ON CONFLICT (school_id, roll_number) DO NOTHING;

-- Insert sample BNPL applications
INSERT INTO bnpl_applications (id, student_id, parent_id, school_id, total_fee, down_payment, installment_amount, installments, status, approved_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 25000.00, 6250.00, 3125.00, 6, 'approved', now() - interval '30 days'),
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 18000.00, 4500.00, 2250.00, 6, 'approved', now() - interval '20 days'),
  ('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 22000.00, 5500.00, 2750.00, 6, 'pending', null),
  ('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 30000.00, 7500.00, 3750.00, 6, 'rejected', null)
ON CONFLICT (id) DO NOTHING;

-- Update rejection reason for rejected application
UPDATE bnpl_applications 
SET rejection_reason = 'Incomplete documentation provided'
WHERE id = '550e8400-e29b-41d4-a716-446655440034';

-- Insert sample payments for approved applications
INSERT INTO payments (id, bnpl_application_id, student_id, parent_id, amount, payment_type, installment_number, due_date, paid_date, status, payment_method, transaction_id) VALUES
  -- Payments for first application (Ahmad Ali)
  ('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 6250.00, 'down_payment', 0, current_date - interval '30 days', now() - interval '30 days', 'paid', 'GoPayFast', 'TXN001'),
  ('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 3125.00, 'installment', 1, current_date - interval '15 days', now() - interval '15 days', 'paid', 'GoPayFast', 'TXN002'),
  ('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 3125.00, 'installment', 2, current_date + interval '15 days', null, 'pending', null, null),
  
  -- Payments for second application (Sara Khan)
  ('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', 4500.00, 'down_payment', 0, current_date - interval '20 days', now() - interval '20 days', 'paid', 'GoPayFast', 'TXN003'),
  ('550e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', 2250.00, 'installment', 1, current_date + interval '10 days', null, 'pending', null, null)
ON CONFLICT (id) DO NOTHING;