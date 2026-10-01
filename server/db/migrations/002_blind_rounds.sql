ALTER TABLE room_rounds ADD COLUMN blind boolean NOT NULL DEFAULT false;
ALTER TABLE round_candidates ADD COLUMN vote_id uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX round_candidate_vote_id_unique ON round_candidates(round_id, vote_id);
