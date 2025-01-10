import React, { useEffect, useState, useCallback } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { Save } from "lucide-react";

const STORAGE_KEY = "draft-js-content";

function App() {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      try {
        const content = convertFromRaw(JSON.parse(savedContent));
        return EditorState.createWithContent(content);
      } catch (e) {
        console.error("Failed to load saved content:", e);
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });

  const [title, setTitle] = useState(() => {
    return localStorage.getItem("editor-title") || "";
  });

  useEffect(() => {
    localStorage.setItem("editor-title", title);
  }, [title]);

  const handleBeforeInput = useCallback((chars, editorState) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const block = content.getBlockForKey(selection.getStartKey());
    const text = block.getText();

    if (chars === " " && selection.getStartOffset() === text.length) {
      switch (text) {
        case "#":
          setEditorState(applyBlockStyle(editorState, "header-one"));
          return "handled";
        case "##":
          setEditorState(applyBlockStyle(editorState, "header-two"));
          return "handled";
        case "###":
          setEditorState(applyBlockStyle(editorState, "header-three"));
          return "handled";
        case "*":
          setEditorState(applyInlineStyle(editorState, "BOLD", 1));
          return "handled";
        case "**":
          setEditorState(applyInlineStyle(editorState, "RED", 2));
          return "handled";
        case "***":
          setEditorState(applyInlineStyle(editorState, "UNDERLINE", 3));
          return "handled";
        case "!":
          setEditorState(removeAllStyles(editorState));
          return "handled";
        default:
          break;
      }
    }
    return "not-handled";
  }, []);

  const applyInlineStyle = useCallback((editorState, style, chars) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();

    const newContent = Modifier.replaceText(
      content,
      selection.merge({
        anchorOffset: 0,
        focusOffset: chars,
      }),
      ""
    );

    const newState = EditorState.push(editorState, newContent, "remove-range");

    return RichUtils.toggleInlineStyle(newState, style);
  }, []);

  const applyBlockStyle = useCallback((editorState, blockType) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();

    const newContent = Modifier.replaceText(
      content,
      selection.merge({
        anchorOffset: 0,
        focusOffset: selection.getFocusOffset(),
      }),
      ""
    );

    const newState = EditorState.push(editorState, newContent, "remove-range");

    return RichUtils.toggleBlockType(newState, blockType);
  }, []);

  const removeAllStyles = useCallback((editorState) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const currentStyle = editorState.getCurrentInlineStyle();

    const newContent = Modifier.replaceText(
      content,
      selection.merge({
        anchorOffset: 0,
        focusOffset: 1,
      }),
      ""
    );

    let newState = EditorState.push(editorState, newContent, "remove-range");

    currentStyle.forEach((style) => {
      newState = RichUtils.toggleInlineStyle(newState, style);
    });

    return newState;
  }, []);

  const handleKeyCommand = useCallback((command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  }, []);

  const handleSave = useCallback(() => {
    const content = editorState.getCurrentContent();
    const raw = convertToRaw(content);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
  }, [editorState]);

  const styleMap = {
    RED: {
      color: "red",
    },
    UNDERLINE: {
      textDecoration: "underline",
    },
  };

  const blockStyleFn = (block) => {
    const type = block.getType();
    switch (type) {
      case "header-one":
        return "header-one";
      case "header-two":
        return "header-two";
      case "header-three":
        return "header-three";
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header Section */}

      <div style={{ width: "80%",marginBottom: "20px" }}>
        <div className="row offset-5 justify-content-between align-items-center">
          <div className="col-md-8">
            <h1 className="">Demo editor by Kiran Dhoke</h1>
          </div>
          <div className="col-md-1">
            <button onClick={handleSave} className="save-button">
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Title Input
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title..."
          className="editor-title-input"
        /> */}
      <div className="editor-container">
        {/* Editor */}
        <div className="editor-textarea">
          <Editor
            editorState={editorState}
            onChange={setEditorState}
            handleBeforeInput={handleBeforeInput}
            handleKeyCommand={handleKeyCommand}
            customStyleMap={styleMap}
            blockStyleFn={blockStyleFn}
            placeholder="Start typing... Use # for headers, * for bold, ** for red text, *** for underline, and ! to remove styles"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
