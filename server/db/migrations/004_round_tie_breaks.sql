CREATE TABLE round_tie_breaks (
  round_id uuid PRIMARY KEY,
  movie_id text NOT NULL,
  drawn_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (round_id, movie_id) REFERENCES round_candidates(round_id, movie_id) ON DELETE CASCADE
);
