-- =============================================
-- 1. 用户资料表（扩展 Supabase 自带的 auth.users）
-- =============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  level int default 1,
  bio text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);


-- =============================================
-- 2. 社区评价表
-- =============================================
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  model_id text not null,
  model_name text not null,
  rating numeric(2,1) check (rating >= 1 and rating <= 5) not null,
  score_value numeric(2,1) default 0,
  score_code numeric(2,1) default 0,
  score_logic numeric(2,1) default 0,
  score_stability numeric(2,1) default 0,
  content text not null,
  pros text[] default '{}',
  cons text[] default '{}',
  likes int default 0,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

create policy "Authenticated users can insert reviews"
  on public.reviews for insert with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews for update using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews for delete using (auth.uid() = user_id);


-- =============================================
-- 3. 评价点赞表
-- =============================================
create table public.review_likes (
  user_id uuid references auth.users(id) on delete cascade,
  review_id uuid references public.reviews(id) on delete cascade,
  primary key (user_id, review_id)
);

alter table public.review_likes enable row level security;

create policy "Users can manage own likes"
  on public.review_likes for all using (auth.uid() = user_id);

create policy "Likes are viewable by everyone"
  on public.review_likes for select using (true);


-- =============================================
-- 4. 新用户注册时自动创建 profile（触发器）
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
