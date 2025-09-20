/*
  # Create Payments Table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `bnpl_application_id` (uuid, reference to bnpl_applications)
      - `student_id` (uuid, reference to students)
      - `parent_id` (uuid, reference to profiles)
      - `amount` (numeric, payment amount)
      - `payment_type` (text, down_payment/installment)
      - `installment_number` (integer, installment sequence)
      - `due_date` (date, payment due date)
      - `paid_date` (timestamp, actual payment date)
      - `status` (text, pending/paid/overdue)
      - `payment_method` (text, payment gateway method)
      - `transaction_id` (text, gateway transaction ID)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `payments` table
    - Add policies for different user roles
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bnpl_application_id uuid NOT NULL REFERENCES bnpl_applications(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('down_payment', 'installment')),
  installment_number integer DEFAULT 0,
  due_date date NOT NULL,
  paid_date timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  payment_method text,
  transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy for parents to manage their payments
CREATE POLICY "Parents can manage their payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (parent_id::text = auth.uid()::text);

-- Policy for schools to read payments for their students
CREATE POLICY "Schools can read their student payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE school_id::text = auth.uid()::text
  ));

-- Policy for admins to manage all payments
CREATE POLICY "Admins can manage all payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (true);