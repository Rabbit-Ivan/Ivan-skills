---
name: static-residential-ip-assessor
description: 用于判定单个 IP 或 IP 段是否属于静态家宽住宅，并输出带证据链、冲突分析与置信度评分的风险报告。用户提供 IP，或提供 ASN、Hostname、Range 三元信息时使用；适用于账号风控前审、代理池质量筛查、住宅 IP 真实性核验、报告复核与复查场景。
---

# Static Residential IP Assessor

## Overview

- 判定目标是否为静态家宽住宅 IP，并明确区分家宽动态 IP、商宽/企业出口、机房/云代理 IP。
- 产出可复核报告：结论、证据来源、冲突解释、置信度与账号安全建议。
- 默认采用"保守模式"，优先保护 Claude 等高价值账号安全，避免高风险 IP 进入关键流程。
- 支持历史日志持久化，便于跨会话复查与趋势追踪。

## Input Contract

接收以下任一输入：

1. 单个 IP
   - 示例：`199.177.179.159`

2. IP 段 + 归属线索
   - 示例：
     - `ASN: AS701 - Verizon Business`
     - `Hostname: No Hostname`
     - `Range: 198.3.0.0/16`

输入不完整时，按 `references/question-protocol.md` 快速确认。用户直接发送 IP 时，使用默认值立即开始分析。

## Workflow

1. 读取历史日志
   - 检查 `~/ip-assessments.md` 是否存在，若存在则读取。
   - 查找目标 IP 或同 /24 段的历史记录，用于趋势对比和复查判断。

2. 规范化目标
   - 标准化为 `target`, `asn`, `hostname`, `range` 四元结构。
   - 默认双目标：判定静态家宽属性 + 风控风险评估。

3. 收集网络归属证据
   - 按 `references/browser-playbook.md` 指导，使用浏览器工具查询各数据源。
   - 查询 RDAP/WHOIS 与 BGP 起源 AS，确认"地址持有方"和"实际路由发布方"。
   - 判定 ASN 的业务属性：住宅运营商、企业网络、云厂商、托管服务商。
   - 必要清单见 `references/source-checklist.md`。

4. 收集代理与滥用证据
   - 拉取 IPQS、Scamalytics、AbuseIPDB、ipinfo、ip-api 等信号。
   - 将 IPQS 作为风控主信号，优先级最高。
   - 重点记录：`Fraud Score`、`proxy/vpn/hosting/mobile`、`abuse confidence`、检测时间。
   - 若 IPQS 不可用，按 `references/scoring-rubric.md` §4 启用降级评分模式。
   - 若数据源冲突，不做"单源拍板"，进入冲突解释步骤。

5. 识别"静态家宽"特征
   - 检查 PTR 与相邻 IP 命名模式是否稳定。
   - 检查历史/现状是否出现"住宅运营商段被代理网络大量使用"的线索。
   - 结合前缀规模、地理一致性、时区一致性评估静态概率。

6. 评分与分级
   - 按 `references/scoring-rubric.md` 计算两个分数：
     - `Static Residential Confidence (0-100)`
     - `Abuse / Block Risk (0-100)`
   - 输出等级标签与置信度，不输出"绝对确定"措辞。
   - 再按 `references/decision-policy.md` 输出"放行/观察/拒绝"动作建议。

7. 生成报告
   - 严格按 `references/report-template.md` 输出，确保结论可复核。
   - 每条关键结论后附来源与时间戳。

8. 写入历史日志
   - 将本次评估结果追加到 `~/ip-assessments.md`。
   - 格式见 `references/log-template.md`。
   - 若文件不存在则创建（含表头）。

## Conflict Resolution Rules

出现冲突时按以下顺序解释：

1. 先区分"IP 本质属性"与"风控风险属性"
   - 本质属性：更看重 ASN 业务类型、BGP、RDAP。
   - 风控风险：更看重 IPQS/黑名单/代理指纹系统。

2. 给出并存结论
   - 允许出现"来自住宅 ISP，但被高风险代理模型命中"的双结论。
   - 明确这是"属性合法"与"风控高风险"并存，不互相否定。

3. 说明不确定性来源
   - 数据时效差异、样本缺失、供应商算法差异、PTR 缺失、地理数据库偏差。

## Output Rules

- 始终给出：
  - 最终结论（是否静态家宽住宅）
  - 置信度（高/中/低 + 数值）
  - 关键证据表（来源、字段、观测值、观测时间）
  - 冲突分析
  - 账号安全建议
- 对账号安全场景，必须输出"执行动作"：`Allow` / `Review` / `Reject`。
- 若 IPQS 数据缺失，不得直接输出 `Allow`（至少为 `Review`），并标注降级评分模式。
- 数据不足时输出"暂定结论"，并列出缺失项和下一步验证动作。
- 不给法律意见，不夸大准确率。

## Default Profile

当用户未指定策略时，采用以下默认画像：

- 目标：双目标（静态家宽属性 + 风控风险）
- 风格：保守
- 重点场景：Claude 等高价值账号安全
- 建议强度：优先规避封禁风险，而非追求通过率
- 灰区放行：允许（需二次验证）
- 复查周期：14 天

## References

- `references/question-protocol.md`：快速确认协议（最多 1 轮提问）。
- `references/browser-playbook.md`：浏览器数据采集操作手册（查询 URL、页面结构、反爬处理）。
- `references/source-checklist.md`：证据来源与最小采集清单。
- `references/scoring-rubric.md`：双维度评分、阈值规则与 IPQS 降级评分方案。
- `references/decision-policy.md`：保守策略下的决策规则（Allow/Review/Reject）。
- `references/report-template.md`：标准报告模板。
- `references/log-template.md`：历史日志格式（`~/ip-assessments.md`）。
