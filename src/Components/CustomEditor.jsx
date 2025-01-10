import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";

const CustomEditor = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  useEffect(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  const handleEditorChange = (state) => {
    setEditorState(state);
  };

  const handleBeforeInput = (chars, editorState) => {
    const currentContent = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const startKey = selectionState.getStartKey();
    const block = currentContent.getBlockForKey(startKey);
    const text = block.getText();

    if (chars === " ") {
      if (text.startsWith("#")) {
        return applyBlockStyle(editorState, "header-one", text.substring(1));
      } else if (text.startsWith("*")) {
        return applyInlineStyle(editorState, "BOLD", text.substring(1));
      } else if (text.startsWith("**")) {
        return applyInlineStyle(editorState, "RED", text.substring(2));
      } else if (text.startsWith("***")) {
        return applyInlineStyle(editorState, "UNDERLINE", text.substring(3));
      }
    }

    return false;
  };

  const applyBlockStyle = (editorState, blockType, newText) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const newContent = Modifier.replaceText(
      contentState,
      selectionState,
      newText
    );
    const newState = EditorState.push(
      editorState,
      newContent,
      "insert-characters"
    );
    return RichUtils.toggleBlockType(newState, blockType);
  };

  const applyInlineStyle = (editorState, style, newText) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const newContent = Modifier.replaceText(
      contentState,
      selectionState,
      newText
    );
    const newState = EditorState.push(
      editorState,
      newContent,
      "insert-characters"
    );
    return RichUtils.toggleInlineStyle(newState, style);
  };

  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    localStorage.setItem("editorContent", JSON.stringify(rawContent));
    alert("Content saved!");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Demo Editor</h1>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "200px",
        }}
      >
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          handleBeforeInput={handleBeforeInput}
        />
      </div>
      <button onClick={saveContent} style={{ marginTop: "20px" }}>
        Save
      </button>
    </div>
  );
};

export default CustomEditor;

