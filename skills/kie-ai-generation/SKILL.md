---
name: kie-ai-generation
description: 在开发需要调用 Kie.ai（kie.ai）生成视频/图片的 API 服务时使用。本 Skill 提供统一的“创建任务→查询结果/回调”工作流、模型参数对照、后端封装最佳实践（鉴权、重试、轮询、回调验签/防重、解析 resultJson）、以及可直接复制的 curl/TypeScript/Python 示例代码。适用于 Next.js/Node/Flask 等服务端集成。
---

# Kie.ai 生成任务 Skill（Text-to-Video / Image/Media）

> 目标：把 Kie.ai 的“异步任务式生成”封装成你项目里稳定、可观测、可扩展的 API：  
> **CreateTask → Poll/Callback → Parse Result → Store/Return URLs**

---

## 你应该在什么时候触发这个 Skill

当你在做以下任一事情时就用它：

- 写后端接口：`POST /api/generate/video`、`GET /api/tasks/:id` 之类
- 在 Next.js / Express / Flask 中对接 Kie.ai
- 需要支持多个模型：Kling v2.1、Wan 2.2 A14B Turbo、Sora 2 Pro（文档给的 model 标识不同）
- 需要处理：轮询、回调、失败码、限流、余额不足、参数校验失败等
- 需要把 `resultJson` 解析成可用的 `resultUrls[]`

---

## 核心事实（Kie.ai API 形态）

Kie.ai 的生成是**两步异步任务**：

1. **创建任务**

`POST https://api.kie.ai/api/v1/jobs/createTask`  
返回 `data.taskId`
2. **查询任务状态/结果**  
`GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=...`  
返回 `data.state`：`waiting | success | fail`  
成功时 `data.resultJson` 是一个 **JSON 字符串**，里面通常是：`{ "resultUrls": ["...mp4"] }`

鉴权统一为：

```

Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

```

---

## 建议你在自己项目里定义的统一抽象（强烈建议）

### 1) 统一的 Task 记录（数据库/缓存都行）

建议最少字段：

- `id`（你自己的 task id，或直接用 kie taskId）
- `provider`：`"kie"`
- `model`：字符串（如 `kling/v2-1-master-text-to-video`）
- `state`：`waiting | success | fail`
- `input`：你请求的 input（保存一份，便于重放/排查）
- `result_urls`：字符串数组
- `fail_code`、`fail_msg`
- `created_at`、`updated_at`

> 不要只把 Kie 的 `taskId` 直接吐给前端不管了——你最终会需要可观测与可控（重试/限流/回调防重/对账）。

### 2) 统一的业务流程

- `create`：创建任务成功后立刻把 `taskId` 存库，状态为 `waiting`
- `resolve`：轮询或回调到来时更新状态
- `deliver`：成功时返回 `resultUrls`，失败时返回可读错误 + failCode

---

## 模型与参数对照（按你提供的文档）

> 统一接口都是同一个 `createTask`，差异仅在 `model` 与 `input` 字段结构。

### A) Kling V2.1 Master Text To Video

- `model`: `kling/v2-1-master-text-to-video`
- `input`：
  - `prompt` (string, required, <=5000)
  - `duration` ("5"|"10", optional, default "5")
  - `aspect_ratio` ("16:9"|"9:16"|"1:1", optional)
  - `negative_prompt` (string <=500, optional)
  - `cfg_scale` (number 0-1 step 0.1, optional)

### B) Wan 2.2 A14b Text To Video Turbo

- `model`: `wan/2-2-a14b-text-to-video-turbo`
- `input`：
  - `prompt` (string, required, <=5000)
  - `resolution` ("480p"|"580p"|"720p", optional, default "720p")
  - `aspect_ratio` ("16:9"|"9:16"|"1:1", optional)
  - `enable_prompt_expansion` (boolean, optional)
  - `seed` (number 0..2147483647, optional)
  - `acceleration` ("none"|"regular", optional, default "none")

### C) Sora 2 Pro Text To Video

- `model`: `sora-2-pro-text-to-video`
- `input`：
  - `prompt` (string, required, <=10000)
  - `aspect_ratio` ("portrait"|"landscape", optional)
  - `n_frames` ("10"|"15", optional)  // 文档描述像“10s/15s”
  - `size` ("standard"|"high", optional)
  - `remove_watermark` (boolean, optional, default true)

---

## 你必须处理好的坑（非常常见）

### 1) `param` 与 `resultJson` 是“JSON 字符串”

查询接口返回里：

- `data.param`：`"{\"model\":\"...\",\"input\":{...}}"`
- `data.resultJson`：`"{\"resultUrls\":[\"https://...\"]}"`

你需要对它们再 `JSON.parse` 一次才能当对象用。

### 2) 轮询策略不要太猛（避免 429）

推荐策略（可按你业务调整）：

- 前 30 秒：每 2 秒一次
- 30~120 秒：每 5 秒一次
- 2 分钟后：每 10~15 秒一次
- 超时：例如 10 分钟仍 `waiting`，就标记为 `timeout`（你自己的状态），允许用户稍后刷新/重试

