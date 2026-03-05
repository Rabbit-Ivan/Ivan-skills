# Log Template

历史评估日志存储在 `~/ip-assessments.md`，用于跨会话复查与趋势追踪。

## 文件格式

```markdown
# IP Assessment Log

| Date | IP | Residential Confidence | Abuse Risk | Action | Summary | Recheck |
|---|---|---|---|---|---|---|
| 2025-03-05 | 199.177.179.159 | 82 (High) | 25 (Low) | Allow | Verizon residential, clean history | 2025-03-19 |
| 2025-03-05 | 103.21.244.10 | 15 (Low) | 78 (High) | Reject | Cloudflare hosting, proxy detected | — |
```

## 字段说明

| 字段 | 格式 | 说明 |
|---|---|---|
| Date | `YYYY-MM-DD` | 评估日期 |
| IP | IP 地址 | 评估目标 |
| Residential Confidence | `<score> (<High/Med/Low>)` | 静态家宽置信度分数与等级 |
| Abuse Risk | `<score> (<Low/Med/High/Critical>)` | 风控风险分数与等级 |
| Action | `Allow` / `Review` / `Reject` | 最终决策 |
| Summary | 一句话 | 关键结论摘要 |
| Recheck | `YYYY-MM-DD` 或 `—` | 建议复查日期（Reject 填 `—`） |

## 操作规则

1. **读取**：Workflow 第 1 步读取此文件，查找目标 IP 和同 /24 段记录。
2. **追加**：Workflow 第 8 步将本次评估结果追加为新行。
3. **创建**：若文件不存在，先写入表头再追加。
4. **不修改历史**：已有行不做修改，仅追加新行。历史记录是不可变的审计日志。
