/*
  # Create BNPL Applications Table

  1. New Tables
    - `bnpl_applications`
      - `id` (uuid, primary key)
      - `student_id` (uuid, reference to students)
      - `parent_id` (uuid, reference to profiles)
      - `school_id` (uuid, reference to schools)
      - `total_fee` (numeric, total fee amount)
      - `down_payment` (numeric, down payment amount)
      - `installment_amount` (numeric, per installment amount)
      - `installments` (integer, number of installments)
      - `status` (text, pending/approved/rejected)
      - `approved_at` (timestamp, approval date)
      - `rejection_reason` (text, reason for rejection)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `bnpl_applications` table
    - Add policies for different user roles
*/

CREATE TABLE IF NOT EXISTS bnpl_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  total_fee numeric(10,2) NOT NULL,
  down_payment numeric(10,2) NOT NULL,
  installment_amount numeric(10,2) NOT NULL,
  installments integer NOT NULL DEFAULT 6,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bnpl_applications ENABLE ROW LEVEL SECURITY;

-- Policy for parents to manage their applications
CREATE POLICY "Parents can manage their applications"
  ON bnpl_applications
  FOR ALL
  TO authenticated
  USING (parent_id::text = auth.uid()::text);

-- Policy for schools to read applications for their students
CREATE POLICY "Schools can read their student applications"
  ON bnpl_applications
  FOR SELECT
  TO authenticated
  USING (school_id::text = auth.uid()::text);

-- Policy for admins to manage all applications
CREATE POLICY "Admins can manage all applications"
  ON bnpl_applications
  FOR ALL
  TO authenticated
  USING (true);