# S-UI 安装参考

## 基本信息

- 项目地址：https://github.com/alireza0/s-ui
- 安装脚本：`bash <(curl -Ls https://raw.githubusercontent.com/alireza0/s-ui/master/install.sh)`
- 默认安装路径：`/usr/local/s-ui`
- 服务名：`s-ui`（面板）+ `sing-box`（核心）
- 管理命令：`s-ui`

## 安装说明

S-UI 基于 sing-box 核心，安装脚本与 3X-UI 类似但有区别。

### 安装前准备

确保系统满足要求：
- 操作系统：Ubuntu 20.04+ / Debian 11+
- 内存：至少 512MB
- 架构：amd64 / arm64

### 安装步骤

1. 下载安装脚本到 `/tmp`：
   ```bash
   curl -Ls https://raw.githubusercontent.com/alireza0/s-ui/master/install.sh -o /tmp/s-ui-install.sh
   ```

2. 分析脚本交互提示（每次安装前都应重新分析，因为脚本可能更新）

3. 执行安装

### 安装后配置

```bash
# 查看面板状态
s-ui status

# 查看设置
s-ui settings

# 重置用户名密码
s-ui reset

# 修改端口
s-ui port <new_port>
```

## 注意事项

- S-UI 安装脚本的交互提示可能随版本更新变化，每次安装前应先下载脚本分析其 `read -rp` 提示序列
- S-UI 使用 sing-box 作为代理核心，与 3X-UI 使用的 Xray 不同
- S-UI 可能有两个服务需要管理：`s-ui`（面板）和 `sing-box`（代理核心）

## 判断是否已安装

```bash
ls /usr/local/s-ui/ 2>/dev/null && echo "已安装" || echo "未安装"
systemctl is-active s-ui 2>/dev/null
```

## SSL 证书配置

S-UI 的 SSL 证书配置方式可能与 3X-UI 不同，安装时需查阅最新文档。通用方案是使用 acme.sh 独立申请证书后在面板 Web UI 中配置证书路径。
