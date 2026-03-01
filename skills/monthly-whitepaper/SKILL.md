---
name: monthly-whitepaper
description: This skill should be used when the user asks to "生成月报", "写白皮书", "生成大模型月报", "create monthly whitepaper", "write industry report", or mentions generating a report for a specific month (e.g. "3月白皮书", "April whitepaper"). Guides the complete process of querying real Supabase data and generating a monthly LLM industry report page.
version: 1.0.0
---

# 大模型行业月报生成 Skill

每月从 Token Galaxy Supabase 读取真实数据，生成独立白皮书页面。

## 关键原则

**绝对禁止编造数据。** 所有模型名称、指标、定价必须来自 Supabase 查询结果。

## 完整流程

### Step 1：查询 LLM 数据

从 CSV 导出或 Supabase REST API 查询当月（例如 2026-03）发布的 LLM：

```bash
# 从 CSV 筛选（推荐，避免代理问题）
python3 - <<'EOF'
import csv
TARGET_MONTH = "2026-03"  # ← 修改此处
with open("path/to/model_snapshots_rows.csv") as f:
    rows = list(csv.DictReader(f))

llm = [r for r in rows
       if r['aa_modality'] == 'llm'
       and r['has_aa'] == 'true'
       and r['aa_release_date'].startswith(TARGET_MONTH)]

llm.sort(key=lambda r: float(r['aa_intelligence_index'] or 0), reverse=True)
for r in llm:
    print(f"{r['aa_name']} | {r['aa_model_creator_name']} | intel={r['aa_intelligence_index']} | "
          f"input=${r['aa_price_input_usd']} | ctx={r['aa_context_length']} | "
          f"cn={r['is_cn_provider']} | slug={r['aa_slug']} | date={r['aa_release_date']}")
EOF
```

### Step 2：查询多模态数据

```bash
python3 - <<'EOF'
import csv
TARGET_MONTH = "2026-03"
with open("path/to/model_snapshots_rows.csv") as f:
    rows = list(csv.DictReader(f))

mm = [r for r in rows
      if r['aa_modality'] != 'llm'
      and r['has_aa'] == 'true'
      and r['aa_release_date'].startswith(TARGET_MONTH)]

# 按名称+厂商去重（同一模型可能出现在多个 modality）
seen = set()
for r in mm:
    key = (r['aa_name'], r['aa_model_creator_name'])
    if key not in seen:
        seen.add(key)
        print(f"[{r['aa_modality']}] {r['aa_name']} | {r['aa_model_creator_name']} | "
              f"ELO={r['aa_elo']} | cn={r['is_cn_provider']} | slug={r['aa_slug']}")
EOF
```

### Step 3：数据处理规则

参见 `references/data-rules.md`

### Step 4：创建页面文件

文件路径：`src/pages/Whitepaper{YYYY}{MM}.tsx`（例如 `Whitepaper202603.tsx`）

参见 `references/page-template.md` 获取完整页面结构。

### Step 5：注册路由 + 入口卡片

**App.tsx** 新增路由：
```tsx
import { Whitepaper202603 } from './pages/Whitepaper202603';
// ...
<Route path="/whitepaper/2026-03" element={<Whitepaper202603 />} />
```

**DeveloperEcosystem.tsx** 更新入口卡片的 `to`、标题、描述文字。

### Step 6：类型检查

```bash
npx tsc --noEmit
```

确认只有既有错误，没有新增错误。
