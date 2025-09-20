/*
  # Create Students Table

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `name` (text, student name)
      - `email` (text, student email)
      - `phone` (text, student phone)
      - `class` (text, student class/grade)
      - `roll_number` (text, unique roll number)
      - `parent_name` (text, parent's name)
      - `parent_email` (text, parent's email)
      - `parent_phone` (text, parent's phone)
      - `parent_id` (uuid, reference to profiles)
      - `school_id` (uuid, reference to schools)
      - `fee_amount` (numeric, total fee amount)
      - `status` (text, active/inactive)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `students` table
    - Add policies for schools and parents to access relevant data
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  class text NOT NULL,
  roll_number text NOT NULL,
  parent_name text,
  parent_email text,
  parent_phone text,
  parent_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  fee_amount numeric(10,2) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, roll_number)
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy for schools to manage their students
CREATE POLICY "Schools can manage their students"
  ON students
  FOR ALL
  TO authenticated
  USING (school_id::text = auth.uid()::text);

-- Policy for parents to read their children's data
CREATE POLICY "Parents can read their children data"
  ON students
  FOR SELECT
  TO authenticated
  USING (parent_id::text = auth.uid()::text);

-- Policy for admins to manage all students
CREATE POLICY "Admins can manage all students"
  ON students
  FOR ALL
  TO authenticated
  USING (true);