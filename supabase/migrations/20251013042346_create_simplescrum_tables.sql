/*
  # SimpleScrum Database Schema

  ## Overview
  This migration creates the complete database schema for SimpleScrum, an intuitive Scrum project management application.

  ## 1. New Tables

  ### `projects`
  Stores project information and product goals
  - `id` (uuid, primary key) - Unique project identifier
  - `user_id` (uuid, foreign key) - References auth.users, owner of the project
  - `name` (text) - Project name
  - `product_goal` (text) - The product's ultimate purpose
  - `current_velocity` (integer) - Calculated velocity from most recent sprint
  - `created_at` (timestamptz) - Timestamp of creation

  ### `pbis` (Product Backlog Items)
  Stores user stories and backlog items
  - `id` (uuid, primary key) - Unique PBI identifier
  - `project_id` (uuid, foreign key) - References projects
  - `pbi_number` (integer) - Sequential number within project (PBI-001, PBI-002, etc.)
  - `title` (text) - User story in "As a [role], I want [goal], so that [value]" format
  - `story_points` (integer) - Estimation (1, 2, 3, 5, 8, or 13)
  - `priority_index` (integer) - Order in backlog (lower = higher priority)
  - `refinement_status` (text) - Either 'vague' or 'ready'
  - `sprint_id` (uuid, foreign key, nullable) - References sprints if assigned
  - `status` (text, nullable) - PBI status: 'to_do', 'in_progress', or 'done'
  - `created_at` (timestamptz) - Timestamp of creation

  ### `sprints`
  Stores sprint information and goals
  - `id` (uuid, primary key) - Unique sprint identifier
  - `project_id` (uuid, foreign key) - References projects
  - `sprint_number` (integer) - Sequential sprint number
  - `sprint_goal` (text) - Single sentence describing sprint objective
  - `team_capacity` (integer) - Team's story point capacity
  - `committed_sp` (integer) - Story points committed to sprint
  - `completed_sp` (integer) - Story points actually completed
  - `start_date` (date) - Sprint start date
  - `end_date` (date) - Sprint end date
  - `status` (text) - Either 'active' or 'closed'
  - `created_at` (timestamptz) - Timestamp of creation

  ### `tasks`
  Stores decomposed tasks from PBIs
  - `id` (uuid, primary key) - Unique task identifier
  - `task_id` (text, unique) - Format: T-{PBI#}-{task#} or T-PROC-{#}
  - `sprint_id` (uuid, foreign key) - References sprints
  - `pbi_id` (uuid, foreign key, nullable) - References pbis (null for process tasks)
  - `description` (text) - Task description
  - `status` (text) - Status: 'to_do', 'in_progress', 'testing', or 'done'
  - `owner` (text) - Person assigned to task
  - `time_estimate_hours` (integer) - Hour estimate for task
  - `created_at` (timestamptz) - Timestamp of creation

  ### `retrospectives`
  Stores sprint retrospective data
  - `id` (uuid, primary key) - Unique retrospective identifier
  - `sprint_id` (uuid, foreign key, unique) - References sprints (one per sprint)
  - `went_well` (text) - What went well during sprint
  - `to_improve` (text) - What could be improved
  - `action_item` (text) - Concrete action for next sprint
  - `created_at` (timestamptz) - Timestamp of creation

  ## 2. Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access data for projects they own
  - Policies enforce authentication and ownership checks
  - Cascading deletes ensure data integrity

  ## 3. Indexes
  - Foreign key indexes for optimal query performance
  - Composite unique indexes to prevent duplicates
  - Priority and status indexes for sorting and filtering
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  product_goal text NOT NULL,
  current_velocity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create pbis table
CREATE TABLE IF NOT EXISTS pbis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  pbi_number integer NOT NULL,
  title text NOT NULL,
  story_points integer NOT NULL CHECK (story_points IN (1, 2, 3, 5, 8, 13)),
  priority_index integer NOT NULL DEFAULT 0,
  refinement_status text NOT NULL DEFAULT 'vague' CHECK (refinement_status IN ('vague', 'ready')),
  sprint_id uuid,
  status text CHECK (status IN ('to_do', 'in_progress', 'done')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, pbi_number)
);

ALTER TABLE pbis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pbis in their projects"
  ON pbis FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pbis.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pbis in their projects"
  ON pbis FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pbis.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pbis in their projects"
  ON pbis FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pbis.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pbis.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pbis in their projects"
  ON pbis FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pbis.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  sprint_number integer NOT NULL,
  sprint_goal text NOT NULL,
  team_capacity integer NOT NULL,
  committed_sp integer DEFAULT 0,
  completed_sp integer DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, sprint_number)
);

ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sprints in their projects"
  ON sprints FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sprints.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sprints in their projects"
  ON sprints FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sprints.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sprints in their projects"
  ON sprints FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sprints.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sprints.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sprints in their projects"
  ON sprints FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sprints.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Add foreign key constraint for pbis.sprint_id after sprints table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'pbis_sprint_id_fkey'
    AND table_name = 'pbis'
  ) THEN
    ALTER TABLE pbis ADD CONSTRAINT pbis_sprint_id_fkey
      FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id text NOT NULL UNIQUE,
  sprint_id uuid REFERENCES sprints(id) ON DELETE CASCADE NOT NULL,
  pbi_id uuid REFERENCES pbis(id) ON DELETE CASCADE,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'to_do' CHECK (status IN ('to_do', 'in_progress', 'testing', 'done')),
  owner text DEFAULT '',
  time_estimate_hours integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their sprints"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN projects ON projects.id = sprints.project_id
      WHERE sprints.id = tasks.sprint_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their sprints"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN projects ON projects.id = sprints.project_id
      WHERE sprints.id = tasks.sprint_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their sprints"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN projects ON projects.id = sprints.project_id
      WHERE sprints.id = tasks.sprint_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN projects ON projects.id = sprints.project_id
      WHERE sprints.id = tasks.sprint_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in their sprints"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN projects ON projects.id = sprints.project_id
      WHERE sprints.id = tasks.sprint_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create retrospectives table
CREATE TABLE IF NOT EXISTS retrospectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid REFERENCES sprints(id) ON DELETE CASCADE NOT NULL UNIQUE,
  went_well text DEFAULT '',
  to_improve text DEFAULT '',
  action_item text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE retrospectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view retrospectives in their sprints"
  ON retrospectives FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN projects ON projects.id = sprints.project_id
      WHERE sprints.id = retrospectives.sprint_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create retrospectives in their sprints"
  ON retrospectives FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN projects ON projects.id = sprints.project_id
      WHERE sprints.id = retrospectives.sprint_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update retrospectives in their sprints"
  ON retrospectives FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN projects ON projects.id = sprints.project_id
      WHERE sprints.id = retrospectives.sprint_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN projects ON projects.id = sprints.project_id
      WHERE sprints.id = retrospectives.sprint_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete retrospectives in their sprints"
  ON retrospectives FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN projects ON projects.id = sprints.project_id
      WHERE sprints.id = retrospectives.sprint_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_pbis_project_id ON pbis(project_id);
CREATE INDEX IF NOT EXISTS idx_pbis_sprint_id ON pbis(sprint_id);
CREATE INDEX IF NOT EXISTS idx_pbis_priority_index ON pbis(priority_index);
CREATE INDEX IF NOT EXISTS idx_pbis_status ON pbis(status);
CREATE INDEX IF NOT EXISTS idx_sprints_project_id ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_pbi_id ON tasks(pbi_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_retrospectives_sprint_id ON retrospectives(sprint_id);