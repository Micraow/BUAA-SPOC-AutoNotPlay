/**
 * SpocAutoPlayer
 * 
 * GitHub: https://github.com/wztxy/SpocAutoPlayer
 * License: GPL-2.0
 * 
 * 使用方法:
 *   1. 打开 SPOC 课程视频页面
 *   2. 按 F12 打开开发者工具 -> Console (控制台)
 *   3. 复制下面全部代码并粘贴运行
 *   4. 点击视频的"查看"按钮
 *   5. 在右上角面板设置参数后点击"开始"
 */

(function() {
    'use strict';

    /* ==================== 配置 ==================== */
    const CONFIG = {
        speed: 10,
        updateInterval: 1
    };

    /* ==================== 用户协议 ==================== */
    const USER_AGREEMENT = `<div class="agreement-title">BUAA SPOC 自动刷课工具</div><div class="agreement-subtitle">用户协议与风险声明</div>

使用本工具前，请仔细阅读以下条款：

1. 免责声明
   本工具仅供学习和技术研究使用。使用本工具所产生的一切后果（包括但不限于账号封禁、成绩作废、学业处分等）均由用户自行承担，开发者不承担任何法律责任。

2. 使用风险
   - 本工具通过模拟API请求实现进度更新，存在被平台检测的风险
   - "一键完成"模式风险更高，可能触发平台风控机制
   - 频繁使用或异常操作可能导致账号异常

3. 合规警告
   使用本工具可能违反：
   - 北京航空航天大学相关学业规定
   - SPOC平台用户服务协议
   - 学术诚信相关规定

4. 数据安全
   本工具仅在浏览器本地运行，不会收集、上传或存储任何用户数据。所有认证信息仅用于与SPOC服务器通信。

5. 使用建议
   - 建议优先使用正常观看方式完成课程学习
   - 如需使用本工具，建议使用渐进式模拟而非一键完成
   - 请勿在短时间内完成大量视频

继续使用即表示您已阅读、理解并同意上述全部条款，且愿意自行承担所有相关风险。
    `.trim();

    /* ==================== 样式 ==================== */
    const STYLES = `
        @keyframes spoc-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1); }
            50% { box-shadow: 0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.2); }
        }
        @keyframes spoc-scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
        @keyframes spoc-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        @keyframes spoc-border-flow {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
        }
        #spoc-auto-panel {
            position: fixed;
            top: 10px;
            right: 10px;
            width: 340px;
            background: linear-gradient(145deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
            border: 1px solid transparent;
            border-radius: 16px;
            padding: 0;
            z-index: 99999;
            font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
            color: #e0e0e0;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
            overflow: hidden;
            animation: spoc-glow 3s ease-in-out infinite;
        }
        #spoc-auto-panel::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 16px;
            padding: 1px;
            background: linear-gradient(135deg, #00d4ff, #0099cc, #00d4ff, #00ffcc);
            background-size: 200% 200%;
            animation: spoc-border-flow 3s linear infinite;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }
        #spoc-auto-panel .panel-content {
            padding: 15px;
            position: relative;
        }
        #spoc-auto-panel .title {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #00d4ff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            border-bottom: 1px solid rgba(0, 212, 255, 0.2);
            padding-bottom: 10px;
            text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }
        #spoc-auto-panel .title-text {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #spoc-auto-panel .title-icon {
            width: 8px;
            height: 8px;
            background: #00d4ff;
            border-radius: 50%;
            animation: spoc-pulse 2s ease-in-out infinite;
            box-shadow: 0 0 10px #00d4ff;
        }
        #spoc-auto-panel .version {
            font-size: 10px;
            color: #999;
            font-weight: normal;
        }
        #spoc-auto-panel .status {
            font-size: 12px;
            margin: 8px 0;
            padding: 10px 12px;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 153, 204, 0.05) 100%);
            border-radius: 8px;
            border-left: 3px solid #00d4ff;
            position: relative;
            overflow: hidden;
        }
        #spoc-auto-panel .status::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 100%;
            background: linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.1), transparent);
            animation: spoc-scan 2s linear infinite;
            pointer-events: none;
        }
        #spoc-auto-panel .progress-bar {
            width: 100%;
            height: 26px;
            background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%);
            border-radius: 13px;
            overflow: hidden;
            margin: 12px 0;
            border: 1px solid rgba(0, 212, 255, 0.3);
            position: relative;
        }
        #spoc-auto-panel .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00d4ff, #00ffcc, #00d4ff);
            background-size: 200% 100%;
            animation: spoc-border-flow 2s linear infinite;
            border-radius: 13px;
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 600;
            color: #0a0a0f;
            min-width: 45px;
            padding: 0 10px;
            box-sizing: border-box;
            text-shadow: 0 1px 0 rgba(255,255,255,0.3);
        }
        #spoc-auto-panel .info {
            font-size: 11px;
            color: #00d4ff;
            margin: 5px 0;
            opacity: 0.8;
        }
        #spoc-auto-panel .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            margin: 4px 4px 4px 0;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        #spoc-auto-panel .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
        }
        #spoc-auto-panel .btn:hover::before {
            left: 100%;
        }
        #spoc-auto-panel .btn-primary {
            background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
            color: #000;
            font-weight: 600;
            border: 1px solid #00d4ff;
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        }
        #spoc-auto-panel .btn-primary:hover {
            background: linear-gradient(135deg, #00e5ff 0%, #00aadd 100%);
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
            transform: translateY(-1px);
        }
        #spoc-auto-panel .btn-secondary {
            background: linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 100%);
            color: #5ce1ff;
            font-weight: 500;
            border: 1px solid rgba(0, 212, 255, 0.3);
        }
        #spoc-auto-panel .btn-secondary:hover {
            background: linear-gradient(135deg, #2a2a3e 0%, #3a3a4e 100%);
            border-color: rgba(0, 212, 255, 0.6);
            color: #00d4ff;
        }
        #spoc-auto-panel .btn-danger {
            background: linear-gradient(135deg, #ff4757 0%, #cc3344 100%);
            color: #fff;
            font-weight: 500;
            border: 1px solid #ff4757;
        }
        #spoc-auto-panel .btn-danger:hover {
            background: linear-gradient(135deg, #ff5a6a 0%, #dd4455 100%);
            box-shadow: 0 0 20px rgba(255, 71, 87, 0.4);
        }
        #spoc-auto-panel .log {
            max-height: 80px;
            overflow-y: auto;
            font-size: 10px;
            background: rgba(0, 0, 0, 0.4);
            padding: 8px;
            border-radius: 8px;
            margin-top: 10px;
            font-family: 'Consolas', 'Monaco', monospace;
            border: 1px solid rgba(0, 212, 255, 0.1);
        }
        #spoc-auto-panel .log::-webkit-scrollbar {
            width: 4px;
        }
        #spoc-auto-panel .log::-webkit-scrollbar-track {
            background: transparent;
        }
        #spoc-auto-panel .log::-webkit-scrollbar-thumb {
            background: rgba(0, 212, 255, 0.3);
            border-radius: 2px;
        }
        #spoc-auto-panel .log-item {
            margin: 2px 0;
            padding: 2px 0;
            border-bottom: 1px solid rgba(0, 212, 255, 0.1);
        }
        #spoc-auto-panel .log-success { color: #00ffcc; }
        #spoc-auto-panel .log-error { color: #ff4757; }
        #spoc-auto-panel .log-info { color: #aaa; }
        #spoc-auto-panel .config-group {
            margin: 10px 0;
            padding: 12px;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 0, 0, 0.2) 100%);
            border-radius: 10px;
            border: 1px solid rgba(0, 212, 255, 0.15);
        }
        #spoc-auto-panel .config-row {
            display: flex;
            align-items: center;
            margin: 8px 0;
            gap: 8px;
        }
        #spoc-auto-panel .config-row label {
            flex: 0 0 70px;
            font-size: 11px;
            color: #bbb;
        }
        #spoc-auto-panel .config-row input[type="number"] {
            flex: 1;
            padding: 8px 10px;
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 6px;
            background: rgba(0, 0, 0, 0.3);
            color: #00d4ff;
            font-size: 12px;
            transition: all 0.3s ease;
        }
        #spoc-auto-panel .config-row input[type="number"]:focus {
            outline: none;
            border-color: #00d4ff;
            box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
        }
        #spoc-auto-panel .config-row input[type="number"]:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        #spoc-auto-panel .config-row span {
            font-size: 11px;
            color: #aaa;
            min-width: 20px;
        }
        #spoc-auto-panel .btn-refresh {
            padding: 6px 10px;
            font-size: 10px;
        }
        #spoc-auto-panel .toggle-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 10px 0;
            padding: 10px;
            background: linear-gradient(135deg, rgba(255, 71, 87, 0.1) 0%, rgba(255, 71, 87, 0.05) 100%);
            border-radius: 8px;
            border: 1px solid rgba(255, 71, 87, 0.2);
        }
        #spoc-auto-panel .toggle-label {
            font-size: 11px;
            color: #ff4757;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        #spoc-auto-panel .toggle-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 22px;
            cursor: pointer;
        }
        #spoc-auto-panel .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        #spoc-auto-panel .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 71, 87, 0.2);
            transition: 0.3s;
            border-radius: 22px;
            border: 1px solid rgba(255, 71, 87, 0.3);
        }
        #spoc-auto-panel .toggle-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 2px;
            bottom: 2px;
            background-color: #666;
            transition: 0.3s;
            border-radius: 50%;
        }
        #spoc-auto-panel .toggle-switch input:checked + .toggle-slider {
            background-color: rgba(255, 71, 87, 0.4);
            border-color: #ff4757;
        }
        #spoc-auto-panel .toggle-switch input:checked + .toggle-slider:before {
            transform: translateX(22px);
            background-color: #ff4757;
            box-shadow: 0 0 10px rgba(255, 71, 87, 0.5);
        }
        #spoc-auto-panel .fast-mode-warning {
            font-size: 10px;
            color: #ff4757;
            margin-top: 6px;
            display: none;
            padding: 6px 8px;
            background: rgba(255, 71, 87, 0.1);
            border-radius: 4px;
            border-left: 2px solid #ff4757;
        }
        #spoc-auto-panel .fast-mode-warning.visible {
            display: block;
        }
        #spoc-auto-panel .footer {
            margin-top: 10px;
            padding: 10px 15px;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 212, 255, 0.05) 100%);
            text-align: center;
            display: flex;
            justify-content: center;
            gap: 30px;
            border-top: 1px solid rgba(0, 212, 255, 0.1);
        }
        #spoc-auto-panel .footer a {
            color: #aaa;
            font-size: 10px;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        #spoc-auto-panel .footer a:hover {
            color: #00d4ff;
        }
        
        /* 模态框样式 */
        .spoc-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(5px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: spoc-fade-in 0.3s ease;
        }
        @keyframes spoc-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .spoc-modal {
            background: linear-gradient(145deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 16px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 255, 0.2);
            animation: spoc-modal-in 0.3s ease;
        }
        @keyframes spoc-modal-in {
            from { transform: scale(0.9) translateY(20px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .spoc-modal-header {
            padding: 15px 20px;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%);
            border-bottom: 1px solid rgba(0, 212, 255, 0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .spoc-modal-header h3 {
            margin: 0;
            color: #00d4ff;
            font-size: 14px;
            font-weight: 600;
            text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }
        .spoc-modal-close {
            background: none;
            border: none;
            color: #666;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            transition: color 0.3s ease;
        }
        .spoc-modal-close:hover {
            color: #ff4757;
        }
        .spoc-modal-body {
            padding: 20px;
            max-height: 50vh;
            overflow-y: auto;
            font-size: 12px;
            line-height: 1.8;
            color: #ccc;
            white-space: pre-wrap;
        }
        .spoc-modal-body::-webkit-scrollbar {
            width: 6px;
        }
        .spoc-modal-body::-webkit-scrollbar-track {
            background: transparent;
        }
        .spoc-modal-body::-webkit-scrollbar-thumb {
            background: rgba(0, 212, 255, 0.3);
            border-radius: 3px;
        }
        .spoc-modal-body .agreement-title {
            text-align: center;
            font-size: 18px;
            font-weight: 700;
            color: #00d4ff;
            margin-bottom: 5px;
            text-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
        }
        .spoc-modal-body .agreement-subtitle {
            text-align: center;
            font-size: 14px;
            color: #aaa;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        }
        .spoc-modal-footer {
            padding: 15px 20px;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 212, 255, 0.05) 100%);
            border-top: 1px solid rgba(0, 212, 255, 0.1);
            display: flex;
            justify-content: center;
            gap: 10px;
        }
        .spoc-modal-footer .btn {
            min-width: 100px;
        }
        .spoc-modal-footer .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .spoc-countdown {
            color: #ff4757;
            font-weight: bold;
        }
        
        /* 确认弹窗样式 */
        .spoc-confirm-modal .spoc-modal-header {
            background: linear-gradient(135deg, rgba(255, 71, 87, 0.2) 0%, rgba(0, 0, 0, 0.3) 100%);
            border-bottom-color: rgba(255, 71, 87, 0.3);
        }
        .spoc-confirm-modal .spoc-modal-header h3 {
            color: #ff4757;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .spoc-confirm-modal .spoc-modal-body {
            text-align: center;
            padding: 25px 30px;
        }
        .spoc-confirm-modal .warning-icon {
            font-size: 56px;
            margin-bottom: 20px;
            display: block;
            color: #ff4757;
            text-shadow: 0 0 20px rgba(255, 71, 87, 0.5);
            animation: spoc-pulse 1.5s ease-in-out infinite;
        }
        .spoc-confirm-modal .warning-text {
            color: #ff4757;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            text-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
        }
        .spoc-confirm-modal .warning-desc {
            color: #ccc;
            font-size: 13px;
            line-height: 1.8;
            text-align: center;
            padding: 15px;
            background: rgba(255, 71, 87, 0.08);
            border-radius: 10px;
            border: 1px solid rgba(255, 71, 87, 0.15);
        }
        .spoc-confirm-modal .warning-desc .highlight {
            color: #ff4757;
            font-weight: 500;
        }
        .spoc-confirm-modal .warning-desc .recommend {
            color: #00d4ff;
            font-weight: 500;
        }
        .spoc-confirm-modal .warning-question {
            margin-top: 18px;
            font-size: 14px;
            color: #fff;
            font-weight: 500;
        }
        
        /* 使用方法弹窗样式 */
        .spoc-modal-body .usage-section {
            margin-bottom: 18px;
        }
        .spoc-modal-body .usage-title {
            font-size: 14px;
            font-weight: 600;
            color: #00d4ff;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        }
        .spoc-modal-body .usage-content {
            font-size: 12px;
            line-height: 1.8;
            color: #bbb;
        }
        .spoc-modal-body .usage-steps {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .spoc-modal-body .usage-step {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12px;
            color: #ccc;
        }
        .spoc-modal-body .step-num {
            width: 22px;
            height: 22px;
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 600;
            color: #000;
            flex-shrink: 0;
        }
        .spoc-modal-body .usage-params {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .spoc-modal-body .usage-param {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 10px;
            background: rgba(0, 212, 255, 0.05);
            border-radius: 8px;
            border-left: 3px solid #00d4ff;
        }
        .spoc-modal-body .param-name {
            font-size: 12px;
            font-weight: 600;
            color: #00d4ff;
        }
        .spoc-modal-body .param-desc {
            font-size: 11px;
            color: #aaa;
            line-height: 1.6;
        }
    `;

    /* ==================== 全局状态 ==================== */
    let state = {
        isRunning: false,
        params: null,
        videoDuration: 0,
        currentProgress: 0,
        timer: null,
        capturedHeaders: {},
        fastMode: false
    };

    /* ==================== 工具函数 ==================== */
    function log(msg, type = 'info') {
        const logDiv = document.querySelector('#spoc-log');
        if (logDiv) {
            const item = document.createElement('div');
            item.className = `log-item log-${type}`;
            item.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
            logDiv.insertBefore(item, logDiv.firstChild);
            if (logDiv.children.length > 50) {
                logDiv.removeChild(logDiv.lastChild);
            }
        }
        console.log(`[SPOC Auto] ${msg}`);
    }

    function updateUI(data) {
        const panel = document.getElementById('spoc-auto-panel');
        if (!panel) return;

        if (data.status !== undefined) {
            panel.querySelector('.status').textContent = data.status;
        }
        if (data.progress !== undefined) {
            const fill = panel.querySelector('.progress-fill');
            fill.style.width = `${Math.max(data.progress, 0)}%`;
            fill.textContent = `${data.progress}%`;
        }
        if (data.info !== undefined) {
            panel.querySelector('.info').textContent = data.info;
        }
    }

    /* ==================== 视频时长获取 ==================== */
    async function getVideoDuration() {
        for (let i = 0; i < 10; i++) {
            const video = document.querySelector('video');
            if (video && video.duration && !isNaN(video.duration) && video.duration > 0) {
                return Math.floor(video.duration);
            }
            const durationEl = document.querySelector('.vjs-duration-display, .duration, [class*="duration"], .video-time');
            if (durationEl) {
                const text = durationEl.textContent;
                const match = text.match(/(\d+):(\d+):?(\d+)?/);
                if (match) {
                    if (match[3]) {
                        return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
                    }
                    return parseInt(match[1]) * 60 + parseInt(match[2]);
                }
            }
            await new Promise(r => setTimeout(r, 500));
        }
        const videoSrc = document.querySelector('video source, video')?.src;
        if (videoSrc && videoSrc.includes('.mp4')) {
            return new Promise((resolve) => {
                const tempVideo = document.createElement('video');
                tempVideo.preload = 'metadata';
                tempVideo.onloadedmetadata = () => resolve(Math.floor(tempVideo.duration));
                tempVideo.onerror = () => resolve(0);
                tempVideo.src = videoSrc;
                setTimeout(() => resolve(0), 5000);
            });
        }
        return 0;
    }

    /* ==================== API 请求 ==================== */
    async function sendRequest(endpoint, data) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://spoc.buaa.edu.cn/spocnewht${endpoint}`, true);
            xhr.withCredentials = true;
            const headers = state.capturedHeaders;
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
            if (headers.Token) xhr.setRequestHeader('Token', headers.Token);
            if (headers.RoleCode) xhr.setRequestHeader('RoleCode', headers.RoleCode);
            if (headers['X-Requested-With']) xhr.setRequestHeader('X-Requested-With', headers['X-Requested-With']);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(true);
                    } else {
                        log(`请求失败: HTTP ${xhr.status}`, 'error');
                        resolve(false);
                    }
                }
            };
            xhr.onerror = function() {
                log(`请求错误: ${endpoint}`, 'error');
                resolve(false);
            };
            xhr.send(JSON.stringify(data));
        });
    }

    async function updateProgress(params, progress, playTime) {
        const data = {
            bfjd: progress,
            kcnrid: params.kcnrid,
            kcid: params.kcid,
            sfyd: progress >= 100 ? "1" : "0",
            bfsj: playTime,
            ssmlid: params.ssmlid
        };

        return await sendRequest('/kcnr/updKcnrSfydNew', data);
    }

    /* ==================== 一键完成模式 ==================== */
    async function fastComplete() {
        if (state.isRunning) {
            log('已有任务在运行中', 'error');
            return;
        }
        const durationInput = document.getElementById('spoc-duration');
        const duration = parseFloat(durationInput?.value) || 0;
        if (!state.params) {
            log('请先点击视频"查看"按钮', 'error');
            return;
        }
        if (duration <= 0) {
            log('请输入有效的视频时长', 'error');
            durationInput?.focus();
            return;
        }
        if (!state.capturedHeaders.Token) {
            log('未捕获到认证信息，请重新点击"查看"', 'error');
            return;
        }
        state.isRunning = true;
        log('快速完成模式 - 直接标记100%', 'info');
        updateUI({ status: '正在一键完成...', progress: 0 });
        await sendRequest('/kcnr/addNrydjlb', {
            kcnrid: state.params.kcnrid,
            kcid: state.params.kcid,
            nrlx: "99"
        });
        const success = await updateProgress(state.params, 100, duration);
        if (success) {
            log('视频已标记为完成!', 'success');
            updateUI({ status: '完成! 可切换下一个视频', progress: 100, info: '一键完成模式' });
        } else {
            log('标记失败，请重试', 'error');
            updateUI({ status: '失败，请重试' });
        }
        state.isRunning = false;
    }

    /* ==================== 模拟逻辑 ==================== */
    async function startSimulation() {
        if (state.fastMode) {
            await fastComplete();
            return;
        }
        if (state.isRunning) {
            log('已有任务在运行中', 'error');
            return;
        }
        const durationInput = document.getElementById('spoc-duration');
        const speedInput = document.getElementById('spoc-speed');
        const intervalInput = document.getElementById('spoc-interval');
        const duration = parseFloat(durationInput?.value) || 0;
        const speed = parseFloat(speedInput?.value) || CONFIG.speed;
        const interval = parseFloat(intervalInput?.value) || CONFIG.updateInterval;
        if (!state.params) {
            log('请先点击视频"查看"按钮', 'error');
            return;
        }
        if (duration <= 0) {
            log('请输入有效的视频时长', 'error');
            durationInput?.focus();
            return;
        }
        if (!state.capturedHeaders.Token) {
            log('未捕获到认证信息，请重新点击"查看"', 'error');
            return;
        }
        state.isRunning = true;
        state.videoDuration = duration;
        state.currentProgress = 0;
        log(`开始模拟: ${duration}秒, ${speed}x速度, ${interval}s心跳`, 'success');
        updateUI({ status: '正在模拟观看...', progress: 0 });
        await sendRequest('/kcnr/addNrydjlb', {
            kcnrid: state.params.kcnrid,
            kcid: state.params.kcid,
            nrlx: "99"
        });
        let currentTime = 0;
        const totalTime = duration;
        const increment = interval * speed;
        state.timer = setInterval(async () => {
            if (!state.isRunning) {
                clearInterval(state.timer);
                return;
            }
            currentTime += increment;
            const progress = Math.min(Math.floor((currentTime / totalTime) * 100), 100);
            state.currentProgress = progress;
            const success = await updateProgress(state.params, progress, Math.min(currentTime, totalTime));
            if (success) {
                const remaining = Math.max(0, (totalTime - currentTime) / speed);
                const min = Math.floor(remaining / 60);
                const sec = Math.floor(remaining % 60);
                updateUI({ progress, info: `剩余: ${min}分${sec}秒 | ${speed}x | 心跳${interval}s` });
            }
            if (progress >= 100) {
                clearInterval(state.timer);
                state.isRunning = false;
                log('视频观看完成!', 'success');
                updateUI({ status: '完成! 可切换下一个视频' });
            }
        }, interval * 1000);
    }

    function stopSimulation() {
        if (state.timer) clearInterval(state.timer);
        state.isRunning = false;
        log('已停止模拟', 'info');
        updateUI({ status: '已停止' });
    }

    /* ==================== 模态框 ==================== */
    function showModal(options) {
        const { title, content, showClose = true, buttons = [], isConfirm = false, countdown = 0 } = options;
        const overlay = document.createElement('div');
        overlay.className = 'spoc-modal-overlay';
        const modal = document.createElement('div');
        modal.className = `spoc-modal${isConfirm ? ' spoc-confirm-modal' : ''}`;
        let headerHtml = `<h3>${title}</h3>`;
        if (showClose) headerHtml += `<button class="spoc-modal-close">&times;</button>`;
        let footerHtml = '';
        if (buttons.length > 0) {
            footerHtml = '<div class="spoc-modal-footer">';
            buttons.forEach((btn, index) => {
                const disabled = countdown > 0 && btn.primary ? 'disabled' : '';
                const text = countdown > 0 && btn.primary ? `${btn.text} (<span class="spoc-countdown">${countdown}</span>s)` : btn.text;
                footerHtml += `<button class="btn ${btn.primary ? 'btn-primary' : 'btn-secondary'}" data-btn-index="${index}" ${disabled}>${text}</button>`;
            });
            footerHtml += '</div>';
        }
        modal.innerHTML = `<div class="spoc-modal-header">${headerHtml}</div><div class="spoc-modal-body">${content}</div>${footerHtml}`;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        if (countdown > 0) {
            let remaining = countdown;
            const countdownEl = modal.querySelector('.spoc-countdown');
            const primaryBtn = modal.querySelector('.btn-primary');
            const timer = setInterval(() => {
                remaining--;
                if (countdownEl) countdownEl.textContent = remaining;
                if (remaining <= 0) {
                    clearInterval(timer);
                    if (primaryBtn) {
                        primaryBtn.disabled = false;
                        primaryBtn.innerHTML = buttons.find(b => b.primary)?.text || '确认';
                    }
                }
            }, 1000);
        }
        const closeBtn = modal.querySelector('.spoc-modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                overlay.remove();
                if (options.onClose) options.onClose();
            };
        }
        buttons.forEach((btn, index) => {
            const btnEl = modal.querySelector(`[data-btn-index="${index}"]`);
            if (btnEl) {
                btnEl.onclick = () => {
                    if (btnEl.disabled) return;
                    overlay.remove();
                    if (btn.onClick) btn.onClick();
                };
            }
        });
        return overlay;
    }

    function showAgreementModal(forceRead = false, onAgree = null) {
        showModal({
            title: '用户协议与风险声明',
            content: USER_AGREEMENT,
            showClose: !forceRead,
            countdown: forceRead ? 5 : 0,
            buttons: forceRead ? [
                { text: '我已阅读并同意', primary: true, onClick: () => { if (onAgree) onAgree(); } },
                { text: '不同意', primary: false, onClick: () => {
                    const panel = document.getElementById('spoc-auto-panel');
                    if (panel) panel.remove();
                    window.__SPOC_AUTO_LOADED__ = false;
                    console.log('[SPOC Auto] 用户未同意协议，脚本已退出');
                }}
            ] : [{ text: '关闭', primary: true, onClick: () => {} }]
        });
    }

    // ==================== 使用方法弹窗 ====================
    const USAGE_GUIDE = `<div class="usage-section"><div class="usage-title">使用步骤</div><div class="usage-steps"><div class="usage-step"><span class="step-num">1</span>打开 SPOC 课程视频页面</div><div class="usage-step"><span class="step-num">2</span>按 F12 打开开发者工具，切换到 Console (控制台) 标签</div><div class="usage-step"><span class="step-num">3</span>复制本脚本全部代码并粘贴运行</div><div class="usage-step"><span class="step-num">4</span>阅读并同意用户协议</div><div class="usage-step"><span class="step-num">5</span>点击视频的"查看"按钮，脚本自动拦截请求</div><div class="usage-step"><span class="step-num">6</span>确认配置后点击"开始"按钮</div></div></div><div class="usage-section"><div class="usage-title">实现原理</div><div class="usage-content">本工具通过拦截浏览器发送到 SPOC 服务器的 XHR 请求，自动提取课程参数和认证 Token。然后模拟视频播放过程，定时向服务器发送进度更新请求，实现无需实际播放即可完成视频观看进度的效果。</div></div><div class="usage-section"><div class="usage-title">参数说明</div><div class="usage-params"><div class="usage-param"><span class="param-name">视频时长</span><span class="param-desc">视频的总时长（秒），脚本会尝试自动获取，也可手动输入</span></div><div class="usage-param"><span class="param-name">一键完成</span><span class="param-desc">直接将进度标记为100%，速度快但风险高，不推荐使用</span></div><div class="usage-param"><span class="param-name">播放倍速</span><span class="param-desc">模拟的播放速度倍数，例如10x表示每秒模拟播放10秒视频内容</span></div><div class="usage-param"><span class="param-name">心跳间隔</span><span class="param-desc">向服务器发送进度更新请求的时间间隔，建议1-2秒，间隔过短可能被检测</span></div></div></div><div class="usage-section"><div class="usage-title">推荐配置</div><div class="usage-content">播放倍速: 10-20x | 心跳间隔: 1-2秒<br>以上配置可在约30秒内完成5分钟视频，同时降低被检测风险。</div></div>`;

    function showUsageModal() {
        showModal({
            title: '使用方法',
            content: USAGE_GUIDE,
            showClose: true,
            buttons: [
                {
                    text: '知道了',
                    primary: true,
                    onClick: () => {}
                }
            ]
        });
    }

    function showFastModeConfirm(onConfirm, onCancel) {
        showModal({
            title: '风险警告',
            content: `<span class="warning-icon">!</span><div class="warning-text">一键完成模式存在较大风险！</div><div class="warning-desc">此模式会<span class="highlight">直接将视频进度标记为100%完成</span>，可能<span class="highlight">触发平台风控机制</span>，导致账号异常。<br><br><span class="recommend">建议优先使用渐进式模拟模式</span></div><div class="warning-question">确定要开启吗？</div>`,
            showClose: false,
            isConfirm: true,
            buttons: [
                {
                    text: '确认开启',
                    primary: false,
                    onClick: onConfirm
                },
                {
                    text: '取消',
                    primary: true,
                    onClick: onCancel
                }
            ]
        });
    }

    // ==================== 一键完成模式切换 ====================
    function toggleFastMode(enabled, skipConfirm = false) {
        const checkbox = document.getElementById('spoc-fast-mode');
        const speedInput = document.getElementById('spoc-speed');
        const intervalInput = document.getElementById('spoc-interval');
        const warning = document.querySelector('.fast-mode-warning');

        if (enabled && !skipConfirm) {
            // 显示确认弹窗
            showFastModeConfirm(
                () => {
                    // 确认开启
                    state.fastMode = true;
                    checkbox.checked = true;
                    speedInput.disabled = true;
                    intervalInput.disabled = true;
                    warning.classList.add('visible');
                    log('已开启一键完成模式', 'info');
                },
                () => {
                    // 取消
                    checkbox.checked = false;
                    state.fastMode = false;
                }
            );
        } else if (enabled && skipConfirm) {
            state.fastMode = true;
            speedInput.disabled = true;
            intervalInput.disabled = true;
            warning.classList.add('visible');
            log('已开启一键完成模式', 'info');
        } else {
            state.fastMode = false;
            speedInput.disabled = false;
            intervalInput.disabled = false;
            warning.classList.remove('visible');
            log('已关闭一键完成模式', 'info');
        }
    }

    // ==================== 请求拦截 ====================
    function setupInterceptor() {
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

        XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._url = url;
            this._method = method;
            this._headers = {};
            return originalXHROpen.apply(this, [method, url, ...rest]);
        };
        
        XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
            this._headers[name] = value;
            return originalSetRequestHeader.apply(this, [name, value]);
        };

        XMLHttpRequest.prototype.send = function(body) {
            if (this._url && this._url.includes('addKcnrSfydNew')) {
                log('检测到 addKcnrSfydNew 请求', 'success');
                try {
                    const data = body ? JSON.parse(body) : {};
                    state.capturedHeaders = { ...this._headers };
                    log(`已捕获完整请求头 (${Object.keys(state.capturedHeaders).length} 项)`, 'info');
                    if (state.capturedHeaders.Token) {
                        log(`Token: ${state.capturedHeaders.Token.substring(0, 30)}...`, 'info');
                    }
                    
                    const params = {
                        kcnrid: data.kcnrid,
                        kcid: data.kcid,
                        ssmlid: data.ssmlid
                    };

                    if (params.kcnrid && params.kcid && params.ssmlid) {
                        log(`参数: KCNRID=${params.kcnrid}, KCID=${params.kcid}`, 'success');
                        handleNewRequest(params);
                    } else {
                        log('请求体参数不完整', 'error');
                    }
                } catch (e) {
                    log(`解析请求失败: ${e.message}`, 'error');
                }
            }
            return originalXHRSend.apply(this, [body]);
        };

        log('请求拦截器已启动', 'success');
    }

    async function handleNewRequest(params) {
        if (state.isRunning) {
            stopSimulation();
            await new Promise(r => setTimeout(r, 500));
        }

        state.params = params;
        
        updateUI({ status: '正在获取视频时长...' });
        log('正在尝试自动获取视频时长...', 'info');
        
        let duration = await getVideoDuration();
        
        const durationInput = document.getElementById('spoc-duration');
        if (durationInput) {
            if (duration > 0) {
                durationInput.value = duration;
                log(`自动获取视频时长: ${duration}秒`, 'success');
            } else {
                log('无法自动获取时长，请手动输入', 'info');
                durationInput.focus();
            }
        }
        
        updateUI({ 
            status: '参数已就绪，请确认配置后点击"开始"',
            info: duration > 0 ? `视频时长: ${duration}秒 (已自动获取)` : '请在上方输入视频时长'
        });
    }

    // ==================== UI 创建 ====================
    function createUI() {
        const style = document.createElement('style');
        style.textContent = STYLES;
        document.head.appendChild(style);

        const panel = document.createElement('div');
        panel.id = 'spoc-auto-panel';
        panel.innerHTML = `
            <div class="panel-content">
                <div class="title">
                    <div class="title-text">
                        <div class="title-icon"></div>
                        SPOC AutoPlayer
                    </div>
                    <span class="version">v2.0</span>
                </div>
                <div class="status">等待检测请求...</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%">0%</div>
                </div>
                <div class="config-group">
                    <div class="config-row">
                        <label>视频时长</label>
                        <input type="number" id="spoc-duration" placeholder="自动获取" min="1">
                        <span>秒</span>
                        <button class="btn btn-secondary btn-refresh" id="spoc-refresh-duration">刷新</button>
                    </div>
                    <div class="toggle-row">
                        <span class="toggle-label">一键完成 (高风险)</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="spoc-fast-mode">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="fast-mode-warning">直接标记100%完成，可能被系统检测</div>
                    <div class="config-row">
                        <label>播放倍速</label>
                        <input type="number" id="spoc-speed" value="${CONFIG.speed}" min="1" max="100">
                        <span>x</span>
                    </div>
                    <div class="config-row">
                        <label>心跳间隔</label>
                        <input type="number" id="spoc-interval" value="${CONFIG.updateInterval}" min="0.5" max="10" step="0.5">
                        <span>秒</span>
                    </div>
                </div>
                <div class="info">点击视频"查看"按钮开始</div>
                <div>
                    <button class="btn btn-primary" id="spoc-start">开始</button>
                    <button class="btn btn-secondary" id="spoc-stop">停止</button>
                    <button class="btn btn-danger" id="spoc-close">关闭</button>
                </div>
                <div class="log" id="spoc-log"></div>
            </div>
            <div class="footer">
                <a id="spoc-agreement-link">用户协议</a>
                <a id="spoc-usage-link">使用方法</a>
                <a href="https://github.com/wztxy/SpocAutoPlayer" target="_blank">GitHub</a>
            </div>
        `;
        document.body.appendChild(panel);

        document.getElementById('spoc-start').onclick = startSimulation;
        document.getElementById('spoc-stop').onclick = stopSimulation;
        
        document.getElementById('spoc-fast-mode').onchange = function() {
            toggleFastMode(this.checked);
        };
        
        document.getElementById('spoc-agreement-link').onclick = () => {
            showAgreementModal(false);
        };

        document.getElementById('spoc-usage-link').onclick = () => {
            showUsageModal();
        };

        document.getElementById('spoc-refresh-duration').onclick = async () => {
            log('尝试重新获取视频时长...', 'info');
            const duration = await getVideoDuration();
            if (duration > 0) {
                document.getElementById('spoc-duration').value = duration;
                log(`获取成功: ${duration}秒`, 'success');
            } else {
                log('无法自动获取，请手动输入', 'error');
            }
        };

        document.getElementById('spoc-close').onclick = () => {
            stopSimulation();
            panel.remove();
            window.__SPOC_AUTO_LOADED__ = false;
            location.reload();
        };
    }

    // ==================== 初始化 ====================
    function init() {
        if (window.__SPOC_AUTO_LOADED__) {
            console.log('[SPOC Auto] 脚本已加载，请勿重复运行');
            return;
        }
        window.__SPOC_AUTO_LOADED__ = true;

        console.log('%c BUAA SPOC AutoPlayer v2.0 ', 
                    'background: linear-gradient(90deg, #00d4ff, #0099cc); color: #0a0a0f; font-size: 14px; padding: 5px 15px; border-radius: 5px; font-weight: bold;');
        
        createUI();
        
        showAgreementModal(true, () => {
            setupInterceptor();
            log('脚本初始化完成', 'success');
            log(`配置: 速度=${CONFIG.speed}x, 心跳=${CONFIG.updateInterval}s`, 'info');
        });
    }

    init();

})();
