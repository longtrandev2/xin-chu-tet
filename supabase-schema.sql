-- =============================================
-- CÂY ƯỚC NGUYỆN - Supabase Schema v2
-- =============================================
-- Chạy script này trong Supabase Dashboard → SQL Editor
-- ⚠️ Nếu đã chạy v1 rồi thì chỉ cần chạy phần 2 + 3

-- ====== 1. BẢNG WISHES ======
CREATE TABLE IF NOT EXISTS wishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  wish_text TEXT NOT NULL,
  word TEXT NOT NULL,
  poem TEXT DEFAULT '',
  pos_x FLOAT NOT NULL DEFAULT 50,
  pos_y FLOAT NOT NULL DEFAULT 50,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wishes' AND policyname = 'Anyone can view wishes') THEN
    CREATE POLICY "Anyone can view wishes" ON wishes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wishes' AND policyname = 'Anyone can insert wishes') THEN
    CREATE POLICY "Anyone can insert wishes" ON wishes FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wishes' AND policyname = 'Anyone can update wishes') THEN
    CREATE POLICY "Anyone can update wishes" ON wishes FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wishes' AND policyname = 'Anyone can delete wishes') THEN
    CREATE POLICY "Anyone can delete wishes" ON wishes FOR DELETE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE wishes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes (created_at DESC);

-- ====== 2. BẢNG PRIZES (Lì Xì May Mắn) ======
CREATE TABLE IF NOT EXISTS prizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wish_id UUID REFERENCES wishes(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  winner_name TEXT DEFAULT '',
  bank_account TEXT DEFAULT '',
  bank_name TEXT DEFAULT '',
  transferred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nếu bảng đã tồn tại, thêm cột transferred
DO $$ BEGIN
  ALTER TABLE prizes ADD COLUMN transferred BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prizes' AND policyname = 'Anyone can view prizes') THEN
    CREATE POLICY "Anyone can view prizes" ON prizes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prizes' AND policyname = 'Anyone can insert prizes') THEN
    CREATE POLICY "Anyone can insert prizes" ON prizes FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prizes' AND policyname = 'Anyone can update prizes') THEN
    CREATE POLICY "Anyone can update prizes" ON prizes FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prizes' AND policyname = 'Anyone can delete prizes') THEN
    CREATE POLICY "Anyone can delete prizes" ON prizes FOR DELETE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE prizes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ====== 3. BẢNG PRIZE_CONFIG (Cấu hình lì xì) ======
CREATE TABLE IF NOT EXISTS prize_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount INTEGER NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  chance INTEGER NOT NULL DEFAULT 10,
  max_count INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE prize_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prize_config' AND policyname = 'Anyone can view prize_config') THEN
    CREATE POLICY "Anyone can view prize_config" ON prize_config FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prize_config' AND policyname = 'Anyone can manage prize_config') THEN
    CREATE POLICY "Anyone can manage prize_config" ON prize_config FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Seed dữ liệu mặc định cho prize_config (chạy 1 lần)
INSERT INTO prize_config (amount, label, chance, max_count, enabled)
SELECT * FROM (VALUES
  (10000, '10.000₫', 30, 1, true),
  (15000, '15.000₫', 15, 1, true),
  (26000, '26.000₫', 10, 3, true)
) AS v(amount, label, chance, max_count, enabled)
WHERE NOT EXISTS (SELECT 1 FROM prize_config LIMIT 1);

-- =============================================
-- XONG! Sau khi chạy script này:
-- 1. Copy URL và anon key từ Settings → API
-- 2. Dán vào file .env.local
-- =============================================
