import { AIEngine } from './aiEngine.js';

class ChatGPTApp {
  constructor() {
    this.aiEngine = new AIEngine();
    this.chats = JSON.parse(localStorage.getItem('chatgpt_chats')) || [];
    this.currentChatId = localStorage.getItem('chatgpt_active_chat_id') || null;
    this.selectedModel = localStorage.getItem('chatgpt_selected_model') || 'gpt-4o';
    this.theme = localStorage.getItem('chatgpt_theme') || 'dark';
    this.isWebSearch = false;
    this.isCanvasOpen = false;
    this.isRecording = false;
    this.attachments = [];
    this.speechRecognition = null;
    this.speechSynthesis = window.speechSynthesis;
    this.isGenerating = false;

    this.initDOM();
    this.initEvents();
    this.initSpeech();
    this.applyTheme(this.theme);
    
    if (this.chats.length === 0) {
      this.createNewChat();
    } else {
      if (!this.currentChatId || !this.chats.find(c => c.id === this.currentChatId)) {
        this.currentChatId = this.chats[0].id;
      }
      this.renderSidebar();
      this.renderChat();
    }
  }

  initDOM() {
    // Cache DOM Elements
    this.sidebar = document.getElementById('sidebar');
    this.toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    this.newChatBtn = document.getElementById('new-chat-btn');
    this.historyList = document.getElementById('history-list');
    this.searchInput = document.getElementById('search-chats-input');
    
    this.modelBtn = document.getElementById('model-selector-btn');
    this.modelMenu = document.getElementById('model-dropdown-menu');
    this.modelSelectedLabel = document.getElementById('model-selected-label');
    
    this.webSearchBtn = document.getElementById('web-search-toggle');
    this.canvasToggleBtn = document.getElementById('canvas-toggle-btn');
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.settingsBtn = document.getElementById('settings-btn');
    
    this.chatMessagesContainer = document.getElementById('chat-messages-container');
    this.chatThread = document.getElementById('chat-thread');
    this.emptyWelcome = document.getElementById('empty-chat-welcome');
    
    this.chatInput = document.getElementById('chat-textarea');
    this.sendBtn = document.getElementById('send-message-btn');
    this.micBtn = document.getElementById('mic-btn');
    this.attachBtn = document.getElementById('attach-file-btn');
    this.fileInput = document.getElementById('hidden-file-input');
    this.attachmentPreviewBar = document.getElementById('attachment-preview-bar');
    
    this.canvasPanel = document.getElementById('canvas-panel');
    this.closeCanvasBtn = document.getElementById('close-canvas-btn');
    this.canvasEditor = document.getElementById('canvas-editor');
    this.canvasPreviewIframe = document.getElementById('canvas-preview-iframe');
    this.canvasTabEditor = document.getElementById('canvas-tab-editor');
    this.canvasTabPreview = document.getElementById('canvas-tab-preview');
    this.copyCanvasBtn = document.getElementById('copy-canvas-btn');
    this.downloadCanvasBtn = document.getElementById('download-canvas-btn');
    
    // Modals
    this.settingsModal = document.getElementById('settings-modal');
    this.closeSettingsBtn = document.getElementById('close-settings-btn');
    this.saveSettingsBtn = document.getElementById('save-settings-btn');
    this.providerSelect = document.getElementById('setting-provider');
    this.apiKeyInput = document.getElementById('setting-api-key');
    this.baseUrlInput = document.getElementById('setting-base-url');
    this.tempSlider = document.getElementById('setting-temp');
    this.tempVal = document.getElementById('setting-temp-val');
    this.maxTokensInput = document.getElementById('setting-max-tokens');
    this.systemPromptInput = document.getElementById('setting-system-prompt');
    this.clearAllDataBtn = document.getElementById('clear-all-data-btn');
    this.exportChatsBtn = document.getElementById('export-chats-btn');
  }

