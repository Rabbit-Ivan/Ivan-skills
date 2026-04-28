# VPS 系统加固参考

## 1. 系统更新

```bash
apt update && apt upgrade -y
```

## 2. BBR 加速

### 检查是否已开启
```bash
sysctl net.ipv4.tcp_congestion_control
# 输出 bbr 表示已开启
```

### 开启 BBR
```bash
# 检查内核版本（4.9+ 支持 BBR）
uname -r

# 写入配置
cat >> /etc/sysctl.conf << EOF
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
EOF

# 生效
sysctl -p

# 验证
sysctl net.ipv4.tcp_congestion_control
lsmod | grep bbr
```

## 3. UFW 防火墙

### 安装和基础配置
```bash
apt install -y ufw

# 默认策略：拒绝入站，允许出站
ufw default deny incoming
ufw default allow outgoing

# 放行 SSH（必须在启用前配置，否则会锁自己在外面）
ufw allow <ssh_port>/tcp comment 'SSH'

# 放行面板端口
ufw allow <panel_port>/tcp comment 'Panel'

# 放行 80/443（SSL 证书申请 + HTTPS）
ufw allow 80/tcp comment 'HTTP for ACME'
ufw allow 443/tcp comment 'HTTPS'

# 启用（会提示确认，用 --force 跳过交互）
ufw --force enable

# 查看状态
ufw status verbose
```

### 注意事项
- 启用 UFW 前必须确保 SSH 端口已放行
- 如果面板使用自定义端口，也需要放行
- 如果有代理节点端口，也需要放行
- 启用前列出所有放行端口让用户确认

## 4. Fail2ban

### 安装和配置
```bash
apt install -y fail2ban

# 创建本地配置（不修改默认文件）
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

# 如果 SSH 使用非标准端口，修改 port
# port = <custom_port>

# 启动并设置开机自启
systemctl enable fail2ban
systemctl start fail2ban

# 查看状态
fail2ban-client status sshd
```

## 5. SSH 安全加固（可选）

### 禁用密码登录（仅密钥登录时）
```bash
# 备份配置
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# 修改配置
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# 重启 SSH
systemctl restart sshd
```

注意：禁用密码登录前必须确认密钥登录可用，否则会锁死。

### 修改 SSH 端口（可选）
```bash
# 修改端口
sed -i "s/#Port 22/Port <new_port>/" /etc/ssh/sshd_config

# UFW 放行新端口
ufw allow <new_port>/tcp comment 'SSH new port'

# 重启 SSH
systemctl restart sshd

# 确认新端口可连接后，再移除旧端口
ufw delete allow 22/tcp
```

注意：修改 SSH 端口后必须先验证新端口可连接，再关闭旧端口。

## 执行顺序建议

1. 系统更新
2. BBR 加速（无风险）
3. Fail2ban（无风险）
4. UFW 防火墙（需确认端口后再启用）
5. SSH 加固（高风险，需用户明确要求）

其中 BBR 和 Fail2ban 可以直接执行，UFW 需要确认端口清单，SSH 加固需要用户明确同意。
