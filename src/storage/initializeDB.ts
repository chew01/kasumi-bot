const initializeDB = [
  `CREATE TABLE IF NOT EXISTS member (
    user_id TEXT PRIMARY KEY,
    coin INTEGER NOT NULL,
    experience INTEGER NOT NULL,
    level INTEGER NOT NULL,
    CHECK ( coin >= 0 AND
            experience >= 0 AND
            level >= 0)
    );`,

  `CREATE TABLE IF NOT EXISTS item_type (
    item_name TEXT PRIMARY KEY,
    role_id TEXT NULL 
    );`,

  `CREATE TABLE IF NOT EXISTS member_inventory (
    user_id TEXT,
    item_name TEXT, 
    quantity INTEGER NOT NULL,
    PRIMARY KEY (user_id, item_name),
    FOREIGN KEY (user_id) REFERENCES member (user_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    FOREIGN KEY (item_name) REFERENCES item_type (item_name) ON DELETE CASCADE ON UPDATE CASCADE
    );`,

  `CREATE TABLE IF NOT EXISTS work_data (
    user_id TEXT PRIMARY KEY,
    last_daily INTEGER NOT NULL,
    daily_streak INTEGER NOT NULL,
    last_fish INTEGER NOT NULL,
    last_mine INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES member (user_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    CHECK ( last_daily >= 0 AND
            daily_streak >= 0 AND
            last_fish >= 0 AND
            last_mine >= 0 )
    );`,

  `CREATE TABLE IF NOT EXISTS shop_listing (
    item_name TEXT PRIMARY KEY,
    price INTEGER NOT NULL,
    FOREIGN KEY (item_name) REFERENCES item_type (item_name) ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK ( price >= 0 )
    );`,

  `CREATE TABLE IF NOT EXISTS activity_channel (
    channel_id TEXT PRIMARY KEY
    );`,

  `CREATE TABLE IF NOT EXISTS bad_word (
    word TEXT PRIMARY KEY,
    user_id TEXT NOT NULL
    );`,

  `CREATE TABLE IF NOT EXISTS reaction (
    id PRIMARY KEY,
    type TEXT NOT NULL,
    url TEXT NOT NULL 
    );`,

  `CREATE TABLE IF NOT EXISTS star (
    starred_id PRIMARY KEY,
    board_id TEXT UNIQUE NOT NULL
    );`,
];

export default initializeDB;
