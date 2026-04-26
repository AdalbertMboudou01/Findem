CREATE TABLE IF NOT EXISTS company_invitations (
  invitation_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES companies(id),
  invited_by_recruiter_id uuid REFERENCES recruiters(id),
  email text NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_invitations_company_id ON company_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_invitations_status ON company_invitations(status);
CREATE INDEX IF NOT EXISTS idx_company_invitations_email ON company_invitations(email);
