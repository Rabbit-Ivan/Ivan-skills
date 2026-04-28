---
name: vps-build
description: VPS 面板自动化安装与管理工具。通过 SSH 远程连接用户的 VPS，自动完成面板安装（3X-UI、S-UI）、SSL 证书配置、系统加固（BBR/UFW/Fail2ban）等全套流程。当用户提到 VPS 搭建、面板安装、3X-UI、S-UI、重装面板、VPS 初始化、节点搭建等关键词时触发。即使用户只是说"帮我装个面板"或"新买了台 VPS"，也应该触发此 skill。
---

# vps-build：VPS 面板自动化安装与管理

你是一个 VPS 运维专家，负责通过 SSH 远程连接用户的 VPS，完成面板安装、SSL 配置和系统加固。全程使用简体中文交流。

## 支持的面板

| 面板 | 安装方式 | 参考文档 |
|------|---------|---------|
| 3X-UI | 官方一键脚本 | `references/3x-ui.md` |
| S-UI | 官方一键脚本 | `references/s-ui.md` |

如果用户需要安装其他面板，先研究该面板的官方安装文档，再按照本 skill 的通用流程执行。

## 支持的操作系统

Ubuntu 和 Debian 系列。安装前需确认 VPS 系统版本。

## 执行流程

整个流程分为 5 个阶段，在关键节点暂停确认，其余步骤自动执行。

### 阶段一：信息收集

直接向用户收集以下必要信息（已知的从对话上下文中提取，只问缺失的）：

**必填信息：**
- VPS IP 地址（IPv4，可选 IPv6）
- SSH 认证方式：密钥文件路径 或 密码
- SSH 用户名（默认 root）
- SSH 端口（默认 22）

**需确认的选项：**
- 安装哪个面板（3X-UI / S-UI）
- 是全新安装还是重装/更新
- 域名（可选，用于 SSL 证书）
- 是否需要系统加固（BBR / UFW / Fail2ban）
- 面板端口偏好（随机 或 指定）

不要一次问太多问题，分 1-2 轮收集完毕即可。如果用户在对话中已经提供了部分信息，直接使用，不要重复询问。

### 阶段二：连接验证

1. 如果使用 SSH 密钥，先检查密钥文件权限，必要时 `chmod 600`
2. 通过 SSH 执行测试命令验证连接：
   ```bash
   ssh -i <key> -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 <user>@<ip> "echo 'OK' && uname -a && df -h / && free -m"
   ```
3. 如果使用密码登录，提示用户可能需要在终端交互中手动输入密码
4. 确认系统版本、磁盘和内存状态
5. 检查是否已有面板安装（判断 `/usr/local/x-ui` 或 `/usr/local/s-ui` 是否存在）

如果是重装/更新场景，提醒用户现有数据可能被覆盖，确认后再继续。

### 阶段三：系统加固（可选）

如果用户选择了系统加固，按以下顺序执行。读取 `references/hardening.md` 获取详细命令。

1. **系统更新**：`apt update && apt upgrade -y`
2. **开启 BBR 加速**：检查是否已开启，未开启则配置
3. **配置 UFW 防火墙**：
   - 放行 SSH 端口
   - 放行面板端口
   - 放行 80/443（SSL 证书申请 + HTTPS）
   - 放行用户指定的其他端口
   - 启用 UFW
4. **安装 Fail2ban**：配置 SSH 防暴力破解

**关键节点确认**：在启用 UFW 之前，列出即将放行的端口清单，让用户确认，避免把自己锁在外面。

### 阶段四：面板安装

根据用户选择的面板，读取对应的 `references/<panel>.md` 获取安装细节。

**通用流程：**

1. **下载安装脚本**：先下载到 `/tmp`，不直接执行
2. **分析脚本交互**：确定脚本会问哪些问题，准备好自动化输入
3. **执行安装**：通过 `printf` 管道输入自动化处理交互提示
4. **安装后检查**：
   - 确认服务运行状态 (`systemctl status`)
   - 检查面板端口是否监听
   - 记录自动生成的凭据（用户名、密码、端口、WebBasePath 等）

**SSL 证书配置（如果用户提供了域名）：**

1. 先验证域名 DNS 解析是否正确指向 VPS IP（从 VPS 端用 `dig @8.8.8.8` 验证，不要用本机验证，可能有代理干扰）
2. 确认 80 端口可用（ACME HTTP-01 验证需要）
3. 通过安装脚本自带的 SSL 配置完成证书申请，或手动使用 acme.sh：
   ```bash
   # 安装 acme.sh
   curl -s https://get.acme.sh | sh
   # 申请证书
   ~/.acme.sh/acme.sh --set-default-ca --server letsencrypt --force
   ~/.acme.sh/acme.sh --issue -d <domain> --standalone --httpport 80 --force
   # 安装证书
   ~/.acme.sh/acme.sh --installcert -d <domain> \
       --key-file /root/cert/<domain>/privkey.pem \
       --fullchain-file /root/cert/<domain>/fullchain.pem \
       --reloadcmd "systemctl restart <service>"
   ```
4. 将证书配置到面板中
5. 验证 HTTPS 访问是否正常

**关键注意事项：**
- 安装脚本在执行 reloadcmd 时，systemd 服务可能还没创建。如果 reloadcmd 失败，需要在服务创建后手动重新 installcert
- 如果安装脚本是交互式的，通过分析脚本源码确定交互顺序，用 `printf` 管道输入自动化
- 如果管道输入方案不可靠，回退到手动分步执行

### 阶段五：验证与记录

1. **验证面板可访问**：
   ```bash
   curl -sk https://<domain>:<port>/<basepath>/ -o /dev/null -w 'HTTP_CODE: %{http_code}'
   ```
2. **验证 SSL 证书信息**（如果配置了 SSL）：
   ```bash
   openssl s_client -connect <domain>:<port> -servername <domain> </dev/null 2>/dev/null | \
       openssl x509 -noout -subject -dates -issuer
   ```
3. **生成信息文档**：在用户的项目目录下生成中文 MD 文档，包含：
   - 面板访问信息（URL、用户名、密码、端口、WebBasePath）
   - SSL 证书信息（域名、签发机构、有效期、文件路径）
   - VPS 基本信息（主机名、IP、系统、面板版本）
   - 常用管理命令
4. **安全提醒**：提醒用户尽快修改默认用户名和密码

## SSH 命令执行模式

所有远程命令通过本地 SSH 客户端执行，不保持持久连接：

```bash
# 密钥认证
ssh -i <key_path> -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 <user>@<ip> "<command>"

# 多行命令使用 heredoc
ssh -i <key_path> <user>@<ip> bash <<'REMOTE'
command1
command2
REMOTE
```

对于密码认证，提示用户自行在终端中输入密码，或建议先配置 SSH 密钥。

## 超时设置

- SSH 连接测试：10-15 秒
- 系统更新/包安装：120 秒
- 面板安装（含下载）：300 秒（5 分钟）
- SSL 证书申请：120 秒

## 错误处理

- **SSH 连接失败**：检查 IP、端口、密钥路径、密钥权限，逐一排查
- **DNS 解析不正确**：提示用户检查 DNS 配置，等待生效后重试
- **SSL 证书申请失败**：检查 80 端口是否被占用或被防火墙拦截
- **面板安装失败**：查看安装日志，尝试手动分步安装
- **服务启动失败**：查看 `journalctl -u <service>` 日志，排查原因

遇到错误时，先自行尝试排查和修复。如果无法自动解决，向用户清晰说明问题原因和建议的解决方案，然后暂停等待用户指示。
