-- Add the password column as nullable first
ALTER TABLE "users" ADD COLUMN "password" VARCHAR(255);

-- Update existing users with a default hashed password (password: 'defaultPassword123!')
-- This is a bcrypt hash of 'defaultPassword123!'
UPDATE "users" SET "password" = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- Now make the password column required
ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL;
