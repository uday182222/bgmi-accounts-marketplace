-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'premium', 'legendary', 'rare', 'common'
    title VARCHAR(200),
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    level INTEGER,
    rank VARCHAR(100),
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    kd_ratio DECIMAL(5,2),
    win_rate DECIMAL(5,2),
    play_time_hours INTEGER,
    achievements JSONB,
    skins JSONB,
    weapons JSONB,
    characters JSONB,
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending', 'draft')),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_game_name ON accounts(game_name);
CREATE INDEX IF NOT EXISTS idx_accounts_price ON accounts(price);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_is_featured ON accounts(is_featured);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON accounts(created_at);

-- Create updated_at trigger
CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
