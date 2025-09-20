/*
  # Create Application Documents Table

  1. New Tables
    - `application_documents`
      - `id` (uuid, primary key)
      - `application_id` (uuid, reference to bnpl_applications)
      - `document_type` (text, type of document)
      - `document_name` (text, display name)
      - `file_url` (text, storage URL)
      - `status` (text, pending/uploaded/verified/rejected)
      - `uploaded_at` (timestamp, upload date)
      - `verified_at` (timestamp, verification date)
      - `rejection_reason` (text, reason for rejection)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `application_documents` table
    - Add policies for different user roles
*/

CREATE TABLE IF NOT EXISTS application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES bnpl_applications(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_name text NOT NULL,
  file_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'verified', 'rejected')),
  uploaded_at timestamptz,
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

-- Policy for parents to manage documents for their applications
CREATE POLICY "Parents can manage their application documents"
  ON application_documents
  FOR ALL
  TO authenticated
  USING (application_id IN (
    SELECT id FROM bnpl_applications WHERE parent_id::text = auth.uid()::text
  ));

-- Policy for schools to read documents for their student applications
CREATE POLICY "Schools can read their student application documents"
  ON application_documents
  FOR SELECT
  TO authenticated
  USING (application_id IN (
    SELECT id FROM bnpl_applications WHERE school_id::text = auth.uid()::text
  ));

-- Policy for admins to manage all documents
CREATE POLICY "Admins can manage all documents"
  ON application_documents
  FOR ALL
  TO authenticated
  USING (true);