### 3) 回调（callBackUrl）一定要“防重 + 验证来源”

Kie 会在任务成功/失败时 POST 你的回调地址，内容结构与 Query API 一致。

你必须做：

- **幂等**：同一个 `taskId` 的回调多次到来，不重复写入/不重复触发下游
- **校验**：至少校验 `taskId` 是否存在于你库中、是否属于当前用户/订单
- **不要信任回调的 resultUrls**：你可以接受回调后再调用一次 Query 做最终确认（高安全场景）

> 文档未给出签名字段时，你只能做“业务校验 + 限制回调入口 + 记录原始请求体 + 可选二次查询确认”。

### 4) API Key 安全

- 只能在服务端使用（Node/Next API route/Edge Function/Flask），不要暴露给前端
- 存在环境变量：`KIE_API_KEY`
- 日志里打码：`Bearer sk-****`

### 5) 错误码要映射成“可行动”的业务错误

常见：

- `401`：API Key 无效
- `402`：余额不足（应提示充值/降级到便宜模型）
- `422`：参数校验失败（把你发过去的 model/input 记录下来便于排查）
- `429`：限流（指数退避重试）
- `500`：服务内部错误（重试 + 告警）

---

## curl 示例（可直接复制）

> 注意：以下示例里把 `YOUR_API_KEY` 替换为你自己的 key。

### 1) 创建 Kling v2.1 任务

```bash
curl -X POST "https://api.kie.ai/api/v1/jobs/createTask" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kling/v2-1-master-text-to-video",
    "input": {
      "prompt": "A cinematic close-up of a ramen chef plating noodles, steam swirling, warm neon reflections, shallow depth of field, handheld camera micro-shake.",
      "duration": "5",
      "aspect_ratio": "16:9",
      "negative_prompt": "blur, distort, low quality, watermark",
      "cfg_scale": 0.5
    }
  }'
```

### 2) 创建 Wan 2.2 Turbo 任务

```bash
curl -X POST "https://api.kie.ai/api/v1/jobs/createTask" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "wan/2-2-a14b-text-to-video-turbo",
    "input": {
      "prompt": "Drone shot through a rainy alley in Tokyo at night, reflections on asphalt, cinematic lighting, smooth forward motion.",
      "resolution": "720p",
      "aspect_ratio": "16:9",
      "enable_prompt_expansion": false,
      "seed": 42,
      "acceleration": "none"
    }
  }'
```

### 3) 创建 Sora 2 Pro 任务

```bash
curl -X POST "https://api.kie.ai/api/v1/jobs/createTask" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sora-2-pro-text-to-video",
    "input": {
      "prompt": "a happy dog running in the garden, sunlight, slow motion, natural camera tracking",
      "aspect_ratio": "landscape",
      "n_frames": "10",
      "size": "high",
      "remove_watermark": true
    }
  }'
```

### 4) 查询任务

```bash
curl -X GET "https://api.kie.ai/api/v1/jobs/recordInfo?taskId=YOUR_TASK_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## TypeScript（Node/Next.js）推荐封装

> 目标：你只需要调用 `kieCreateTask()` 与 `kieQueryTask()`，其余都封装好。

```ts
type KieModel =
  | "kling/v2-1-master-text-to-video"
  | "wan/2-2-a14b-text-to-video-turbo"
  | "sora-2-pro-text-to-video";

type CreateTaskResponse = { code: number; msg: string; data?: { taskId: string } };
type RecordInfoResponse = {
  code: number;
  msg: string;
  data?: {
    taskId: string;
    model: string;
    state: "waiting" | "success" | "fail";
    param: string;        // JSON string
    resultJson: string;   // JSON string
    failCode: string | null;
    failMsg: string | null;
    costTime: number | null;
    completeTime: number | null;
    createTime: number;
  };
};

const KIE_BASE_URL = "https://api.kie.ai";
const KIE_API_KEY = process.env.KIE_API_KEY;

function requireApiKey(): string {
  if (!KIE_API_KEY) throw new Error("Missing env: KIE_API_KEY");
  return KIE_API_KEY;
}

export async function kieCreateTask(params: {
  model: KieModel;
  input: Record<string, unknown>;
  callBackUrl?: string;
}): Promise<{ taskId: string }> {
  const apiKey = requireApiKey();

  const res = await fetch(`${KIE_BASE_URL}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kie createTask failed: HTTP ${res.status} ${text}`);
  }

  const json = (await res.json()) as CreateTaskResponse;

  if (json.code !== 200 || !json.data?.taskId) {
    throw new Error(`Kie createTask error: code=${json.code} msg=${json.msg}`);
  }

  return { taskId: json.data.taskId };
}

