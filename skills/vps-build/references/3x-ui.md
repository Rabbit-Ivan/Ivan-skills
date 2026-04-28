# 3X-UI 安装参考

## 基本信息

- 项目地址：https://github.com/MHSanaei/3x-ui
- 安装脚本：`bash <(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh)`
- 默认安装路径：`/usr/local/x-ui`
- 服务名：`x-ui`
- 管理命令：`x-ui`

## 安装脚本交互提示序列

安装脚本（`install.sh`）包含以下交互提示，需按顺序准备输入：

### 1. 端口设置
```
"Would you like to customize the Panel Port settings? (If not, a random port will be applied) [y/n]: "
```
- 回答 `n`：系统生成 1024-62000 之间的随机端口（推荐）
- 回答 `y`：接下来会要求输入端口号

### 2. SSL 证书选择
```
"Choose an option (default 2 for IP): "
```
- `1`：Let's Encrypt 域名证书（90 天，自动续期）—— 有域名时选这个
- `2`：Let's Encrypt IP 证书（6 天，自动续期）—— 无域名时的默认选项
- `3`：自定义 SSL 证书路径

### 3. 选择 1（域名证书）后的提示序列
```
"Please enter your domain name: "           → 输入域名
"Please choose which port to use (default is 80): " → 输入 80 或直接回车
"Would you like to modify --reloadcmd for ACME? (y/n): " → n
"Would you like to set this certificate for the panel? (y/n): " → y
```

### 4. 选择 2（IP 证书）后的提示序列
```
"Port to use for ACME HTTP-01 listener (default 80): " → 回车用默认
"Do you have an IPv6 address to include? (leave empty to skip): " → 输入 IPv6 或留空
```

## 自动化输入示例

### 有域名 + 随机端口
```bash
printf 'n\n1\nexample.com\n80\nn\ny\n' | bash /tmp/3x-ui-install.sh
```

### 无域名 + 随机端口 + IP 证书
```bash
printf 'n\n2\n80\n\n' | bash /tmp/3x-ui-install.sh
```

### 自定义端口 + 域名证书
```bash
printf 'y\n12345\n1\nexample.com\n80\nn\ny\n' | bash /tmp/3x-ui-install.sh
```

## 已知问题

### reloadcmd 时序问题
安装脚本在 `config_after_install()` 中配置 SSL 证书时，systemd 服务文件还未创建。这导致 acme.sh 的 `--reloadcmd "systemctl restart x-ui"` 会失败。

**解决方法：** 安装完成后手动重新执行 installcert：
```bash
# 配置证书到面板
/usr/local/x-ui/x-ui cert -webCert "/root/cert/<domain>/fullchain.pem" -webCertKey "/root/cert/<domain>/privkey.pem"

# 重新设置 acme.sh reloadcmd
~/.acme.sh/acme.sh --installcert -d <domain> \
    --key-file /root/cert/<domain>/privkey.pem \
    --fullchain-file /root/cert/<domain>/fullchain.pem \
    --reloadcmd "systemctl restart x-ui" --ecc

# 重启服务
systemctl restart x-ui
```

### 空端口输入问题
`read -rp` 读取空输入时 WebPort 变为空字符串。在 bash `[[ ]]` 中空字符串做算术比较时被视为 0，`0 -lt 1` 为真，所以会回退到默认端口 80。输入 `80` 比空行更安全。

## 管理命令

```bash
x-ui              # 管理菜单
x-ui start        # 启动
x-ui stop         # 停止
x-ui restart      # 重启
x-ui status       # 查看状态
x-ui settings     # 查看当前设置
x-ui log          # 查看日志
x-ui update       # 更新
x-ui uninstall    # 卸载
```

## 配置 CLI

```bash
# 查看当前设置
/usr/local/x-ui/x-ui setting -show true

# 查看证书状态
/usr/local/x-ui/x-ui setting -getCert true

# 修改用户名和密码
/usr/local/x-ui/x-ui setting -username <new_user> -password <new_pass>

# 修改端口
/usr/local/x-ui/x-ui setting -port <new_port>

# 配置证书
/usr/local/x-ui/x-ui cert -webCert <cert_path> -webCertKey <key_path>
```

## 判断是否已安装

```bash
# 检查安装目录
ls /usr/local/x-ui/x-ui 2>/dev/null && echo "已安装" || echo "未安装"

# 检查服务状态
systemctl is-active x-ui 2>/dev/null

# 检查版本
/usr/local/x-ui/x-ui version 2>/dev/null
```
