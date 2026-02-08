/*
  # Fix RLS Policies for Events and Public Access

  ## Changes
  - Fix public read policy to allow viewing all non-inactive events
  - Drop restrictive admin policies and create working ones
  - Allow unauthenticated public access to view active events
  - Fix email captures to allow public inserts
*/

-- Drop existing problematic policies on events table
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view active events" ON events;
  DROP POLICY IF EXISTS "Admins can view all events" ON events;
  DROP POLICY IF EXISTS "Admins can insert events" ON events;
  DROP POLICY IF EXISTS "Admins can update events" ON events;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Drop existing problematic policies on email_captures table
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can submit email captures" ON email_captures;
  DROP POLICY IF EXISTS "Admins can view email captures" ON email_captures;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Drop existing problematic policies on admin_users table
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view public admin users" ON admin_users;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- RLS Policies for events table

-- Anyone can view active events
CREATE POLICY "Anyone can view active events"
  ON events FOR SELECT
  TO public
  USING (status != 'inactive');

-- Authenticated users can view all events
CREATE POLICY "Authenticated users can view all events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert events
CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update events
CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for email_captures table

-- Public can insert email captures
CREATE POLICY "Public can insert email captures"
  ON email_captures FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated users can view email captures
CREATE POLICY "Authenticated users can view email captures"
  ON email_captures FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for admin_users table

-- Public cannot view admin users
CREATE POLICY "Public cannot view admin users"
  ON admin_users FOR SELECT
  TO public
  USING (false);