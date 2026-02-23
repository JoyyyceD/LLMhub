# 社区数据模型（V1）

## 1. 目标

定义“模型评分帖 + 回复 + 点赞/踩”的数据结构与约束。

## 2. 评分帖主表（`model_review_posts`）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 评分帖 ID |
| `user_id` | uuid | not null | 用户 ID |
| `model_id` | text | not null | 模型 ID（`aa_slug`） |
| `rating_overall` | int | 1..5, not null | 总星级（必填） |
| `rating_quality` | int | 1..5, null | 质量（可选） |
| `rating_price` | int | 1..5, null | 价格（可选） |
| `rating_latency` | int | 1..5, null | 延迟（可选） |
| `rating_throughput` | int | 1..5, null | 吞吐（可选） |
| `rating_stability` | int | 1..5, null | 稳定性（可选） |
| `provider_name` | text | enum, null | 服务商（可选，枚举） |
| `pros` | text | length <= 200, null | 做得好的地方（可选） |
| `cons` | text | length <= 200, null | 做得不好的地方（可选） |
| `comment` | text | length <= 800, null | 自由评论（可选） |
| `status` | text | default `published` | V1 默认发布即展示 |
| `created_at` | timestamptz | not null | 创建时间 |
| `updated_at` | timestamptz | not null | 更新时间 |

关键约束：

- 唯一索引：`unique(user_id, model_id)`（每用户每模型一条评分帖）

语义：

- 重复提交同模型时，更新该帖内容（覆盖式）

## 3. 帖子回复表（`review_post_replies`）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 回复 ID |
| `post_id` | uuid | not null | 关联评分帖 ID |
| `user_id` | uuid | not null | 用户 ID |
| `content` | text | length <= 300, not null | 回复内容 |
| `status` | text | default `published` | V1 发布即展示 |
| `created_at` | timestamptz | not null | 创建时间 |
| `updated_at` | timestamptz | not null | 更新时间 |

建议索引：

- `index(post_id, created_at asc)`

## 4. 帖子态度表（`review_post_reactions`）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 记录 ID |
| `post_id` | uuid | not null | 关联评分帖 ID |
| `user_id` | uuid | not null | 用户 ID |
| `reaction` | text | `up/down` | 点赞或踩 |
| `created_at` | timestamptz | not null | 创建时间 |
| `updated_at` | timestamptz | not null | 更新时间 |

关键约束：

- 唯一索引：`unique(post_id, user_id)`（同用户对同帖仅一条态度记录）

语义：

- 已有记录再次提交时执行覆盖更新（可在赞/踩间切换）

## 5. 聚合视图（`model_rating_summary`）

| 字段 | 类型 | 说明 |
|---|---|---|
| `model_id` | text | 模型 ID |
| `rating_count` | int | 总评分帖数 |
| `rating_avg` | numeric(3,2) | 总评分均分 |
| `show_public_rating` | boolean | 是否展示公开均分 |

口径：

- `show_public_rating = (rating_count >= 10)`
- 即便 `<10`，评分帖列表仍可见

## 6. 权限（Supabase 口径）

- 登录用户可创建/更新自己的评分帖
- 登录用户可创建回复
- 登录用户可对帖子点踩/点赞
- 用户仅可更新自己的记录（基于 `user_id`）

服务商枚举来源：

- `docs/data/provider-enum.md`

## 7. 与推荐系统边界

- V1 不将社区信号纳入推荐打分
- 推荐页可读取 `model_rating_summary` 进行展示
