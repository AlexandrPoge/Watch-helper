CREATE TABLE room_proposals (
  room_id text NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES room_members(id) ON DELETE CASCADE,
  movie_id text NOT NULL,
  movie jsonb NOT NULL,
  proposed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, movie_id)
);
