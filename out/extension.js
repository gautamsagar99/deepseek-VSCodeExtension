"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const ollama_1 = __importDefault(require("ollama"));
const vscode = __importStar(require("vscode"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    const disposable = vscode.commands.registerCommand('deepseek-ai.callDeepSeek', () => {
        const panel = vscode.window.createWebviewPanel('deepChat', 'Deep Seek Chat', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = getWebViewContent();
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'chat') {
                const userPrompt = message.text;
                let responseText = '';
                try {
                    const streamResponse = await ollama_1.default.chat({
                        model: 'deepseek-r1:7b',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true
                    });
                    for await (const part of streamResponse) {
                        responseText += part.message.content;
                        panel.webview.postMessage({ command: 'chatResponse', text: responseText });
                    }
                    // responseText = "abc"
                    panel.webview.postMessage({ command: 'chatResponse', text: responseText });
                }
                catch (err) {
                    panel.webview.postMessage({ command: 'chatResponse', text: `Error: ${String(err)}` });
                }
            }
        });
    });
    context.subscriptions.push(disposable);
}
function getWebViewContent() {
    return /*html*/ `
	<!DOCTYPE html>
	<html lang="en">
	<head>
	<meta charset="UTF-8" />
	
	<style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 1rem;
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    color: #333;
    min-height: 100vh;
  }

  #container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    width: 100%;
  }

  h2 {
    color: #444;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  #prompt {
    width: 100%;
    box-sizing: border-box;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    margin-bottom: 1rem;
    transition: border-color 0.3s ease;
    display: block; /* Ensure it's a block element */
  }

  #prompt:focus {
    border-color: #0078d4;
    outline: none;
  }

  #askBtn {
    background: #0078d4;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s ease;
    width: 100%;
    margin-bottom: 1rem; /* Space between button and response */
    display: block; /* Ensure it's a block element */
  }

  #askBtn:hover {
    background: #005bb5;
  }

  #response {
    border: 1px solid #ddd;
    padding: 1rem;
    min-height: 100px;
    border-radius: 5px;
    background: #f9f9f9;
    font-size: 1rem;
    line-height: 1.5;
    color: #555;
    overflow-y: auto;
    display: block; /* Ensure it's a block element */
  }
</style>
	</head>
	<body>
	<h2>Deep Seek VS Code Extension</h2>
	<textarea id="prompt" rows="3" placeholder="Ask something..."></textarea><br />
	<button id="askBtn">Ask</button>
	<div id="response"></div>

	<script>
	const vscode = acquireVsCodeApi();
		document.getElementById('askBtn').addEventListener('click', () => {
		const text = document.getElementById('prompt').value;
		vscode.postMessage({ command: 'chat', text });
		});

		window.addEventListener('message', event => {
			const {command, text } = event.data;
			if(command === 'chatResponse'){
				document.getElementById('response').innerText = text;
			}
		})
	</script>
	</body>
	</html>
	`;
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map