-- Enforce case-insensitive uniqueness for user handles
CREATE UNIQUE INDEX IF NOT EXISTS users_handle_lower_unique
  ON users (lower(handle));
