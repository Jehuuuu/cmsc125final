import React, { createContext, useState } from 'react';

// Create a context for sharing the editor instance
export const EditorContext = createContext();

export function EditorProvider({ children }) {
  const [editor, setEditor] = useState(null);

  return (
    <EditorContext.Provider value={{ editor, setEditor }}>
      {children}
    </EditorContext.Provider>
  );
} 