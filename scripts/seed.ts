import { Pool } from 'pg';

const pool = new Pool({
  host: '35.214.59.104',
  port: 5432,
  database: 'dbajfnsyj3xd5g',
  user: 'uxcbxdwm5ywui',
  password: '5h2$@&l@2(I1',
});

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert test users
    await client.query(`
      INSERT INTO users (auth0_id, email, name, picture) VALUES
      ('auth0|user1', 'john@example.com', 'John Doe', 'https://i.pravatar.cc/150?img=1'),
      ('auth0|user2', 'jane@example.com', 'Jane Smith', 'https://i.pravatar.cc/150?img=2')
      ON CONFLICT (email) DO NOTHING
    `);

    // Insert shopping list board
    const boardResult = await client.query(`
      INSERT INTO boards (name, board_type, description) VALUES
      ('Family Shopping List', 'CHECKLIST', 'Shared grocery list for the household')
      RETURNING id
    `);

    const boardId = boardResult.rows[0].id;

    // Get user IDs
    const userResult = await client.query(`
      SELECT id FROM users WHERE email IN ('john@example.com', 'jane@example.com')
      ORDER BY email
    `);

    const [janeId, johnId] = userResult.rows.map((row) => row.id);

    // Insert user-board relationships
    await client.query(
      `
      INSERT INTO user_boards (user_id, board_id, role) VALUES
      ($1, $2, 'OWNER'),
      ($3, $2, 'EDITOR')
    `,
      [johnId, boardId, janeId]
    );

    // Insert shopping list items
    await client.query(
      `
      INSERT INTO items (board_id, name, details, is_checked, category, created_by) VALUES
      ($1, 'Apples', '2 lbs, Gala or Honeycrisp', false, 'Produce', $2),
      ($1, 'Bananas', '1 bunch', false, 'Produce', $2),
      ($1, 'Lettuce', 'Romaine, 1 head', false, 'Produce', $3),
      ($1, 'Tomatoes', '4-5 medium', false, 'Produce', $2),
      ($1, 'Carrots', '1 bag, baby carrots', true, 'Produce', $3),
      ($1, 'Milk', '1 gallon, 2%', false, 'Dairy', $2),
      ($1, 'Eggs', '1 dozen, large', false, 'Dairy', $3),
      ($1, 'Cheese', 'Cheddar, 1 lb block', true, 'Dairy', $2),
      ($1, 'Yogurt', 'Greek, plain, 32 oz', false, 'Dairy', $3),
      ($1, 'Bread', 'Whole wheat, 1 loaf', false, 'Pantry', $2),
      ($1, 'Pasta', 'Penne, 1 lb', false, 'Pantry', $3),
      ($1, 'Rice', 'Jasmine, 5 lb bag', true, 'Pantry', $2),
      ($1, 'Olive Oil', 'Extra virgin, 16 oz', false, 'Pantry', $3),
      ($1, 'Chicken Breast', '2 lbs, boneless skinless', false, 'Meat & Seafood', $2),
      ($1, 'Ground Beef', '1 lb, 85/15', false, 'Meat & Seafood', $3),
      ($1, 'Salmon', '2 fillets, fresh', false, 'Meat & Seafood', $2),
      ($1, 'Potato Chips', 'Family size bag', true, 'Snacks', $3),
      ($1, 'Granola Bars', '1 box, variety pack', false, 'Snacks', $2),
      ($1, 'Almonds', '1 lb, roasted unsalted', false, 'Snacks', $3)
    `,
      [boardId, johnId, janeId]
    );

    await client.query('COMMIT');
    // console.log('✅ Database seeded successfully!');
    // console.log(`📋 Board ID: ${boardId}`);
    // console.log(`👤 John ID: ${johnId}`);
    // console.log(`👤 Jane ID: ${janeId}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
