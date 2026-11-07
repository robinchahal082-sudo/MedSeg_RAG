BEGIN;

ALTER TABLE doctor_patient_access
    DROP CONSTRAINT IF EXISTS check_access_request_status;

ALTER TABLE doctor_patient_access
    ADD CONSTRAINT check_access_request_status
    CHECK (status IN ('pending', 'approved', 'rejected', 'revoked'));

COMMIT;
