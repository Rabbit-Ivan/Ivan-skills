# Source Checklist

优先收集“最小必要证据”，再扩展。

## A. 网络归属证据（必须）

1. RDAP / WHOIS
- 目标：确认地址持有方、分配类型、注册地址块。
- 例：`https://rdap.arin.net/registry/ip/<IP-or-prefix>`

2. BGP 起源 ASN
- 目标：确认实际路由发布方与前缀。
- 可用：Team Cymru、BGP HE。

3. ASN 业务属性
- 目标：判断运营商是住宅 ISP、企业网络、云厂商还是托管商。

## B. 代理与风险证据（账号安全场景必须）

1. IPQS
- 重点字段：`Fraud Score`, `VPN`, `Proxy`, `Tor`, `Recent Abuse`。
- 账号安全高价值场景下，IPQS 视为主信号；无法获取时必须标注“关键数据缺失”。

2. Scamalytics
- 重点字段：`Fraud Score`, `Risk Level`, `Blacklists`。

3. AbuseIPDB
- 重点字段：`Abuse Confidence Score`, `Reports`。

4. ipinfo / ip-api
- 重点字段：`org/asn`, `hosting/proxy/mobile`, `city/region/timezone`。

## C. 静态家宽特征证据（必须）

1. PTR / rDNS
- 查询：`dig -x <IP>` 或 `host <IP>`。
- 观察是否有稳定命名规则。

2. 相邻 IP 命名模式
- 在同段抽样 3-10 个相邻 IP，看 PTR 是否同模式。

3. 地理与时区一致性
- 对比多个 GeoIP 源，标注偏差。

## D. 证据记录规范

每条证据至少记录：

- 来源（平台名 + URL）
- 观测时间（含时区）
- 关键字段和原值
- 对结论的影响（支持/反对/中立）

缺失数据时必须显式写明：

- 缺失项是什么
- 为什么缺失
- 对结论带来的不确定性

账号安全场景的缺失处理补充：

- 若 IPQS 缺失，最终动作不得为 `Allow`。
- 若 IPQS 缺失但其他来源低风险，可给 `Review` + 二次验证建议。
