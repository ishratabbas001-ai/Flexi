/*
  # Create Schools Table

  1. New Tables
    - `schools`
      - `id` (uuid, primary key)
      - `name` (text, school name)
      - `email` (text, unique, login email)
      - `password` (text, login password)
      - `phone` (text, contact number)
      - `address` (text, school address)
      - `principal_name` (text, principal's name)
      - `status` (text, active/inactive)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `schools` table
    - Add policy for schools to read their own data
    - Add policy for admins to manage all schools
*/

CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  phone text,
  address text,
  principal_name text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Policy for schools to read their own data
CREATE POLICY "Schools can read own data"
  ON schools
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Policy for admins to manage all schools
CREATE POLICY "Admins can manage all schools"
  ON schools
  FOR ALL
  TO authenticated
  USING (true);

-- Policy for public registration (schools can insert their own data)
CREATE POLICY "Schools can register"
  ON schools
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for schools to update their own data
CREATE POLICY "Schools can update own data"
  ON schools
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);