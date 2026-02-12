import { useState, useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { RotateCcw, Settings, Type, Moon, Command, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { dracula, catppuccinMocha } from "@/lib/editor-themes";
import { emmetHTML, emmetCSS } from "emmet-monaco-es";

interface BattleEditorProps {
  code: string;
  elapsedTime: number;
  formatTime: (seconds: number) => string;
  onCodeChange: (value: string | undefined) => void;
  onReset: () => void;
}

interface EditorSettings {
  fontSize: number;
  theme: "vs-dark" | "light" | "dracula" | "catppuccin-mocha";
  vimMode: boolean;
}

export default function BattleEditor({
  code,
  elapsedTime,
  formatTime,
  onCodeChange,
  onReset,
}: BattleEditorProps) {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const vimModeRef = useRef<any>(null);
  const statusNodeRef = useRef<HTMLDivElement>(null);
  
  const [settings, setSettings] = useState<EditorSettings>({
    fontSize: 14,
    theme: "vs-dark",
    vimMode: false,
  });
  const [showSettings, setShowSettings] = useState(false);

  // Load monaco-vim dynamically
  const [vimModule, setVimModule] = useState<any>(null);
  useEffect(() => {
    import("monaco-vim").then((mod) => setVimModule(mod)).catch(() => {});
  }, []);

  // Load Settings
  useEffect(() => {
    const saved = localStorage.getItem("editor-settings");
    if (saved) {
      try {
        setSettings({ ...settings, ...JSON.parse(saved) });
      } catch (e) {}
    }
  }, []);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem("editor-settings", JSON.stringify(settings));
  }, [settings]);

  // Apply Theme
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("dracula", dracula as any);
      monaco.editor.defineTheme("catppuccin-mocha", catppuccinMocha as any);
      monaco.editor.setTheme(settings.theme);
    }
  }, [monaco, settings.theme]);

  // Apply Vim Mode
  useEffect(() => {
    if (!editorRef.current || !statusNodeRef.current || !vimModule) return;

    if (settings.vimMode) {
      if (!vimModeRef.current) {
        try {
            vimModeRef.current = vimModule.initVimMode(editorRef.current, statusNodeRef.current);
        } catch(e) { console.error("Vim init failed", e); }
      }
    } else {
      if (vimModeRef.current) {
        vimModeRef.current.dispose();
        vimModeRef.current = null;
      }
    }
  }, [settings.vimMode, editorRef.current, statusNodeRef.current, vimModule]);


  // Init Emmet
  useEffect(() => {
      if (monaco) {
          try {
              const disposeHTML = emmetHTML(monaco);
              // Force CSS Emmet in HTML to handle style tags if emmetHTML fails to delegate
              const disposeCSS = emmetCSS(monaco, ['css', 'html']); 
              
              return () => {
                  disposeHTML();
                  disposeCSS();
              };
          } catch (e) {
              console.error("Emmet init failed", e);
          }
      }
  }, [monaco]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Register themes immediately on mount as well
    monaco.editor.defineTheme("dracula", dracula as any);
    monaco.editor.defineTheme("catppuccin-mocha", catppuccinMocha as any);
    monaco.editor.setTheme(settings.theme);

    // Initial check for vim mode if already enabled
    if (settings.vimMode && vimModule && statusNodeRef.current) {
       try {
        vimModeRef.current = vimModule.initVimMode(editor, statusNodeRef.current);
       } catch(e) {}
    }
  };

  return (
    <div className="flex flex-col bg-[#0a0a0c] h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 md:px-4 bg-[#0a0a0c] border-b border-white/5 z-20 relative shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">CSS Editor</span>
           <div className="flex items-center gap-2">
               <div className="bg-white/5 rounded-md px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-white/5 flex items-center gap-1.5" title="Time Elapsed">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {formatTime(elapsedTime)}
               </div>
               <div className="bg-white/5 rounded-md px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-white/5" title="Characters">
                  {code.length} chars
               </div>
           </div>
        </div>
        
        <div className="flex items-center gap-1.5 md:gap-2">
            <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn("p-1.5 rounded-md transition-colors", showSettings ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5")}
                title="Editor Settings"
            >
                <Settings className="w-4 h-4" />
            </button>
            <button
                onClick={onReset}
                className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                title="Reset Code"
            >
                <RotateCcw className="w-4 h-4" />
            </button>
        </div>

        {/* Settings Dropdown */}
        {showSettings && (
            <div className="absolute top-full right-4 mt-2 w-64 bg-[#151517] border border-white/10 rounded-xl shadow-2xl p-4 z-50 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Editor Settings</span>
                     <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white">
                        <Check className="w-3 h-3" />
                     </button>
                </div>
                
                {/* Font Size */}
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs">
                        <Type className="w-3 h-3" />
                        <span>Font Size</span>
                    </div>
                     <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                        <button 
                            onClick={() => setSettings(s => ({ ...s, fontSize: Math.max(10, s.fontSize - 1) }))}
                            className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 rounded text-xs transition-colors"
                        >-</button>
                         <span className="text-xs font-mono w-6 text-center text-white">{settings.fontSize}</span>
                         <button 
                            onClick={() => setSettings(s => ({ ...s, fontSize: Math.min(30, s.fontSize + 1) }))}
                             className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 rounded text-xs transition-colors"
                        >+</button>
                     </div>
                </div>

                {/* Theme */}
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs">
                        <Moon className="w-3 h-3" />
                        <span>Theme</span>
                    </div>
                    <select 
                        value={settings.theme}
                        onChange={(e) => setSettings(s => ({ ...s, theme: e.target.value as any }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs text-white outline-none focus:border-white/20 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                    >
                        <option value="vs-dark" className="bg-[#151517]">VS Dark (Default)</option>
                        <option value="light" className="bg-[#151517]">Light</option>
                        <option value="dracula" className="bg-[#151517]">Dracula</option>
                        <option value="catppuccin-mocha" className="bg-[#151517]">Catppuccin Mocha</option>
                    </select>
                </div>

                {/* Vim Mode */}
                <div className="flex items-center justify-between w-full">
                     <div className="flex items-center gap-2 text-zinc-400 text-xs">
                        <Command className="w-3 h-3" />
                        <span>Vim Mode</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.vimMode}
                            onChange={(e) => setSettings(s => ({ ...s, vimMode: e.target.checked }))}
                            className="sr-only peer" 
                        />
                         <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary transition-colors"></div>
                    </label>
                </div>
            </div>
        )}
      </div>

      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="html"
          theme={settings.theme}
          value={code}
          onChange={onCodeChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: settings.fontSize,
            padding: { top: 16 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            autoClosingBrackets: "always",
            autoClosingOvertype: "always",
          }}
        />
        
        {/* Vim Status Bar Container */}
        {settings.vimMode && (
             <div 
                ref={statusNodeRef} 
                className="vim-status-bar absolute bottom-0 left-0 right-0 bg-[#007acc] text-white font-mono text-xs z-10 p-1"
                style={{ minHeight: '1.5em' }}
            />
        )}
      </div>
    </div>
  );
}
