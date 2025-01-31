// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import ollama  from 'ollama';
import * as vscode from 'vscode';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	
	const disposable = vscode.commands.registerCommand('deepseek-ai.callDeepSeek', () => {
		
		const panel = vscode.window.createWebviewPanel(
			'deepChat',
			'Deep Seek Chat',
			vscode.ViewColumn.One,
			{enableScripts: true}		
	);

	panel.webview.html = getWebViewContent();

	panel.webview.onDidReceiveMessage(async (message: any) => {
		if(message.command === 'chat'){
			const userPrompt = message.text;
			let responseText = '';

			try{
				const streamResponse = await ollama.chat({
					model: 'deepseek-r1:7b',
					messages: [{ role: 'user', content: userPrompt}],
					stream: true
				});

				for await (const part of streamResponse){
					responseText += part.message.content;
					panel.webview.postMessage({command: 'chatResponse', text: responseText}); 
				}

				// responseText = "abc"

				panel.webview.postMessage({command: 'chatResponse', text: responseText}); 

			} catch(err){

				panel.webview.postMessage({command: 'chatResponse', text: `Error: ${String(err)}`});
			}
		}

	});


	});

	context.subscriptions.push(disposable);
}

function getWebViewContent(): string{
	return /*html*/`
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
export function deactivate() {}