  initEvents() {
    // Sidebar toggle
    this.toggleSidebarBtn.addEventListener('click', () => {
      this.sidebar.classList.toggle('collapsed');
    });

    // New Chat
    this.newChatBtn.addEventListener('click', () => this.createNewChat());

    // Search chats
    this.searchInput.addEventListener('input', (e) => {
      this.renderSidebar(e.target.value.toLowerCase());
    });

    // Model dropdown toggle & selection
    this.modelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.modelMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      this.modelMenu.classList.remove('show');
    });

    document.querySelectorAll('.model-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        const model = opt.getAttribute('data-model');
        const name = opt.querySelector('.model-name').childNodes[0].textContent.trim();
        this.selectedModel = model;
        this.modelSelectedLabel.textContent = name;
        localStorage.setItem('chatgpt_selected_model', model);
        
        document.querySelectorAll('.model-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        this.modelMenu.classList.remove('show');
      });
    });

    // Web Search Toggle
    this.webSearchBtn.addEventListener('click', () => {
      this.isWebSearch = !this.isWebSearch;
      this.webSearchBtn.classList.toggle('active', this.isWebSearch);
    });

    // Canvas Toggle
    this.canvasToggleBtn.addEventListener('click', () => this.toggleCanvas());
    this.closeCanvasBtn.addEventListener('click', () => this.toggleCanvas(false));

    // Theme Toggle
    this.themeToggleBtn.addEventListener('click', () => {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(this.theme);
    });

    // Settings Modal
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    this.closeSettingsBtn.addEventListener('click', () => this.settingsModal.classList.remove('show'));
    this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    this.tempSlider.addEventListener('input', (e) => this.tempVal.textContent = e.target.value);
    
    this.clearAllDataBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete all chat history and reset settings?')) {
        localStorage.clear();
        location.reload();
      }
    });

    this.exportChatsBtn.addEventListener('click', () => this.exportChats());

    // Input auto resize & submission
    this.chatInput.addEventListener('input', () => {
      this.chatInput.style.height = 'auto';
      this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 200) + 'px';
      this.sendBtn.disabled = !this.chatInput.value.trim() && this.attachments.length === 0;
    });

    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    this.sendBtn.addEventListener('click', () => this.handleSendMessage());

    // Attachments
    this.attachBtn.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files));

    // Voice dictation
    this.micBtn.addEventListener('click', () => this.toggleVoiceDictation());

    // Prompt Card Clicks
    document.querySelectorAll('.prompt-card').forEach(card => {
      card.addEventListener('click', () => {
        const text = card.getAttribute('data-prompt');
        this.chatInput.value = text;
        this.chatInput.dispatchEvent(new Event('input'));
        this.handleSendMessage();
      });
    });

    // Canvas Tabs
    this.canvasTabEditor.addEventListener('click', () => {
      this.canvasTabEditor.classList.add('active');
      this.canvasTabPreview.classList.remove('active');
      this.canvasEditor.style.display = 'block';
      this.canvasPreviewIframe.style.display = 'none';
    });

    this.canvasTabPreview.addEventListener('click', () => {
      this.canvasTabPreview.classList.add('active');
      this.canvasTabEditor.classList.remove('active');
      this.canvasEditor.style.display = 'none';
      this.canvasPreviewIframe.style.display = 'block';
      this.updateCanvasPreview();
    });

    this.copyCanvasBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(this.canvasEditor.value);
      this.copyCanvasBtn.textContent = 'Copied!';
      setTimeout(() => this.copyCanvasBtn.textContent = 'Copy', 2000);
    });

    this.downloadCanvasBtn.addEventListener('click', () => {
      const blob = new Blob([this.canvasEditor.value], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'canvas-code.txt';
      a.click();
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        this.createNewChat();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.searchInput.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        this.toggleCanvas();
      }
      if (e.key === 'Escape') {
        this.settingsModal.classList.remove('show');
        this.modelMenu.classList.remove('show');
      }
    });
  }

  initSpeech() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = true;

      this.speechRecognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        this.chatInput.value = transcript;
        this.chatInput.dispatchEvent(new Event('input'));
      };

      this.speechRecognition.onend = () => {
        this.isRecording = false;
        this.micBtn.classList.remove('mic-recording');
      };

      this.speechRecognition.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        this.isRecording = false;
        this.micBtn.classList.remove('mic-recording');
      };
    }
  }

  toggleVoiceDictation() {
    if (!this.speechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    if (this.isRecording) {
      this.speechRecognition.stop();
      this.isRecording = false;
      this.micBtn.classList.remove('mic-recording');
    } else {
      this.speechRecognition.start();
      this.isRecording = true;
      this.micBtn.classList.add('mic-recording');
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chatgpt_theme', theme);
    this.themeToggleBtn.innerHTML = theme === 'dark' 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }

  createNewChat() {
    const newChat = {
      id: 'chat_' + Date.now(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      pinned: false,
      messages: []
    };
    this.chats.unshift(newChat);
    this.currentChatId = newChat.id;
    this.saveChats();
    this.renderSidebar();
    this.renderChat();
    this.chatInput.focus();
  }

  getCurrentChat() {
    return this.chats.find(c => c.id === this.currentChatId);
  }

  saveChats() {
    localStorage.setItem('chatgpt_chats', JSON.stringify(this.chats));
    localStorage.setItem('chatgpt_active_chat_id', this.currentChatId);
  }

  renderSidebar(filterText = '') {
    this.historyList.innerHTML = '';

    const filtered = this.chats.filter(c => c.title.toLowerCase().includes(filterText));
    
    if (filtered.length === 0) {
      this.historyList.innerHTML = `<li style="padding: 12px; font-size: 13px; color: var(--text-muted); text-align: center;">No conversations found</li>`;
      return;
    }

    filtered.forEach(chat => {
      const li = document.createElement('li');
      li.className = `history-item ${chat.id === this.currentChatId ? 'active' : ''}`;
      
      li.innerHTML = `
        <span class="history-item-title">${this.escapeHTML(chat.title)}</span>
        <div class="history-item-actions">
          <button class="history-action-btn rename-btn" title="Rename">✏️</button>
          <button class="history-action-btn delete-btn" title="Delete">🗑️</button>
        </div>
      `;

      li.addEventListener('click', (e) => {
        if (e.target.classList.contains('rename-btn') || e.target.classList.contains('delete-btn')) return;
        this.currentChatId = chat.id;
        this.saveChats();
        this.renderSidebar();
        this.renderChat();
      });

      li.querySelector('.rename-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const newTitle = prompt('Enter new title for chat:', chat.title);
        if (newTitle && newTitle.trim()) {
          chat.title = newTitle.trim();
          this.saveChats();
          this.renderSidebar();
        }
      });

      li.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete conversation "${chat.title}"?`)) {
          this.chats = this.chats.filter(c => c.id !== chat.id);
          if (this.currentChatId === chat.id) {
            this.currentChatId = this.chats.length > 0 ? this.chats[0].id : null;
          }
          if (this.chats.length === 0) {
            this.createNewChat();
          } else {
            this.saveChats();
            this.renderSidebar();
            this.renderChat();
          }
        }
      });

      this.historyList.appendChild(li);
    });
  }

  renderChat() {
    const chat = this.getCurrentChat();
    this.chatThread.innerHTML = '';

    if (!chat || chat.messages.length === 0) {
      this.emptyWelcome.style.display = 'flex';
      this.chatThread.style.display = 'none';
      return;
    }

    this.emptyWelcome.style.display = 'none';
    this.chatThread.style.display = 'flex';

    chat.messages.forEach(msg => {
      this.appendMessageToDOM(msg);
    });

    this.scrollToBottom();
  }

  appendMessageToDOM(msg) {
    const row = document.createElement('div');
    row.className = `message-row ${msg.role}`;
    row.id = `msg-${msg.id}`;

    const isUser = msg.role === 'user';
    const avatar = isUser ? 'U' : '🤖';

    let html = `
      <div class="message-avatar ${msg.role}">${avatar}</div>
      <div class="message-body">
        <div class="message-author-row">
          <span>${isUser ? 'You' : 'ChatGPT Unlimited'}</span>
          <span class="message-time">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    `;

    // DeepSeek R1 reasoning block rendering
    if (msg.think) {
      html += `
        <div class="think-block">
          <div class="think-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
            <span>🧠 Thought for a few seconds</span>
            <span>▼</span>
          </div>
          <div class="think-content">${this.escapeHTML(msg.think)}</div>
        </div>
      `;
    }

    html += `
        <div class="message-content">${this.parseMarkdown(msg.content)}</div>
        <div class="message-actions">
          <button class="msg-action-btn copy-msg-btn" title="Copy message">📋 Copy</button>
          ${!isUser ? `<button class="msg-action-btn speak-msg-btn" title="Read aloud">🔊 Read</button>` : ''}
          ${!isUser ? `<button class="msg-action-btn regen-msg-btn" title="Regenerate">🔄 Retry</button>` : ''}
        </div>
      </div>
    `;

    row.innerHTML = html;

    // Attach Action Listeners
    row.querySelector('.copy-msg-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(msg.content);
      const btn = row.querySelector('.copy-msg-btn');
      btn.textContent = '✓ Copied';
      setTimeout(() => btn.textContent = '📋 Copy', 2000);
    });

    if (!isUser) {
      row.querySelector('.speak-msg-btn')?.addEventListener('click', () => {
        this.speakText(msg.content);
      });

      row.querySelector('.regen-msg-btn')?.addEventListener('click', () => {
        this.regenerateLastResponse();
      });
    }

    // Attach Code Block Copy & Canvas Listeners
    row.querySelectorAll('.code-block-wrapper').forEach(block => {
      const codeText = block.querySelector('pre code').textContent;
      const copyBtn = block.querySelector('.copy-code-btn');
      const openCanvasBtn = block.querySelector('.open-canvas-btn');

      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(codeText);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => copyBtn.textContent = 'Copy Code', 2000);
        });
      }

      if (openCanvasBtn) {
        openCanvasBtn.addEventListener('click', () => {
          this.openInCanvas(codeText);
        });
      }
    });

    this.chatThread.appendChild(row);
  }

  async handleSendMessage() {
    if (this.isGenerating) return;

    const text = this.chatInput.value.trim();
    if (!text && this.attachments.length === 0) return;

    const chat = this.getCurrentChat();
    if (!chat) return;

    // First message sets chat title
    if (chat.messages.length === 0) {
      chat.title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
      this.renderSidebar();
    }

    const userMsg = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      attachments: [...this.attachments],
      timestamp: new Date().toISOString()
    };

    chat.messages.push(userMsg);
    this.saveChats();

    // Clear input
    this.chatInput.value = '';
    this.chatInput.style.height = 'auto';
    this.attachments = [];
    this.renderAttachmentPreview();
    this.sendBtn.disabled = true;

    this.renderChat();

    // AI Response setup
    const aiMsgId = 'msg_' + (Date.now() + 1);
    const aiMsg = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      think: '',
      timestamp: new Date().toISOString()
    };

    chat.messages.push(aiMsg);
    this.appendMessageToDOM(aiMsg);
    this.scrollToBottom();

    this.isGenerating = true;

    const msgRow = document.getElementById(`msg-${aiMsgId}`);
    const contentEl = msgRow.querySelector('.message-content');
    let thinkEl = null;

    try {
      const stream = this.aiEngine.generateStream(chat.messages.slice(0, -1), this.selectedModel, {
        isWebSearch: this.isWebSearch,
        attachments: userMsg.attachments
      });

      for await (const chunk of stream) {
        if (chunk.type === 'think_start') {
          let thinkBlock = msgRow.querySelector('.think-block');
          if (!thinkBlock) {
            const body = msgRow.querySelector('.message-body');
            thinkBlock = document.createElement('div');
            thinkBlock.className = 'think-block';
            thinkBlock.innerHTML = `
              <div class="think-header">
                <span>🧠 Thinking...</span>
              </div>
              <div class="think-content"></div>
            `;
            body.insertBefore(thinkBlock, contentEl);
          }
          thinkEl = thinkBlock.querySelector('.think-content');
        } else if (chunk.type === 'think_chunk') {
          if (thinkEl) {
            aiMsg.think += chunk.content;
            thinkEl.textContent = aiMsg.think;
          }
        } else if (chunk.type === 'think_end') {
          if (thinkEl) {
            const header = msgRow.querySelector('.think-header');
            header.innerHTML = `<span>🧠 Thought for a few seconds</span><span>▼</span>`;
          }
        } else if (chunk.type === 'chunk') {
          aiMsg.content += chunk.content;
          contentEl.innerHTML = this.parseMarkdown(aiMsg.content);
          this.scrollToBottom();
        }
      }

      this.saveChats();

      // Check if response contains code to trigger Canvas option
      if (aiMsg.content.includes('```html') || aiMsg.content.includes('```javascript') || aiMsg.content.includes('```python')) {
        const codeMatch = aiMsg.content.match(/```(?:html|javascript|css|python)?\n([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
          this.openInCanvas(codeMatch[1]);
        }
      }

    } catch (err) {
      aiMsg.content += `\n\n❌ Error: ${err.message}`;
      contentEl.innerHTML = this.parseMarkdown(aiMsg.content);
    } finally {
      this.isGenerating = false;
      this.sendBtn.disabled = false;
    }
  }

  regenerateLastResponse() {
    const chat = this.getCurrentChat();
    if (!chat || chat.messages.length === 0) return;

    if (chat.messages[chat.messages.length - 1].role === 'assistant') {
      chat.messages.pop();
      this.saveChats();
      this.renderChat();
      this.handleSendMessage();
    }
  }

  handleFileUpload(files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.attachments.push({
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target.result
        });
        this.renderAttachmentPreview();
      };
      reader.readAsText(file);
    });
  }

  renderAttachmentPreview() {
    this.attachmentPreviewBar.innerHTML = '';
    this.attachments.forEach((att, index) => {
      const chip = document.createElement('div');
      chip.className = 'attachment-chip';
      chip.innerHTML = `
        <span>📄 ${this.escapeHTML(att.name)}</span>
        <span class="remove-att" data-index="${index}">✕</span>
      `;
      chip.querySelector('.remove-att').addEventListener('click', () => {
        this.attachments.splice(index, 1);
        this.renderAttachmentPreview();
      });
      this.attachmentPreviewBar.appendChild(chip);
    });
  }

  openInCanvas(code) {
    this.canvasEditor.value = code;
    this.toggleCanvas(true);
    this.updateCanvasPreview();
  }

  toggleCanvas(show = !this.isCanvasOpen) {
    this.isCanvasOpen = show;
    this.canvasPanel.classList.toggle('show', this.isCanvasOpen);
    this.canvasToggleBtn.classList.toggle('active', this.isCanvasOpen);
  }

  updateCanvasPreview() {
    const code = this.canvasEditor.value;
    const doc = this.canvasPreviewIframe.contentDocument || this.canvasPreviewIframe.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();
  }

  openSettings() {
    this.providerSelect.value = this.aiEngine.config.provider;
    this.apiKeyInput.value = this.aiEngine.config.apiKey;
    this.baseUrlInput.value = this.aiEngine.config.baseUrl;
    this.tempSlider.value = this.aiEngine.config.temperature;
    this.tempVal.textContent = this.aiEngine.config.temperature;
    this.maxTokensInput.value = this.aiEngine.config.maxTokens;
    this.systemPromptInput.value = this.aiEngine.config.systemPrompt;
    
    this.settingsModal.classList.add('show');
  }

  saveSettings() {
    this.aiEngine.saveConfig({
      provider: this.providerSelect.value,
      apiKey: this.apiKeyInput.value.trim(),
      baseUrl: this.baseUrlInput.value.trim(),
      temperature: parseFloat(this.tempSlider.value),
      maxTokens: parseInt(this.maxTokensInput.value, 10),
      systemPrompt: this.systemPromptInput.value.trim()
    });

    this.settingsModal.classList.remove('show');
  }

  exportChats() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.chats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chatgpt_unlimited_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  speakText(text) {
    if (!this.speechSynthesis) return;
    this.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block omitted from audio speech.');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    this.speechSynthesis.speak(utterance);
  }

  parseMarkdown(content) {
    if (!content) return '';

    // Code block parser
    let parsed = content.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'code';
      const escaped = this.escapeHTML(code.trim());
      return `
        <div class="code-block-wrapper">
          <div class="code-header">
            <span class="code-lang">${language}</span>
            <div class="code-actions">
              <button class="code-btn open-canvas-btn">⚡ Open in Canvas</button>
              <button class="code-btn copy-code-btn">📋 Copy Code</button>
            </div>
          </div>
          <pre><code class="language-${language}">${escaped}</code></pre>
        </div>
      `;
    });

    // Formatting bold, italic, lists, paragraphs
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    parsed = parsed.replace(/`([^`]+)`/g, '<code>$1</code>');
    parsed = parsed.replace(/\n\n/g, '</p><p>');

    return `<p>${parsed}</p>`;
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  scrollToBottom() {
    this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;
  }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ChatGPTApp();
});
