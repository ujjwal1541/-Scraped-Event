/*
  # Create Events System Database Schema

  ## Overview
  Complete database schema for event scraping, listing, and management system with Google OAuth support.

  ## New Tables
  
  ### 1. `events`
  Main events table storing all scraped event data with status tracking:
  - `id` (uuid, primary key) - Unique event identifier
  - `title` (text) - Event name/title
  - `date_time` (timestamptz) - Event date and time
  - `venue_name` (text) - Venue name
  - `venue_address` (text) - Full venue address
  - `city` (text) - City name (default: Sydney)
  - `description` (text) - Event description/summary
  - `category` (text) - Event category/type
  - `tags` (text[]) - Array of tags
  - `image_url` (text) - Event poster/image URL
  - `source_website` (text) - Source website name
  - `original_url` (text) - Original event page URL
  - `status` (text) - Event status: new, updated, inactive, imported
  - `last_scraped_at` (timestamptz) - Last scrape timestamp
  - `imported_at` (timestamptz) - When imported to platform
  - `imported_by` (uuid) - User who imported (references auth.users)
  - `import_notes` (text) - Optional import notes
  - `created_at` (timestamptz) - Record creation time
  - `updated_at` (timestamptz) - Record update time
  
  ### 2. `email_captures`
  Stores email addresses captured from "GET TICKETS" CTA:
  - `id` (uuid, primary key) - Unique capture identifier
  - `email` (text) - User email address
  - `consent_given` (boolean) - Email opt-in consent
  - `event_id` (uuid) - Reference to event
  - `captured_at` (timestamptz) - Capture timestamp
  - `ip_address` (text) - Optional IP for tracking
  - `user_agent` (text) - Optional user agent

  ### 3. `admin_users`
  Tracks admin users for dashboard access:
  - `id` (uuid, primary key, references auth.users)
  - `email` (text) - Admin email
  - `full_name` (text) - Full name from Google OAuth
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation time
  - `last_login_at` (timestamptz) - Last login timestamp

  ## Security
  - Enable RLS on all tables
  - Public can view active events
  - Public can submit email captures
  - Only authenticated admin users can access dashboard features
  - Only authenticated users can import events
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date_time timestamptz NOT NULL,
  venue_name text,
  venue_address text,
  city text NOT NULL DEFAULT 'Sydney',
  description text,
  category text,
  tags text[] DEFAULT '{}',
  image_url text,
  source_website text NOT NULL,
  original_url text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'updated', 'inactive', 'imported')),
  last_scraped_at timestamptz DEFAULT now(),
  imported_at timestamptz,
  imported_by uuid REFERENCES auth.users(id),
  import_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on status and city for filtering
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_date_time ON events(date_time);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source_website);

-- Create email_captures table
CREATE TABLE IF NOT EXISTS email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  consent_given boolean NOT NULL DEFAULT false,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  captured_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Create index on email and event_id
CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
CREATE INDEX IF NOT EXISTS idx_email_captures_event_id ON email_captures(event_id);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events table

-- Public can view active events (not inactive)
CREATE POLICY "Public can view active events"
  ON events FOR SELECT
  TO public
  USING (status != 'inactive' OR status IS NULL);

-- Authenticated admin users can view all events
CREATE POLICY "Admins can view all events"
  ON events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Authenticated admin users can insert events
CREATE POLICY "Admins can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Authenticated admin users can update events
CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for email_captures table

-- Anyone can insert email captures
CREATE POLICY "Public can submit email captures"
  ON email_captures FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated admins can view email captures
CREATE POLICY "Admins can view email captures"
  ON email_captures FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for admin_users table

-- Authenticated users can view their own admin profile
CREATE POLICY "Users can view own admin profile"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Authenticated users can insert their own admin profile
CREATE POLICY "Users can create own admin profile"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Authenticated users can update their own admin profile
CREATE POLICY "Users can update own admin profile"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for events table
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();