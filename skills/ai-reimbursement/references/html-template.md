# HTML 信息图模板参考

本文件提供暗黑玻璃态（Dark Glassmorphism）HTML 信息图的完整骨架和样式规范。生成 `index.html` 时以此为基础，根据具体报销内容填充动态数据。

## 完整 HTML 骨架

```html
<!DOCTYPE html>
<html lang="zh-CN" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{工具名}} 订阅价值分析报告</title>

    <!-- CDN Dependencies -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">

    <!-- Tailwind Config -->
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    animation: {
                        "spin-slow": "spin 3s linear infinite",
                    }
                }
            }
        }
    </script>

    <style>
        /* === Base === */
        body {
            font-family: 'Inter', 'Noto Sans SC', sans-serif;
            background-color: #000;
            color: #fff;
            overflow-x: hidden;
            min-height: 100vh;
        }

        /* === Ethereal Animated Background === */
        #ethereal-container {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            z-index: -1;
            overflow: hidden;
            pointer-events: none;
        }
        #ethereal-layer {
            position: absolute;
            inset: -20px;
        }
        .ethereal-mask {
            background-color: rgba(0, 0, 0, 0.7);
            background-image: radial-gradient(circle at 50% 50%, rgba(20, 20, 30, 0.4), rgba(0,0,0, 0.9));
            width: 100%; height: 100%;
        }
        .noise-overlay {
            position: absolute;
            inset: 0;
            background-image: url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png");
            background-size: 200px;
            background-repeat: repeat;
            opacity: 0.4;
            mix-blend-mode: overlay;
        }

        /* === Glassmorphism Cards === */
        .glass-panel {
            background: rgba(20, 20, 25, 0.4);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
        }
        .glass-card:hover {
            background: rgba(255, 255, 255, 0.07);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        /* === Chart Containers === */
        .chart-container {
            position: relative;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            height: 300px;
            max-height: 400px;
        }
        @media (min-width: 768px) {
            .chart-container { height: 350px; }
        }

        /* === Animations === */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
        }

        /* === Screenshot Gallery === */
        .screenshot-card img {
            max-width: 100%;
            height: auto;
            border-radius: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
    </style>
</head>
<body class="antialiased selection:bg-blue-500 selection:text-white">

    <!-- ==================== -->
    <!-- 1. ETHEREAL BACKGROUND -->
    <!-- ==================== -->
    <div id="ethereal-container">
        <div id="ethereal-layer" style="filter: url(#ethereal-filter) blur(2px);">
            <div style="background-color: rgba(80, 80, 100, 1); width: 100%; height: 100%; position: absolute; inset: 0;"></div>
            <div class="ethereal-mask" style="position: absolute; inset: 0;"></div>
        </div>
        <div class="noise-overlay"></div>
        <svg style="width: 0; height: 0; position: absolute;">
            <defs>
                <filter id="ethereal-filter">
                    <feTurbulence id="feTurbulence" type="turbulence"
                        baseFrequency="0.006 0.006" numOctaves="2" seed="0" result="undulation" />
                    <feColorMatrix id="feColorMatrix" in="undulation" type="hueRotate" values="0" />
                    <feColorMatrix in="dist" result="circulation" type="matrix"
                        values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0" />
                    <feDisplacementMap in="SourceGraphic" in2="circulation" scale="40" result="dist" />
                    <feDisplacementMap in="dist" in2="undulation" scale="40" result="output" />
                </filter>
            </defs>
        </svg>
    </div>

    <!-- ==================== -->
    <!-- 2. MAIN CONTENT -->
    <!-- ==================== -->
    <div class="relative z-10 container mx-auto p-4 md:p-8 max-w-5xl">

        <!-- ========== MODULE 1: HEADER ========== -->
        <header class="mb-12 text-center">
            <div class="inline-block bg-blue-500/20 border border-blue-500/30 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
                {{申请日期}}
            </div>
            <h1 class="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 tracking-tight">
                {{工具名}} 订阅价值分析
            </h1>
            <p class="text-slate-300 max-w-2xl mx-auto text-lg font-light">
                {{一句话描述报销目的}}
            </p>
        </header>

        <!-- KPI Summary Cards -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <!-- Card 1: Amount -->
            <div class="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500/40 transition-colors">
                <span class="text-slate-400 text-xs uppercase font-bold tracking-widest mb-3">订阅费用</span>
                <span class="text-5xl font-bold text-white mb-2">${{美元金额}}</span>
                <span class="text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded text-xs border border-emerald-500/20">≈ ¥{{人民币金额}}</span>
            </div>
            <!-- Card 2: ROI / Efficiency -->
            <div class="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center hover:border-emerald-500/40 transition-colors">
                <span class="text-slate-400 text-xs uppercase font-bold tracking-widest mb-3">{{第二个KPI标题}}</span>
                <span class="text-5xl font-bold text-emerald-400 mb-2">{{第二个KPI数值}}</span>
                <span class="text-slate-400 text-xs">{{第二个KPI说明}}</span>
            </div>
            <!-- Card 3: Version / Engine -->
            <div class="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center hover:border-purple-500/40 transition-colors">
                <span class="text-slate-400 text-xs uppercase font-bold tracking-widest mb-3">{{第三个KPI标题}}</span>
                <span class="text-4xl font-bold text-white mb-2">{{第三个KPI数值}}</span>
                <span class="text-slate-400 text-xs">{{第三个KPI说明}}</span>
            </div>
        </section>

        <!-- ========== MODULE 2: WHY WE NEED IT ========== -->
        <section class="glass-panel rounded-3xl p-6 md:p-10 mb-12">
            <h2 class="text-2xl font-bold text-white mb-2">
                <i class="fas fa-lightbulb text-yellow-400 mr-2"></i>为什么需要 {{工具名}}
            </h2>
            <p class="text-slate-400 mb-8">{{一句话总结核心价值}}</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Scenario Card (repeat for each scenario) -->
                <div class="glass-card p-8 rounded-2xl">
                    <h3 class="text-xl font-bold text-blue-300 mb-4 flex items-center">
                        <span class="bg-blue-500/20 p-2 rounded-lg mr-3"><i class="fas fa-{{icon}}"></i></span>
                        {{场景标题}}
                    </h3>
                    <div class="space-y-4">
                        <div>
                            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">痛点</h4>
                            <p class="text-sm text-slate-300 leading-relaxed">{{痛点描述}}</p>
                        </div>
                        <div>
                            <h4 class="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">解决方案</h4>
                            <p class="text-sm text-slate-300 leading-relaxed">{{解决方案}}</p>
                        </div>
                        <div class="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-chart-line text-green-400"></i>
                                <span class="text-slate-200 text-sm font-medium">{{效率提升数据}}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- ... more scenario cards ... -->
            </div>
        </section>

        <!-- ========== MODULE 3: COMPETITOR COMPARISON ========== -->
        <section class="glass-panel rounded-3xl p-6 md:p-10 mb-12">
            <h2 class="text-2xl font-bold text-white mb-2">
                <i class="fas fa-chart-radar text-cyan-400 mr-2"></i>竞品对比分析
            </h2>
            <p class="text-slate-400 mb-8">{{工具名}} vs 主流竞品多维度评估</p>

            <div class="bg-black/20 p-6 rounded-2xl border border-white/5">
                <div class="chart-container">
                    <canvas id="comparisonChart"></canvas>
                </div>
            </div>
            <p class="text-xs text-slate-500 text-center mt-4">数据基于公开评测和产品对比综合评估</p>
        </section>

        <!-- ========== MODULE 4: LATEST FEATURES ========== -->
        <section class="glass-panel rounded-3xl p-6 md:p-10 mb-12">
            <h2 class="text-2xl font-bold text-white mb-2">
                <i class="fas fa-sparkles text-amber-400 mr-2"></i>最新功能亮点
            </h2>
            <p class="text-slate-400 mb-8">{{版本号}} 版本核心更新</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Feature Card (repeat 2-4 times) -->
                <div class="glass-card p-6 rounded-2xl">
                    <div class="text-3xl mb-3">{{emoji}}</div>
                    <h3 class="font-bold text-white text-lg mb-2">{{功能名称}}</h3>
                    <p class="text-sm text-slate-400 leading-relaxed">{{功能描述}}</p>
                </div>
                <!-- ... more feature cards ... -->
            </div>
        </section>

        <!-- ========== MODULE 5: ROI ANALYSIS ========== -->
        <section class="glass-panel rounded-3xl p-6 md:p-10 mb-12">
            <h2 class="text-2xl font-bold text-white mb-2">
                <i class="fas fa-calculator text-emerald-400 mr-2"></i>投入产出分析
            </h2>
            <p class="text-slate-400 mb-8">成本效益量化评估</p>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <!-- Left: ROI Chart -->
                <div>
                    <p class="text-sm text-slate-300 mb-6 leading-relaxed">
                        {{ROI 文字说明，包含日均成本换算}}
                    </p>
                    <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                        <div class="chart-container" style="height: 280px;">
                            <canvas id="roiChart"></canvas>
                        </div>
                    </div>
                </div>
                <!-- Right: Before vs After -->
                <div class="space-y-4">
                    <div class="glass-card p-6 rounded-2xl">
                        <h4 class="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">使用前</h4>
                        <ul class="space-y-2 text-sm text-slate-300">
                            <li class="flex items-center gap-2"><i class="fas fa-times text-red-400 text-xs"></i>{{使用前痛点1}}</li>
                            <li class="flex items-center gap-2"><i class="fas fa-times text-red-400 text-xs"></i>{{使用前痛点2}}</li>
                            <li class="flex items-center gap-2"><i class="fas fa-times text-red-400 text-xs"></i>{{使用前痛点3}}</li>
                        </ul>
                    </div>
                    <div class="glass-card p-6 rounded-2xl border-emerald-500/20">
                        <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">使用后</h4>
                        <ul class="space-y-2 text-sm text-slate-300">
                            <li class="flex items-center gap-2"><i class="fas fa-check text-emerald-400 text-xs"></i>{{使用后优势1}}</li>
                            <li class="flex items-center gap-2"><i class="fas fa-check text-emerald-400 text-xs"></i>{{使用后优势2}}</li>
                            <li class="flex items-center gap-2"><i class="fas fa-check text-emerald-400 text-xs"></i>{{使用后优势3}}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- ========== MODULE 6: SCREENSHOTS (conditional) ========== -->
        <!-- Only include this section if user provided screenshots/invoices -->
        <section class="glass-panel rounded-3xl p-6 md:p-10 mb-12">
            <h2 class="text-2xl font-bold text-white mb-2">
                <i class="fas fa-file-invoice text-violet-400 mr-2"></i>附件凭证
            </h2>
            <p class="text-slate-400 mb-8">订阅截图与支付凭证</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Screenshot Card (repeat for each screenshot) -->
                <div class="screenshot-card glass-card p-4 rounded-2xl">
                    <img src="data:image/png;base64,{{base64_encoded_image}}" alt="{{截图说明}}" />
                    <p class="text-sm text-slate-400 mt-3 text-center">{{截图标题/说明}}</p>
                </div>
                <!-- ... more screenshot cards ... -->
            </div>
        </section>

        <!-- Footer -->
        <footer class="mt-12 text-center text-slate-500 text-sm pb-8">
            <p>仅供内部审批使用 | {{部门}} · {{申请人}} | Generated on {{日期}}</p>
        </footer>

    </div>

    <!-- ==================== -->
    <!-- 3. SCRIPTS -->
    <!-- ==================== -->
    <script>
        // === Ethereal Background Animation ===
        document.addEventListener('DOMContentLoaded', () => {
            const feColorMatrix = document.querySelector('#feColorMatrix');
            let hue = 0;
            function animateFilter() {
                hue = (hue + 0.2) % 360;
                if (feColorMatrix) feColorMatrix.setAttribute('values', hue);
                requestAnimationFrame(animateFilter);
            }
            requestAnimationFrame(animateFilter);
        });

        // === Chart.js Global Dark Mode Config ===
        document.addEventListener('DOMContentLoaded', () => {
            Chart.defaults.font.family = "'Inter', 'Noto Sans SC', sans-serif";
            Chart.defaults.color = '#94a3b8';
            Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

            // --- Competitor Comparison Chart ---
            // Use radar chart for multi-dimensional comparison, or bar chart for simpler comparisons
            const ctxComparison = document.getElementById('comparisonChart').getContext('2d');
            new Chart(ctxComparison, {
                type: 'radar', // or 'bar'
                data: {
                    labels: [/* dimension labels: e.g. '性能', '功能', '价格', '生态', '易用性' */],
                    datasets: [
                        {
                            label: '{{工具名}}',
                            data: [/* scores 1-10 */],
                            backgroundColor: 'rgba(96, 165, 250, 0.2)',
                            borderColor: '#60a5fa',
                            borderWidth: 2,
                            pointBackgroundColor: '#60a5fa'
                        },
                        {
                            label: '{{竞品1}}',
                            data: [/* scores 1-10 */],
                            backgroundColor: 'rgba(148, 163, 184, 0.1)',
                            borderColor: 'rgba(148, 163, 184, 0.5)',
                            borderWidth: 1,
                            pointBackgroundColor: '#94a3b8'
                        },
                        {
                            label: '{{竞品2}}',
                            data: [/* scores 1-10 */],
                            backgroundColor: 'rgba(251, 191, 36, 0.1)',
                            borderColor: 'rgba(251, 191, 36, 0.5)',
                            borderWidth: 1,
                            pointBackgroundColor: '#fbbf24'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { usePointStyle: true, color: '#e2e8f0' }
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 10,
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            angleLines: { color: 'rgba(255,255,255,0.05)' },
                            pointLabels: { color: '#94a3b8', font: { size: 12 } },
                            ticks: { display: false }
                        }
                    }
                }
            });

            // --- ROI Chart ---
            const ctxRoi = document.getElementById('roiChart').getContext('2d');
            new Chart(ctxRoi, {
                type: 'bar',
                data: {
                    labels: ['月度投入', '预估节省价值'],
                    datasets: [{
                        data: [/* cost_usd, saved_value_usd */],
                        backgroundColor: [
                            'rgba(248, 113, 113, 0.6)',
                            'rgba(52, 211, 153, 0.6)'
                        ],
                        borderColor: ['#f87171', '#34d399'],
                        borderWidth: 1,
                        borderRadius: 6,
                        barThickness: 50
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            callbacks: { label: (ctx) => `$${ctx.raw}` }
                        }
                    },
                    scales: {
                        x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { grid: { display: false } }
                    }
                }
            });
        });
    </script>
</body>
</html>
```

