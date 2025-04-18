'use client'; // Monaco Editor needs to run client-side

import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnChange, OnMount } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api'; // Import Monaco editor types

interface CodeEditorProps {
  initialCode: string;
  language?: string; // Default to solidity
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  height?: string; // e.g., "400px"
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode,
  language = 'solidity',
  onChange,
  readOnly = false,
  height = '400px',
}) => {
  const [code, setCode] = useState(initialCode);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null); // Use imported monaco namespace

  // Update internal state if initialCode prop changes (e.g., navigating challenges)
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleEditorChange: OnChange = (value) => {
    setCode(value || '');
    if (onChange) {
      onChange(value);
    }
  };

  // Use imported monaco namespace for types
  const handleEditorDidMount: OnMount = (editor: monaco.editor.IStandaloneCodeEditor, _monacoInstance: typeof monaco) => {
    editorRef.current = editor;
    // You can add custom editor configurations or actions here if needed
    // For example, register Solidity language specifics if not built-in
    // monaco.languages.register({ id: 'solidity' });
    // monaco.languages.setMonarchTokensProvider('solidity', { ... });
    console.log('Monaco Editor Mounted');
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark" // Using vs-dark theme, works well with dark mode generally
        options={{
          readOnly: readOnly,
          minimap: { enabled: false }, // Optional: disable minimap
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true, // Adjusts editor layout on container resize
        }}
      />
    </div>
  );
};

export default CodeEditor;
