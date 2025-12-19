
import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Play, 
  Sparkles, 
  Download, 
  Copy, 
  Layout, 
  PanelLeft, 
  PanelRight, 
  RotateCcw,
  Send,
  MessageSquare,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  X,
  ExternalLink
} from 'lucide-react';
import { CodeState, ChatMessage } from './types';
import { modifyCodeWithAI, chatAboutCode } from './services/geminiService';

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<body>
  <div class="card">
    <h1>Hello, World!</h1>
    <p>Start typing HTML here or ask the AI to build something for you.</p>
    <button class="btn">Click Me</button>
  </div>
</body>
</html>`;

const DEFAULT_CSS = `body {
  font-family: 'Inter', sans-serif;
  background: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 400px;
}

h1 { color: #4f46e5; margin-bottom: 0.5rem; }
p { color: #64748b; margin-bottom: 1.5rem; }

.btn {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:hover {
  background: #4338ca;
}`;

const App: React.FC = () => {
  const [code, setCode] = useState<CodeState>({ html: DEFAULT_HTML, css: DEFAULT_CSS });
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [previewSize, setPreviewSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getFullHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${code.css}</style>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        </head>
        <body>${code.html}</body>
      </html>
    `;
  };

  const updatePreview = () => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(getFullHtml());
        doc.close();
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(updatePreview, 300);
    return () => clearTimeout(timer);
  }, [code]);

  const handleAiAction = async () => {
    if (!userInput.trim()) return;
    
    setIsAiLoading(true);
    const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: userInput };
    setMessages(prev => [...prev, newUserMsg]);
    
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await modifyCodeWithAI(userInput, code, history);
      
      setCode({ html: result.html, css: result.css });
      const modelMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        content: "I've updated the code based on your request! ✨" 
      };
      setMessages(prev => [...prev, modelMsg]);
      setUserInput('');
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: 'err', role: 'model', content: "Failed to update code. Please check your request." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExport = () => {
    const content = getFullHtml();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFullscreen = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write(getFullHtml());
      newWindow.document.close();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Code2 className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">HTML Forge</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">AI Interactive Playground</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setPreviewSize('mobile')}
            className={`p-2 rounded-lg transition-all ${previewSize === 'mobile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Smartphone size={16} />
          </button>
          <button 
            onClick={() => setPreviewSize('tablet')}
            className={`p-2 rounded-lg transition-all ${previewSize === 'tablet' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Tablet size={16} />
          </button>
          <button 
            onClick={() => setPreviewSize('desktop')}
            className={`p-2 rounded-lg transition-all ${previewSize === 'desktop' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Monitor size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleFullscreen}
            title="Open in new tab"
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all border border-slate-700"
          >
            <ExternalLink size={14} /> Fullscreen
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all border border-slate-700"
          >
            <Download size={14} /> Export
          </button>
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg ${showChat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'}`}
          >
            <Sparkles size={14} /> AI Assistant
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Side */}
        <div className="flex-1 flex flex-col border-r border-slate-800">
          <div className="flex items-center gap-1 p-2 bg-slate-900 border-b border-slate-800">
            <button 
              onClick={() => setActiveTab('html')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'html' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
            >
              index.html
            </button>
            <button 
              onClick={() => setActiveTab('css')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'css' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
            >
              style.css
            </button>
          </div>
          
          <div className="flex-1 relative group">
            <textarea
              value={activeTab === 'html' ? code.html : code.css}
              onChange={(e) => setCode(prev => ({ ...prev, [activeTab]: e.target.value }))}
              spellCheck={false}
              className="w-full h-full p-6 bg-[#0f172a] text-slate-300 font-mono text-sm resize-none focus:outline-none custom-scrollbar leading-relaxed"
              placeholder={`Write your ${activeTab.toUpperCase()} here...`}
            />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(activeTab === 'html' ? code.html : code.css);
                }}
                className="p-2 bg-slate-800/80 backdrop-blur rounded-lg border border-slate-700 text-slate-400 hover:text-white"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-hidden p-8 transition-all duration-500">
          <div 
            className={`bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 flex flex-col ${
              previewSize === 'mobile' ? 'w-[375px] h-[667px]' : 
              previewSize === 'tablet' ? 'w-[768px] h-[1024px]' : 'w-full h-full'
            }`}
          >
            <div className="h-8 bg-slate-200 flex items-center px-4 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <div className="flex-1 ml-4 h-5 bg-white rounded-md text-[10px] text-slate-400 flex items-center px-2">
                localhost:3000
              </div>
            </div>
            <iframe
              ref={iframeRef}
              title="preview"
              className="flex-1 w-full border-none"
            />
          </div>
        </div>

        {/* AI Chat Sidebar */}
        <div 
          className={`fixed right-0 top-[61px] bottom-0 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl transition-transform duration-300 z-30 flex flex-col ${showChat ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <Sparkles size={16} className="text-indigo-400" /> AI Architect
            </h3>
            <button onClick={() => setShowChat(false)} className="text-slate-500 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="text-slate-500" size={24} />
                </div>
                <p className="text-xs text-slate-500 px-4">
                  "Build a modern login page"<br/>
                  "Add a dark theme"<br/>
                  "Make the buttons rounded"
                </p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-300 rounded-tl-none border border-slate-700'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl rounded-tl-none p-3 border border-slate-700">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="relative group">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAiAction();
                  }
                }}
                placeholder="Ask AI to code..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none h-20"
              />
              <button
                disabled={isAiLoading || !userInput.trim()}
                onClick={handleAiAction}
                className="absolute right-2 bottom-3 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-600 mt-3">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <footer className="h-8 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6 text-[10px] text-slate-500 font-medium">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            READY
          </div>
          <span>UTF-8</span>
          <span>HTML5 / CSS3</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-white transition-colors">Documentation</button>
          <button className="hover:text-white transition-colors">Feedback</button>
          <span>v1.0.4</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
