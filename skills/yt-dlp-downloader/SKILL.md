---
name: yt-dlp-downloader
description: |
  使用 yt-dlp 下载视频。当用户发送视频链接（YouTube、Bilibili、Twitter、抖音等）或请求下载视频时触发。支持单个/批量下载，默认优先 4K（2160p），fallback 到 1080p。支持三种编码模式：H.264（默认，最广泛兼容）、HEVC/H.265（4K 高效编码，文件更小）、原始格式（不转码，保留 webm/mkv 等）。自动嵌入中文字幕（优先中文，英文兜底）。触发词：下载视频、yt-dlp、视频链接、HEVC、H.265。
---

# yt-dlp 视频下载

## 前置条件

- yt-dlp 已安装 (`brew install yt-dlp`)
- ffmpeg 已安装 (`brew install ffmpeg`)

## 下载目录

所有视频保存到：`/Users/ivan/Downloads/yt-dlp-download/`

## 下载命令

### 单个视频

```bash
yt-dlp \
  -f "bv*[vcodec^=avc]+ba/bv*+ba/best" \
  -S "res:2160" \
  --merge-output-format mp4 \
  --remux-video mp4 \
  --windows-filenames \
  --no-overwrites \
  -o "/Users/ivan/Downloads/yt-dlp-download/%(title)s.%(ext)s" \
  "VIDEO_URL"
```

### 批量下载（多个 URL）

```bash
yt-dlp \
  -f "bv*[vcodec^=avc]+ba/bv*+ba/best" \
  -S "res:2160" \
  --merge-output-format mp4 \
  --remux-video mp4 \
  --windows-filenames \
  --no-overwrites \
  -o "/Users/ivan/Downloads/yt-dlp-download/%(title)s.%(ext)s" \
  "URL1" "URL2" "URL3"
```

## 参数说明

| 参数 | 作用 |
|------|------|
| `-f "bv*[vcodec^=avc]+ba/bv*+ba/best"` | 优先 H.264 编码（QuickTime 兼容），否则选最佳 |
| `-S "res:2160"` | 优先 4K (2160p)，逐级 fallback 到 1080p → 720p |
| `--merge-output-format mp4` | 合并时输出 MP4 格式 |
| `--remux-video mp4` | 非 MP4 容器自动转换为 MP4 |
| `--windows-filenames` | 处理文件名中的特殊字符 |
| `--no-overwrites` | 不覆盖已存在的文件 |
| `-o "...%(title)s.%(ext)s"` | 使用视频标题作为文件名 |

## 常见问题

### 下载速度慢

添加代理：

```bash
yt-dlp --proxy "socks5://127.0.0.1:1080" ...
```

### 需要登录的视频

使用 cookies：

```bash
yt-dlp --cookies-from-browser chrome ...
```

### 查看可用格式

```bash
yt-dlp -F "VIDEO_URL"
```

需要登录时：

```bash
yt-dlp --cookies-from-browser chrome -F "VIDEO_URL"
```

### 指定清晰度

```bash
# 仅 1080p
yt-dlp -S "res:1080" ...

# 仅 720p
yt-dlp -S "res:720" ...
```

### 4K 只有 VP9/AV1（避免下载后再慢速转码）

先看 2160p 是否有 mp4（常见是 av01 的 401 格式）：

```bash
yt-dlp --cookies-from-browser chrome -F "VIDEO_URL"
```

如果有 2160p 的 mp4，直接下（避免转码）：

```bash
yt-dlp --cookies-from-browser chrome \
  -f "401+140" \
  --merge-output-format mp4 \
  --remux-video mp4 \
  --windows-filenames \
  --no-overwrites \
  -o "/Users/ivan/Downloads/yt-dlp-download/%(title)s [%(height)sp].%(ext)s" \
  "VIDEO_URL"
```

如果只有 VP9 的 2160p（webm），先下载并合并为 mkv：

```bash
yt-dlp --cookies-from-browser chrome \
  -f "313+140" \
  --merge-output-format mkv \
  --remux-video mkv \
  --windows-filenames \
  --no-overwrites \
  -o "/Users/ivan/Downloads/yt-dlp-download/%(title)s [%(height)sp].%(ext)s" \
  "VIDEO_URL"
```

### 统一为 MP4（HEVC）更快方案

优先用硬件编码（快，体积适中）：

```bash
ffmpeg -y -i "INPUT.mkv" \
  -c:v hevc_videotoolbox -b:v 12000k -maxrate 16000k -bufsize 24000k \
  -c:a aac -b:a 192k \
  "OUTPUT.hevc.mp4"
```

高质量但慢（软件编码）：

```bash
ffmpeg -y -i "INPUT.mkv" \
  -c:v libx265 -crf 22 -preset medium \
  -c:a aac -b:a 192k \
  "OUTPUT.hevc.mp4"
```
