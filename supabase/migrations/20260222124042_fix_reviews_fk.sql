-- 将 reviews.user_id 外键改指向 profiles.id
-- 这样 PostgREST 就能识别 reviews <-> profiles 的关联，支持联表查询
ALTER TABLE public.reviews
  DROP CONSTRAINT reviews_user_id_fkey,
  ADD CONSTRAINT reviews_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 同样修复 review_likes.user_id
ALTER TABLE public.review_likes
  DROP CONSTRAINT review_likes_user_id_fkey,
  ADD CONSTRAINT review_likes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
