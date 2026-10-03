import React, { useState, useEffect } from 'react';
import { ProjectFile, ChatMessage } from '../types';
import { 
  Play, Code, FileText, Download, ArrowLeft, RefreshCw, 
  Send, Sparkles, Check, Terminal, Eye, Monitor, Tablet, Smartphone, ChevronRight
} from 'lucide-react';

interface WorkspaceProps {
  initialPrompt: string;
  initialFiles: ProjectFile[];
  initialMessages: ChatMessage[];
  onBackToHome: () => void;
  onSendFollowUp: (prompt: string) => void;
  isGenerating: boolean;
}

export function Workspace({
  initialPrompt,
  initialFiles,
  initialMessages,
  onBackToHome,
  onSendFollowUp,
  isGenerating
}: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'files'>('preview');
  const [files, setFiles] = useState<ProjectFile[]>(initialFiles);
  const [activeFile, setActiveFile] = useState<ProjectFile>(initialFiles[0] || { path: 'index.html', name: 'index.html', language: 'html', content: '' });
  const [followUpText, setFollowUpText] = useState('');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (initialFiles.length > 0) {
      setFiles(initialFiles);
      if (!files.find(f => f.name === activeFile.name)) {
        setActiveFile(initialFiles[0]);
      }
    }
  }, [initialFiles]);

  // Generate live iframe document bundle
  const getBundleHTML = () => {
    const htmlFile = files.find(f => f.name.endsWith('.html'))?.content || '<h1>App Preview</h1>';
    const cssFile = files.find(f => f.name.endsWith('.css'))?.content || '';
    const jsFile = files.find(f => f.name.endsWith('.js'))?.content || '';

    // Inject CSS & JS directly into HTML
    let bundle = htmlFile;
    if (cssFile) {
      bundle = bundle.replace('</head>', `<style>${cssFile}</style></head>`);
      if (!bundle.includes('<style>')) bundle = `<style>${cssFile}</style>` + bundle;
    }
    if (jsFile) {
      bundle = bundle.replace('</body>', `<script>${jsFile}</script></body>`);
      if (!bundle.includes('<script>')) bundle += `<script>${jsFile}</script>`;
    }

    return bundle;
  };

  const handleFileChange = (newContent: string) => {
    const updated = files.map(f => f.name === activeFile.name ? { ...f, content: newContent } : f);
    setFiles(updated);
    setActiveFile({ ...activeFile, content: newContent });
  };

  const handleDownload = () => {
    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      a.click();
    });
  };

  const handleSend = () => {
    if (followUpText.trim()) {
      onSendFollowUp(followUpText.trim());
      setFollowUpText('');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0d0d11] text-white overflow-hidden font-sans">

      {/* LEFT PANEL: Chat & AI Progress */}
      <div className="w-[380px] lg:w-[440px] flex flex-col border-r border-white/10 bg-[#121217] flex-shrink-0">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#16161e]">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBackToHome}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
              title="Back to Home"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex items-center gap-1.5 font-semibold text-sm">
              <Sparkles className="size-4 text-blue-400" />
              <span>Bolt V2 Project</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
            Active
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {initialMessages.map((msg) => (
            <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Role Header */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{msg.role === 'user' ? 'You' : '⚡ Bolt AI Assistant'}</span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* User Bubble */}
              {msg.role === 'user' ? (
                <div className="bg-[#1488fc] text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-sm max-w-[85%] shadow-md">
                  {msg.content}
                </div>
              ) : (
                <div className="bg-[#1c1c24] border border-white/10 p-4 rounded-2xl rounded-tl-none text-sm w-full space-y-3 shadow-md">
                  
                  {/* Step Progress Cards */}
                  {msg.steps && (
                    <div className="space-y-1.5 border-b border-white/10 pb-3">
                      {msg.steps.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {s.status === 'completed' ? (
                            <div className="size-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</div>
                          ) : (
                            <div className="size-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                          )}
                          <span className={s.status === 'completed' ? 'text-gray-300' : 'text-blue-400 font-medium'}>
                            {s.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-blue-400 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl animate-pulse">
              <Sparkles className="size-4 animate-spin" />
              <span>Generating files & compiling code...</span>
            </div>
          )}
        </div>

        {/* Follow-up Prompt Input */}
        <div className="p-3 border-t border-white/10 bg-[#16161e]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Bolt to refine or add features..."
              className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!followUpText.trim() || isGenerating}
              className="absolute right-2 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40"
            >
              <Send className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Live Workspace Canvas */}
      <div className="flex-1 flex flex-col bg-[#0f0f13] overflow-hidden">
        
        {/* Workspace Top Action Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#16161e]">
          
          {/* Main Workspace Tabs */}
          <div className="flex items-center gap-1 bg-[#0d0d11] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'preview' ? 'bg-[#1c1c24] text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="size-3.5 text-blue-400" />
              <span>Live Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'code' ? 'bg-[#1c1c24] text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code className="size-3.5 text-purple-400" />
              <span>Code Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'files' ? 'bg-[#1c1c24] text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="size-3.5 text-emerald-400" />
              <span>Files ({files.length})</span>
            </button>
          </div>

          {/* Device toggle for Live Preview */}
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1 bg-[#0d0d11] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded-lg ${deviceMode === 'desktop' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                title="Desktop View"
              >
                <Monitor className="size-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode('tablet')}
                className={`p-1.5 rounded-lg ${deviceMode === 'tablet' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                title="Tablet View"
              >
                <Tablet className="size-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded-lg ${deviceMode === 'mobile' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                title="Mobile View"
              >
                <Smartphone className="size-3.5" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewKey(prev => prev + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-[#1c1c24] hover:bg-white/10 text-xs text-gray-300 transition"
              title="Refresh Preview"
            >
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm"
              title="Download Project Files"
            >
              <Download className="size-3.5" />
              <span>Export Code</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 flex overflow-hidden">

          {/* LIVE PREVIEW TAB */}
          {activeTab === 'preview' && (
            <div className="flex-1 flex items-center justify-center p-4 bg-[#0a0a0e] overflow-auto">
              <div 
                className={`h-full bg-white rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 border border-white/10 ${
                  deviceMode === 'mobile' ? 'w-[375px]' : deviceMode === 'tablet' ? 'w-[768px]' : 'w-full'
                }`}
              >
                <iframe
                  key={previewKey}
                  title="Live App Preview"
                  srcDoc={getBundleHTML()}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-modals allow-same-origin"
                />
              </div>
            </div>
          )}

          {/* CODE EDITOR TAB */}
          {activeTab === 'code' && (
            <div className="flex-1 flex">
              {/* File sidebar list */}
              <div className="w-56 border-r border-white/10 bg-[#121217] p-2 space-y-1">
                <div className="text-[11px] font-semibold text-gray-500 px-3 py-1 uppercase">Project Files</div>
                {files.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => setActiveFile(file)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition ${
                      activeFile.name === file.name ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <FileText className="size-3.5" />
                    <span>{file.name}</span>
                  </button>
                ))}
              </div>

              {/* Textarea Editor */}
              <div className="flex-1 flex flex-col bg-[#09090d]">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#121217] text-xs text-gray-400">
                  <span>Editing: <strong className="text-white">{activeFile.name}</strong></span>
                  <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300">{activeFile.language}</span>
                </div>
                <textarea
                  value={activeFile.content}
                  onChange={(e) => handleFileChange(e.target.value)}
                  className="flex-1 w-full bg-[#09090d] text-emerald-400 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* FILES TREE TAB */}
          {activeTab === 'files' && (
            <div className="flex-1 p-6 bg-[#0a0a0e] overflow-y-auto space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">Project Directory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <div 
                    key={file.name}
                    onClick={() => { setActiveFile(file); setActiveTab('code'); }}
                    className="p-4 rounded-xl border border-white/10 bg-[#121217] hover:border-blue-500/50 cursor-pointer transition flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-blue-400" />
                        <span className="font-semibold text-sm">{file.name}</span>
                      </div>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/10">{file.language}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono line-clamp-2">
                      {file.content.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
