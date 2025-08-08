-- Clear existing data (be careful with this in production!)
TRUNCATE TABLE course_categories CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE course_lessons CASCADE;

-- Insert sample categories
INSERT INTO course_categories (id, name, description, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Programming', 'Learn programming languages and frameworks', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Data Science', 'Master data analysis and machine learning', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Web Development', 'Build modern web applications', NOW(), NOW());

-- Insert sample courses
INSERT INTO courses (id, title, slug, description, short_description, category_id, level, duration_weeks, price, is_published, is_featured, thumbnail_url, preview_video_url, created_at, updated_at)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'Introduction to TypeScript', 'introduction-to-typescript', 'Learn TypeScript from scratch and build type-safe applications', 'Master TypeScript fundamentals in this comprehensive course', '11111111-1111-1111-1111-111111111111', 'beginner', 4, 99.99, true, true, 'https://example.com/thumbs/typescript.jpg', 'https://example.com/videos/typescript-preview.mp4', NOW(), NOW()),
  
  ('55555555-5555-5555-5555-555555555555', 'Machine Learning Basics', 'machine-learning-basics', 'Introduction to machine learning concepts and algorithms', 'Get started with ML in this hands-on course', '22222222-2222-2222-2222-222222222222', 'intermediate', 8, 199.99, true, true, 'https://example.com/thumbs/ml.jpg', 'https://example.com/videos/ml-preview.mp4', NOW(), NOW()),
  
  ('66666666-6666-6666-6666-666666666666', 'Advanced React Patterns', 'advanced-react-patterns', 'Master advanced React patterns and best practices', 'Take your React skills to the next level', '33333333-3333-3333-3333-333333333333', 'advanced', 6, 149.99, true, false, 'https://example.com/thumbs/react.jpg', 'https://example.com/videos/react-preview.mp4', NOW(), NOW());

-- Insert sample lessons for the TypeScript course
INSERT INTO course_lessons (id, course_id, title, description, content, video_url, duration_minutes, sort_order, is_published, created_at, updated_at)
VALUES
  ('77777777-7777-7777-7777-777777777771', '44444444-4444-4444-4444-444444444444', 'Getting Started with TypeScript', 'Introduction to TypeScript and its benefits', 'TypeScript is a typed superset of JavaScript...', 'https://example.com/videos/ts-lesson1.mp4', 25, 1, true, NOW(), NOW()),
  
  ('77777777-7777-7777-7777-777777777772', '44444444-4444-4444-4444-444444444444', 'Type Annotations', 'Learn about type annotations in TypeScript', 'Type annotations let you declare the types of variables...', 'https://example.com/videos/ts-lesson2.mp4', 30, 2, true, NOW(), NOW()),
  
  ('77777777-7777-7777-7777-777777777773', '44444444-4444-4444-4444-444444444444', 'Interfaces and Types', 'Master interfaces and custom types', 'Interfaces are powerful way to define contracts...', 'https://example.com/videos/ts-lesson3.mp4', 35, 3, true, NOW(), NOW());

-- Insert sample lessons for the Machine Learning course
INSERT INTO course_lessons (id, course_id, title, description, content, video_url, duration_minutes, sort_order, is_published, created_at, updated_at)
VALUES
  ('88888888-8888-8888-8888-888888888881', '55555555-5555-5555-5555-555555555555', 'Introduction to ML', 'What is Machine Learning?', 'Machine learning is a branch of artificial intelligence...', 'https://example.com/videos/ml-lesson1.mp4', 30, 1, true, NOW(), NOW()),
  
  ('88888888-8888-8888-8888-888888888882', '55555555-5555-5555-5555-555555555555', 'Supervised Learning', 'Understanding supervised learning', 'Supervised learning is a type of machine learning...', 'https://example.com/videos/ml-lesson2.mp4', 40, 2, true, NOW(), NOW());

-- Insert sample lessons for the React course
INSERT INTO course_lessons (id, course_id, title, description, content, video_url, duration_minutes, sort_order, is_published, created_at, updated_at)
VALUES
  ('99999999-9999-9999-9999-999999999991', '66666666-6666-6666-6666-666666666666', 'Advanced Hooks', 'Mastering React Hooks', 'Deep dive into advanced hooks patterns...', 'https://example.com/videos/react-lesson1.mp4', 35, 1, true, NOW(), NOW()),
  
  ('99999999-9999-9999-9999-999999999992', '66666666-6666-6666-6666-666666666666', 'Context API Deep Dive', 'Mastering the Context API', 'Learn how to effectively use Context API...', 'https://example.com/videos/react-lesson2.mp4', 30, 2, true, NOW(), NOW());

-- Insert sample user (for enrollments)
-- Note: Make sure to use an existing user ID from your users table
-- INSERT INTO users (id, email, first_name, last_name, is_active, created_at, updated_at)
-- VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'student@example.com', 'John', 'Doe', true, NOW(), NOW());

-- Sample enrollment (uncomment and modify user_id after creating a user)
-- INSERT INTO user_course_enrollments (id, user_id, course_id, enrollment_date, is_completed, created_at, updated_at)
-- VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', NOW(), false, NOW(), NOW());
