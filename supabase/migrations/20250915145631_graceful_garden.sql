/*
  # Create Functions and Triggers

  1. Functions
    - Update timestamp function
    - Generate payment schedule function
    - Calculate installment amounts function

  2. Triggers
    - Auto-update timestamps
    - Auto-generate payments when BNPL is approved
*/

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bnpl_applications_updated_at BEFORE UPDATE ON bnpl_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_documents_updated_at BEFORE UPDATE ON application_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate payment schedule when BNPL application is approved
CREATE OR REPLACE FUNCTION generate_payment_schedule()
RETURNS TRIGGER AS $$
DECLARE
    i INTEGER;
    due_date_calc DATE;
BEGIN
    -- Only generate payments when status changes to 'approved'
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Insert down payment
        INSERT INTO payments (
            bnpl_application_id,
            student_id,
            parent_id,
            amount,
            payment_type,
            installment_number,
            due_date,
            status
        ) VALUES (
            NEW.id,
            NEW.student_id,
            NEW.parent_id,
            NEW.down_payment,
            'down_payment',
            0,
            CURRENT_DATE,
            'pending'
        );
        
        -- Insert installment payments
        FOR i IN 1..NEW.installments LOOP
            due_date_calc := CURRENT_DATE + (i * INTERVAL '1 month');
            
            INSERT INTO payments (
                bnpl_application_id,
                student_id,
                parent_id,
                amount,
                payment_type,
                installment_number,
                due_date,
                status
            ) VALUES (
                NEW.id,
                NEW.student_id,
                NEW.parent_id,
                NEW.installment_amount,
                'installment',
                i,
                due_date_calc,
                'pending'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for payment schedule generation
CREATE TRIGGER generate_payment_schedule_trigger
    AFTER UPDATE ON bnpl_applications
    FOR EACH ROW
    EXECUTE FUNCTION generate_payment_schedule();

-- Function to update payment status based on due dates
CREATE OR REPLACE FUNCTION update_overdue_payments()
RETURNS void AS $$
BEGIN
    UPDATE payments 
    SET status = 'overdue'
    WHERE status = 'pending' 
    AND due_date < CURRENT_DATE;
END;
$$ language 'plpgsql';

-- Create a scheduled job to run daily (this would need to be set up in Supabase dashboard)
-- SELECT cron.schedule('update-overdue-payments', '0 0 * * *', 'SELECT update_overdue_payments();');