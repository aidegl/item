#!/usr/bin/env python3
"""
GLM Proxy Server - 将 Anthropic 格式请求转换为 GLM/OpenAI 格式
监听本地端口，接收 Claude CLI 的请求并转发到 GLM API
"""

import json
import http.server
import socketserver
import urllib.request
import urllib.error
from datetime import datetime

# GLM API 配置
GLM_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
GLM_API_KEY = "f9ddbbc622fa4f6a837515bcded4dd34.Iu4ZAKCp9jSTg156"
GLM_MODEL = "glm-4"

# 代理配置
PROXY_PORT = 15721
PROXY_HOST = "127.0.0.1"


class GLMProxyHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            # 解析 Anthropic 格式请求
            anthropic_request = json.loads(post_data.decode('utf-8'))
            print(f"收到 Anthropic 请求：{anthropic_request.get('model', 'unknown')}")
            
            # 转换为 GLM/OpenAI 格式
            glm_request = self.convert_to_glm(anthropic_request)
            
            # 发送到 GLM API
            glm_response = self.send_to_glm(glm_request)
            
            # 转换回 Anthropic 格式
            anthropic_response = self.convert_to_anthropic(glm_response, anthropic_request)
            
            # 发送响应
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('X-Provider', 'GLM')
            self.end_headers()
            self.wfile.write(json.dumps(anthropic_response).encode('utf-8'))
            
        except Exception as e:
            print(f"错误：{e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = {"error": {"message": str(e), "type": "proxy_error"}}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def convert_to_glm(self, anthropic_req):
        """将 Anthropic 格式转换为 GLM/OpenAI 格式"""
        messages = []
        
        # 处理 system prompt
        system_content = anthropic_req.get('system', '')
        if system_content:
            messages.append({"role": "system", "content": system_content})
        
        # 处理 messages
        for msg in anthropic_req.get('messages', []):
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            
            # 处理 content 可能是列表的情况
            if isinstance(content, list):
                content = ' '.join([
                    item.get('text', '') 
                    for item in content 
                    if item.get('type') == 'text'
                ])
            
            messages.append({"role": role, "content": content})
        
        return {
            "model": GLM_MODEL,
            "messages": messages,
            "max_tokens": anthropic_req.get('max_tokens', 1024),
            "stream": anthropic_req.get('stream', False)
        }

    def send_to_glm(self, glm_request):
        """发送请求到 GLM API"""
        req = urllib.request.Request(
            GLM_API_URL,
            data=json.dumps(glm_request).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {GLM_API_KEY}'
            },
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=60) as response:
            return json.loads(response.read().decode('utf-8'))

    def convert_to_anthropic(self, glm_response, original_request):
        """将 GLM 响应转换为 Anthropic 格式"""
        choice = glm_response.get('choices', [{}])[0]
        message = choice.get('message', {})
        usage = glm_response.get('usage', {})
        
        return {
            "id": glm_response.get('id', 'glm-proxy-' + datetime.now().strftime('%Y%m%d%H%M%S')),
            "type": "message",
            "role": "assistant",
            "content": [{"type": "text", "text": message.get('content', '')}],
            "model": GLM_MODEL,
            "stop_reason": self.map_finish_reason(choice.get('finish_reason', 'stop')),
            "usage": {
                "input_tokens": usage.get('prompt_tokens', 0),
                "output_tokens": usage.get('completion_tokens', 0)
            }
        }

    def map_finish_reason(self, glm_reason):
        """映射 finish_reason"""
        mapping = {
            'stop': 'end_turn',
            'length': 'max_tokens',
            'content_filter': 'content_filter',
            'function_call': 'tool_use'
        }
        return mapping.get(glm_reason, 'end_turn')


def run_proxy():
    with socketserver.TCPServer((PROXY_HOST, PROXY_PORT), GLMProxyHandler) as httpd:
        print(f"🚀 GLM 代理服务已启动")
        print(f"   监听地址：http://{PROXY_HOST}:{PROXY_PORT}")
        print(f"   GLM API: {GLM_API_URL}")
        print(f"   模型：{GLM_MODEL}")
        print(f"\n按 Ctrl+C 停止服务")
        httpd.serve_forever()


if __name__ == "__main__":
    run_proxy()
