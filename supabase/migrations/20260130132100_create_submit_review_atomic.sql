-- Migration: Create submit_review_atomic RPC
-- Date: 2026-01-30

-- NOTE: This migration intentionally contains a single SQL command. Keep it that way.
CREATE OR REPLACE FUNCTION public.submit_review_atomic(
  p_contribution_id bigint,
  p_reviewer_id uuid,
  p_rating text,
  p_confidence integer,
  p_comment text,
  p_new_contribution_ke integer,
  p_new_reviews_count integer,
  p_reviewer_ke_earned integer
)
RETURNS TABLE (
  review_id bigint,
  review_created_at timestamptz,
  contribution_ke integer,
  contribution_author uuid,
  contribution_domain text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author uuid;
  v_domain text;
  v_prev_ke integer;
  v_review_id bigint;
  v_review_created_at timestamptz;
BEGIN
  -- If called with an authenticated user JWT (not service role), enforce reviewer identity.
  IF auth.role() = 'authenticated' AND p_reviewer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Reviewer id must match auth.uid()' USING ERRCODE = 'P0005';
  END IF;

  -- Lock the contribution row so KE updates are serialized.
  SELECT author, domain, COALESCE(ke_gained, 0)
    INTO v_author, v_domain, v_prev_ke
  FROM public.contributions
  WHERE id = p_contribution_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contribution not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_author = p_reviewer_id THEN
    RAISE EXCEPTION 'You cannot review your own contributions' USING ERRCODE = 'P0003';
  END IF;

  -- Precheck duplicate to return a friendly error (constraint still prevents races).
  IF EXISTS (
    SELECT 1 FROM public.reviews
    WHERE contribution_id = p_contribution_id AND reviewer = p_reviewer_id
  ) THEN
    RAISE EXCEPTION 'You have already reviewed this contribution' USING ERRCODE = 'P0004';
  END IF;

  INSERT INTO public.reviews (
    contribution_id,
    reviewer,
    rating,
    confidence,
    comment,
    ke_awarded
  ) VALUES (
    p_contribution_id,
    p_reviewer_id,
    p_rating,
    p_confidence,
    p_comment,
    p_reviewer_ke_earned
  )
  RETURNING id, created_at INTO v_review_id, v_review_created_at;

  UPDATE public.contributions
  SET ke_gained = p_new_contribution_ke,
      reviews_count = p_new_reviews_count
  WHERE id = p_contribution_id;

  -- Reviewer KE upsert (domain-specific)
  INSERT INTO public.user_ke (user_id, domain, ke_amount, reviews_given_count, last_updated)
  VALUES (p_reviewer_id, v_domain, p_reviewer_ke_earned, 1, now())
  ON CONFLICT (user_id, domain)
  DO UPDATE SET
    ke_amount = public.user_ke.ke_amount + EXCLUDED.ke_amount,
    reviews_given_count = public.user_ke.reviews_given_count + 1,
    last_updated = now();

  -- Author KE update by delta
  IF v_author IS NOT NULL THEN
    INSERT INTO public.user_ke (user_id, domain, ke_amount, contributions_count, last_updated)
    VALUES (v_author, v_domain, (p_new_contribution_ke - v_prev_ke), 0, now())
    ON CONFLICT (user_id, domain)
    DO UPDATE SET
      ke_amount = public.user_ke.ke_amount + (p_new_contribution_ke - v_prev_ke),
      last_updated = now();
  END IF;

  review_id := v_review_id;
  review_created_at := v_review_created_at;
  contribution_ke := p_new_contribution_ke;
  contribution_author := v_author;
  contribution_domain := v_domain;
  RETURN NEXT;
END;
$$;