## 样式速查

### 颜色系统

| 用途 | 色值 | Tailwind |
|------|------|---------|
| 背景 | `#000` | `bg-black` |
| 主文字 | `#fff` | `text-white` |
| 次文字 | `#94a3b8` | `text-slate-400` |
| 弱文字 | `#64748b` | `text-slate-500` |
| 强调（蓝） | `#60a5fa` | `text-blue-400` |
| 正面（绿） | `#34d399` | `text-emerald-400` |
| 负面（红） | `#f87171` | `text-red-400` |
| 卡片背景 | `rgba(20,20,25,0.4)` | — |
| 卡片边框 | `rgba(255,255,255,0.1)` | `border-white/10` |

### 排版

- 大标题：`text-4xl md:text-6xl font-bold` + 渐变文字
- 章节标题：`text-2xl font-bold text-white`
- KPI 数值：`text-5xl font-bold`
- 正文：`text-sm text-slate-300 leading-relaxed`
- 标签：`text-xs uppercase font-bold tracking-widest text-slate-400`

### 间距

- 章节间：`mb-12`
- 卡片间：`gap-6` 或 `gap-8`
- 卡片内边距：`p-6` 或 `p-8`
- 面板内边距：`p-6 md:p-10`

### 圆角

- 大面板：`rounded-3xl`
- 卡片：`rounded-2xl`
- 小元素：`rounded-xl` 或 `rounded-lg`
- 标签：`rounded-full`
