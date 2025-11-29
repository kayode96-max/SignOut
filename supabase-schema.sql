-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    profile_pic TEXT,
    theme JSONB DEFAULT '{"background": "gradient-blue", "primaryColor": "#3b82f6", "secondaryColor": "#1d4ed8"}',
    popup_config JSONB DEFAULT '{"title": "Thank You!", "message": "Thank you for signing my digital sign-out page! 🎓", "backgroundColor": "#f0f9ff", "showConfetti": true}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create signatures table
CREATE TABLE signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    signature_url TEXT NOT NULL,
    signatory_name TEXT NOT NULL,
    signatory_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create thank_you_cards table
CREATE TABLE thank_you_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signature_id UUID NOT NULL REFERENCES signatures(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    card_data JSONB DEFAULT '{"background": "#ffffff", "message": "Thank you for signing!", "decorations": []}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_signatures_student_id ON signatures(student_id);
CREATE INDEX idx_signatures_created_at ON signatures(created_at DESC);
CREATE INDEX idx_thank_you_cards_student_id ON thank_you_cards(student_id);
CREATE INDEX idx_thank_you_cards_signature_id ON thank_you_cards(signature_id);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE thank_you_cards ENABLE ROW LEVEL SECURITY;

-- Students policies
CREATE POLICY "Students can view their own profile" ON students
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update their own profile" ON students
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" ON students
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view basic student info for signing" ON students
    FOR SELECT USING (true);

-- Signatures policies
CREATE POLICY "Anyone can create signatures" ON signatures
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Students can view all signatures on their page" ON signatures
    FOR SELECT USING (true);

CREATE POLICY "Students can delete signatures from their page" ON signatures
    FOR DELETE USING (auth.uid() = student_id);

-- Thank you cards policies
CREATE POLICY "Students can manage their thank you cards" ON thank_you_cards
    FOR ALL USING (auth.uid() = student_id);

-- Create storage bucket for signatures
INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', true);

-- Storage policies
CREATE POLICY "Anyone can upload signatures" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Anyone can view signatures" ON storage.objects
    FOR SELECT USING (bucket_id = 'signatures');

CREATE POLICY "Students can delete signatures from their page" ON storage.objects
    FOR DELETE USING (bucket_id = 'signatures');

-- Function to automatically create thank you cards when signatures are created
CREATE OR REPLACE FUNCTION create_thank_you_card()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO thank_you_cards (signature_id, student_id, card_data)
    VALUES (
        NEW.id,
        NEW.student_id,
        jsonb_build_object(
            'background', '#ffffff',
            'message', 'Thank you ' || NEW.signatory_name || ' for signing my page!',
            'decorations', '[]'::jsonb
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate thank you cards
CREATE TRIGGER trigger_create_thank_you_card
    AFTER INSERT ON signatures
    FOR EACH ROW
    EXECUTE FUNCTION create_thank_you_card();