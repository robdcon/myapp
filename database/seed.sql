-- Insert test users
INSERT INTO users (auth0_id, email, name, picture) VALUES
('auth0|user1', 'john@example.com', 'John Doe', 'https://i.pravatar.cc/150?img=1'),
('auth0|user2', 'jane@example.com', 'Jane Smith', 'https://i.pravatar.cc/150?img=2')
ON CONFLICT (email) DO NOTHING;

-- Insert shopping list board
INSERT INTO boards (name, board_type, description) VALUES
('Family Shopping List', 'CHECKLIST', 'Shared grocery list for the household')
RETURNING id;

-- Get the board ID (you'll need to replace this with the actual ID after running the above)
-- Let's assume board_id = 1 for this example

-- Insert user-board relationships (both users can edit)
INSERT INTO user_boards (user_id, board_id, role) VALUES
(1, 1, 'OWNER'),   -- John is owner
(2, 1, 'EDITOR');  -- Jane can edit

-- Insert shopping list items with categories
INSERT INTO items (board_id, name, details, is_checked, category, created_by) VALUES
-- Produce
(1, 'Apples', '2 lbs, Gala or Honeycrisp', false, 'Produce', 1),
(1, 'Bananas', '1 bunch', false, 'Produce', 1),
(1, 'Lettuce', 'Romaine, 1 head', false, 'Produce', 2),
(1, 'Tomatoes', '4-5 medium', false, 'Produce', 1),
(1, 'Carrots', '1 bag, baby carrots', true, 'Produce', 2),

-- Dairy
(1, 'Milk', '1 gallon, 2%', false, 'Dairy', 1),
(1, 'Eggs', '1 dozen, large', false, 'Dairy', 2),
(1, 'Cheese', 'Cheddar, 1 lb block', true, 'Dairy', 1),
(1, 'Yogurt', 'Greek, plain, 32 oz', false, 'Dairy', 2),

-- Pantry
(1, 'Bread', 'Whole wheat, 1 loaf', false, 'Pantry', 1),
(1, 'Pasta', 'Penne, 1 lb', false, 'Pantry', 2),
(1, 'Rice', 'Jasmine, 5 lb bag', true, 'Pantry', 1),
(1, 'Olive Oil', 'Extra virgin, 16 oz', false, 'Pantry', 2),

-- Meat & Seafood
(1, 'Chicken Breast', '2 lbs, boneless skinless', false, 'Meat & Seafood', 1),
(1, 'Ground Beef', '1 lb, 85/15', false, 'Meat & Seafood', 2),
(1, 'Salmon', '2 fillets, fresh', false, 'Meat & Seafood', 1),

-- Snacks
(1, 'Potato Chips', 'Family size bag', true, 'Snacks', 2),
(1, 'Granola Bars', '1 box, variety pack', false, 'Snacks', 1),
(1, 'Almonds', '1 lb, roasted unsalted', false, 'Snacks', 2);