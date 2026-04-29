-- Rendre recipient_id nullable (group chat, pas DM)
ALTER TABLE internal_chats ALTER COLUMN recipient_id DROP NOT NULL;

-- Ajouter department_id (null = canal général, non-null = canal département)
ALTER TABLE internal_chats ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES company_departments(department_id);

-- Ajouter channel_type
ALTER TABLE internal_chats ADD COLUMN IF NOT EXISTS channel_type VARCHAR(20) NOT NULL DEFAULT 'GENERAL' CHECK (channel_type IN ('GENERAL', 'DEPARTMENT'));

-- Index pour les requêtes de chat
CREATE INDEX IF NOT EXISTS idx_internal_chats_company_channel ON internal_chats(company_id, channel_type);
CREATE INDEX IF NOT EXISTS idx_internal_chats_department ON internal_chats(department_id);
CREATE INDEX IF NOT EXISTS idx_internal_chats_created_at ON internal_chats(created_at);
