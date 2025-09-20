/*
  # Add Sample Payment Data

  1. Sample Data
    - Insert additional sample payments for demonstration
    - Update existing payment records with payment methods
    - Add more payment history for testing

  2. Notes
    - This creates realistic payment scenarios
    - Includes different payment methods and statuses
*/

-- Insert additional sample payments for better demonstration
INSERT INTO payments (id, bnpl_application_id, student_id, parent_id, amount, payment_type, installment_number, due_date, paid_date, status, payment_method, transaction_id) VALUES
  -- More payments for first application (Ahmad Ali)
  ('550e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 3125.00, 'installment', 3, current_date + interval '45 days', null, 'pending', null, null),
  ('550e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 3125.00, 'installment', 4, current_date + interval '75 days', null, 'pending', null, null),
  ('550e8400-e29b-41d4-a716-446655440048', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 3125.00, 'installment', 5, current_date + interval '105 days', null, 'pending', null, null),
  ('550e8400-e29b-41d4-a716-446655440049', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 3125.00, 'installment', 6, current_date + interval '135 days', null, 'pending', null, null),
  
  -- More payments for second application (Sara Khan)
  ('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', 2250.00, 'installment', 2, current_date + interval '40 days', null, 'pending', null, null),
  ('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', 2250.00, 'installment', 3, current_date + interval '70 days', null, 'pending', null, null),
  ('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', 2250.00, 'installment', 4, current_date + interval '100 days', null, 'pending', null, null),
  ('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', 2250.00, 'installment', 5, current_date + interval '130 days', null, 'pending', null, null),
  ('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', 2250.00, 'installment', 6, current_date + interval '160 days', null, 'pending', null, null),
  
  -- Additional sample payments with different methods for variety
  ('550e8400-e29b-41d4-a716-446655440055', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 3125.00, 'installment', 7, current_date - interval '5 days', current_date - interval '3 days', 'paid', 'EasyPaisa', 'EP001234'),
  ('550e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', 2250.00, 'installment', 7, current_date - interval '10 days', current_date - interval '8 days', 'paid', 'JazzCash', 'JC005678'),
  ('550e8400-e29b-41d4-a716-446655440057', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 3125.00, 'installment', 8, current_date - interval '15 days', current_date - interval '12 days', 'paid', 'Bank Transfer', 'BT009876')
ON CONFLICT (id) DO NOTHING;

-- Update existing payments with payment methods for better demonstration
UPDATE payments 
SET payment_method = 'Credit/Debit Card'
WHERE payment_method = 'GoPayFast';

-- Update some payments to show variety in payment methods
UPDATE payments 
SET payment_method = 'Bank Transfer', transaction_id = 'BT001122'
WHERE id = '550e8400-e29b-41d4-a716-446655440042';

UPDATE payments 
SET payment_method = 'EasyPaisa', transaction_id = 'EP003344'
WHERE id = '550e8400-e29b-41d4-a716-446655440044';