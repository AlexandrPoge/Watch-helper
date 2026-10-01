CREATE TABLE IF NOT EXISTS guest_sessions (
  token_hash text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rooms (
  id text PRIMARY KEY,
  title text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('couple', 'group')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE IF NOT EXISTS room_members (
  id uuid PRIMARY KEY,
  room_id text NOT NULL REFERENCES rooms(id),
  session_hash text NOT NULL REFERENCES guest_sessions(token_hash),
  name text NOT NULL,
  is_host boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz,
  UNIQUE (room_id, session_hash)
);
CREATE UNIQUE INDEX IF NOT EXISTS room_member_name_unique ON room_members(room_id, lower(name)) WHERE removed_at IS NULL;

CREATE TABLE IF NOT EXISTS room_rounds (
  id uuid PRIMARY KEY,
  room_id text NOT NULL REFERENCES rooms(id),
  ordinal integer NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  genre text,
  max_runtime integer,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (room_id, ordinal)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_round ON room_rounds(room_id) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS round_participants (
  round_id uuid NOT NULL REFERENCES room_rounds(id),
  member_id uuid NOT NULL REFERENCES room_members(id),
  PRIMARY KEY (round_id, member_id)
);

CREATE TABLE IF NOT EXISTS round_candidates (
  round_id uuid NOT NULL REFERENCES room_rounds(id),
  movie_id text NOT NULL,
  position integer NOT NULL,
  title text NOT NULL,
  year integer NOT NULL,
  poster_url text NOT NULL,
  rating numeric,
  overview text,
  PRIMARY KEY (round_id, movie_id)
);

CREATE TABLE IF NOT EXISTS round_votes (
  round_id uuid NOT NULL,
  member_id uuid NOT NULL,
  movie_id text NOT NULL,
  value text NOT NULL CHECK (value IN ('up', 'skip')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (round_id, member_id, movie_id),
  FOREIGN KEY (round_id, member_id) REFERENCES round_participants(round_id, member_id),
  FOREIGN KEY (round_id, movie_id) REFERENCES round_candidates(round_id, movie_id)
);
