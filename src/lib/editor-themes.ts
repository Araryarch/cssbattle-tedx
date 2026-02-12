export const dracula = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "f8f8f2", background: "282a36" },
    { token: "string.sql", foreground: "f1fa8c" },
    { token: "comment", foreground: "6272a4" },
    { token: "predefined.sql", foreground: "8be9fd" },
    { token: "number", foreground: "bd93f9" },
    { token: "string", foreground: "f1fa8c" },
    { token: "keyword", foreground: "ff79c6" },
    { token: "identifier", foreground: "f8f8f2" },
    { token: "tag", foreground: "ff79c6" },
    { token: "attribute.name", foreground: "50fa7b" },
    { token: "attribute.value", foreground: "f1fa8c" },
    { token: "delimiter", foreground: "f8f8f2" },
    { token: "keyword.css", foreground: "ff79c6" },
    { token: "number.css", foreground: "bd93f9" },
    { token: "attribute.name.css", foreground: "ffb86c" },
    { token: "attribute.value.css", foreground: "8be9fd" },
    { token: "unit.css", foreground: "bd93f9" },
    { token: "variable.css", foreground: "50fa7b" },
    { token: "property.css", foreground: "8be9fd" },
    { token: "tag.css", foreground: "ff79c6" }
  ],
  colors: {
    "editor.background": "#282a36",
    "editor.foreground": "#f8f8f2",
    "editor.lineHighlightBackground": "#44475a",
    "editor.selectionBackground": "#44475a",
    "editorCursor.foreground": "#f8f8f0",
    "editorWhitespace.foreground": "#6272a4",
    "editorIndentGuide.background": "#44475a",
    "editorIndentGuide.activeBackground": "#6272a4"
  }
};

export const catppuccinMocha = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "cdd6f4", background: "1e1e2e" },
    { token: "comment", foreground: "6c7086", fontStyle: "italic" },
    { token: "string", foreground: "a6e3a1" },
    { token: "keyword", foreground: "cba6f7" },
    { token: "number", foreground: "fab387" },
    { token: "regexp", foreground: "f5c2e7" },
    { token: "identifier", foreground: "89b4fa" },
    { token: "tag", foreground: "f38ba8" },
    { token: "tag.css", foreground: "cba6f7" },
    { token: "attribute.name", foreground: "f9e2af" },
    { token: "attribute.name.css", foreground: "f9e2af" },
    { token: "attribute.value", foreground: "a6e3a1" },
    { token: "unit", foreground: "fab387" },
    { token: "string.css", foreground: "a6e3a1" },
    { token: "keyword.css", foreground: "cba6f7" }
  ],
  colors: {
    "editor.background": "#1e1e2e",
    "editor.foreground": "#cdd6f4",
    "editor.lineHighlightBackground": "#313244",
    "editorCursor.foreground": "#f5e0dc",
    "editorWhitespace.foreground": "#45475a",
    "editorIndentGuide.background": "#45475a",
    "editorIndentGuide.activeBackground": "#585b70",
    "editor.selectionBackground": "#45475a"
  }
};
