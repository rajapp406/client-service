-- Set default values for any NULL first_name or last_name
UPDATE "users" SET 
  first_name = 'User' || id::text 
WHERE first_name IS NULL;

UPDATE "users" SET 
  last_name = 'User' || id::text 
WHERE last_name IS NULL;

-- Now make the columns required
ALTER TABLE "users" 
  ALTER COLUMN "first_name" SET NOT NULL,
  ALTER COLUMN "last_name" SET NOT NULL;
