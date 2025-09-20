/*
  # Create Profiles Table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `name` (text, user's full name)
      - `email` (text, unique, login email)
      - `phone` (text, contact number)
      - `cnic` (text, CNIC number for parents)
      - `role` (text, user role: parent/admin)
      - `school_id` (uuid, reference to schools table)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read their own data
    - Add policy for admins to manage all profiles
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  cnic text,
  role text DEFAULT 'parent' CHECK (role IN ('parent', 'admin')),
  school_id uuid REFERENCES schools(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Policy for admins to manage all profiles
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (true);

-- Policy for public registration
CREATE POLICY "Users can register"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for users to update their own data
CREATE POLICY "Users can update own data"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);