export async function kieQueryTask(taskId: string): Promise<{
  state: "waiting" | "success" | "fail";
  resultUrls?: string[];
  failCode?: string | null;
  failMsg?: string | null;
  raw: RecordInfoResponse;
}> {
  const apiKey = requireApiKey();

  const url = new URL(`${KIE_BASE_URL}/api/v1/jobs/recordInfo`);
  url.searchParams.set("taskId", taskId);

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kie recordInfo failed: HTTP ${res.status} ${text}`);
  }

  const json = (await res.json()) as RecordInfoResponse;

  if (json.code !== 200 || !json.data) {
    throw new Error(`Kie recordInfo error: code=${json.code} msg=${json.msg}`);
  }

  const { state, resultJson, failCode, failMsg } = json.data;

  if (state === "success") {
    // resultJson is JSON string, parse once more
    const parsed = safeJsonParse(resultJson) as { resultUrls?: string[] } | null;
    const resultUrls = parsed?.resultUrls ?? [];
    return { state, resultUrls, raw: json };
  }

  return { state, failCode, failMsg, raw: json };
}

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
```

### 业务层建议（Next.js API Route 伪代码）

- `POST /api/video`：调用 `kieCreateTask` → 写库 `waiting` → 返回你的 taskId
- `GET /api/tasks/:id`：读库；如 still waiting 可选择触发一次 `kieQueryTask` 刷新

---

## Python（Flask/FastAPI）最小封装

```python
import os
import json
import requests
from typing import Any, Dict, Optional, List

KIE_BASE_URL = "https://api.kie.ai"
KIE_API_KEY = os.environ.get("KIE_API_KEY")

def _require_key() -> str:
    if not KIE_API_KEY:
        raise RuntimeError("Missing env: KIE_API_KEY")
    return KIE_API_KEY

def kie_create_task(model: str, input_data: Dict[str, Any], callback_url: Optional[str] = None) -> str:
    api_key = _require_key()
    payload: Dict[str, Any] = {"model": model, "input": input_data}
    if callback_url:
        payload["callBackUrl"] = callback_url

    r = requests.post(
        f"{KIE_BASE_URL}/api/v1/jobs/createTask",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=60,
    )
    r.raise_for_status()
    data = r.json()
    if data.get("code") != 200 or not data.get("data", {}).get("taskId"):
        raise RuntimeError(f"createTask error: {data}")
    return data["data"]["taskId"]

def kie_query_task(task_id: str) -> Dict[str, Any]:
    api_key = _require_key()
    r = requests.get(
        f"{KIE_BASE_URL}/api/v1/jobs/recordInfo",
        headers={"Authorization": f"Bearer {api_key}"},
        params={"taskId": task_id},
        timeout=60,
    )
    r.raise_for_status()
    data = r.json()
    if data.get("code") != 200 or not data.get("data"):
        raise RuntimeError(f"recordInfo error: {data}")

    state = data["data"]["state"]
    result_json_str = data["data"].get("resultJson") or ""
    fail_code = data["data"].get("failCode")
    fail_msg = data["data"].get("failMsg")

    result_urls: List[str] = []
    if state == "success":
        try:
            parsed = json.loads(result_json_str)
            result_urls = parsed.get("resultUrls", []) or []
        except Exception:
            result_urls = []

    return {
        "state": state,
        "resultUrls": result_urls,
        "failCode": fail_code,
        "failMsg": fail_msg,
        "raw": data,
    }
```

---

## Prompt 设计（给“生视频”更稳的模板）

你可以在 UI/接口层做一个 prompt 结构化模板（对小白很友好）：

- **主体**：主体是谁/是什么
- **场景**：地点、时间、天气、氛围
- **镜头语言**：镜头运动（push-in / tracking / drone）、焦段、景深、稳定性
- **风格**：电影感、写实、动漫、赛博朋克等
- **约束**：不出现水印、不要抖动、不要低清等（放到 negative_prompt 或 prompt 末尾）

示例（可直接给用户）：

> “电影镜头：夜晚东京小巷，雨后地面反光，霓虹灯映射；镜头稳定缓慢向前推进，浅景深，画面写实、质感细腻；避免：低清、模糊、失真、水印、文字。”

---

## 生产级最佳实践清单（你写 API 时照着做）

- 服务端保存 `taskId`，不要只靠前端轮询 Kie
- 记录每次请求的 `model/input`（脱敏后），便于排错
- 轮询有退避（避免 429）
- 回调 endpoint 幂等（按 taskId 去重）
- 成功后解析 `resultJson`（JSON 字符串）
- 把 `resultUrls` 存到你自己的存储/数据库（可选：下载转存到你对象存储）
- 失败时把 `failCode/failMsg` 映射为用户可理解的提示
- API Key 只在服务端，日志打码
- 余额不足（402）做明确提示 + 可降级模型策略

---

## 常用“你可以直接抄”的接口设计（面向产品）

### 1) 创建生成

`POST /api/generations`

- body:
  - `provider`: `"kie"`
  - `model`: `"kling/v2-1-master-text-to-video" | ...`
  - `prompt`: string
  - `options`: object（duration/aspect_ratio/seed 等）
- resp:
  - `generationId`（你自己的）
  - `providerTaskId`（Kie taskId）
  - `state`: `waiting`

### 2) 查询生成

`GET /api/generations/:generationId`

- resp:
  - `state`: `waiting|success|fail`
  - `resultUrls`: string[]（成功时）
  - `error`: `{ code, message }`（失败时）

