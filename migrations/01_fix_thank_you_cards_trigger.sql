-- Fix for Thank You Card creation trigger RLS issue
-- The trigger runs as the user executing the INSERT (Security Invoker).
-- Anonymous users cannot INSERT into thank_you_cards due to RLS policies.
-- Making the function SECURITY DEFINER allows it to run with the privileges of the owner (postgres), bypassing RLS.

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
$$ LANGUAGE plpgsql SECURITY DEFINER;
