import React, { useRef, useEffect, useState } from 'react';
import { Button, Space, Divider } from 'antd';
import { Bold, Italic, Underline, Type } from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Enter description...' }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      // Only update if content is different to avoid cursor jumping
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleInput = () => {
      const html = editor.innerHTML;
      onChange(html);
    };

    const handleSelectionChange = () => {
      if (document.activeElement === editor) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const commonAncestor = range.commonAncestorContainer;
          
          // Check active formats
          let bold = false;
          let italic = false;
          let underline = false;

          let node = commonAncestor.nodeType === Node.TEXT_NODE 
            ? commonAncestor.parentElement 
            : commonAncestor;

          while (node && node !== editor) {
            const tagName = node.tagName?.toLowerCase();
            const style = window.getComputedStyle(node);
            
            if (tagName === 'b' || tagName === 'strong' || style.fontWeight >= 600) {
              bold = true;
            }
            if (tagName === 'i' || tagName === 'em' || style.fontStyle === 'italic') {
              italic = true;
            }
            if (tagName === 'u' || style.textDecoration.includes('underline')) {
              underline = true;
            }
            
            node = node.parentElement;
          }

          setActiveFormats({ bold, italic, underline });
        }
      }
    };

    editor.addEventListener('input', handleInput);
    document.addEventListener('selectionchange', handleSelectionChange);
    editor.addEventListener('focus', () => setIsFocused(true));
    editor.addEventListener('blur', () => setIsFocused(false));

    return () => {
      editor.removeEventListener('input', handleInput);
      document.removeEventListener('selectionchange', handleSelectionChange);
      editor.removeEventListener('focus', () => setIsFocused(true));
      editor.removeEventListener('blur', () => setIsFocused(false));
    };
  }, [onChange]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    
    // Trigger input event manually
    const event = new Event('input', { bubbles: true });
    editorRef.current?.dispatchEvent(event);
  };

  const toggleBold = () => {
    execCommand('bold');
  };

  const toggleItalic = () => {
    execCommand('italic');
  };

  const toggleUnderline = () => {
    execCommand('underline');
  };

  const setSmallText = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const selectedText = range.extractContents();
      const span = document.createElement('span');
      span.className = 'text-sm';
      span.appendChild(selectedText);
      range.insertNode(span);
      selection.removeAllRanges();
      selection.addRange(range);
      editorRef.current?.focus();
      
      const event = new Event('input', { bubbles: true });
      editorRef.current?.dispatchEvent(event);
    }
  };

  const setUppercase = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      const uppercaseText = selectedText.toUpperCase();
      
      range.deleteContents();
      range.insertNode(document.createTextNode(uppercaseText));
      
      // Move cursor to end of inserted text
      range.setStartAfter(range.endContainer);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      editorRef.current?.focus();
      
      const event = new Event('input', { bubbles: true });
      editorRef.current?.dispatchEvent(event);
    }
  };

  const isEmpty = !editorRef.current?.textContent?.trim();

  return (
    <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <Space size="small" split={<Divider type="vertical" />}>
          <Button
            type={activeFormats.bold ? 'primary' : 'text'}
            icon={<Bold className="w-4 h-4" />}
            onClick={toggleBold}
            title="Bold"
            size="small"
          />
          <Button
            type={activeFormats.italic ? 'primary' : 'text'}
            icon={<Italic className="w-4 h-4" />}
            onClick={toggleItalic}
            title="Italic"
            size="small"
          />
          <Button
            type={activeFormats.underline ? 'primary' : 'text'}
            icon={<Underline className="w-4 h-4" />}
            onClick={toggleUnderline}
            title="Underline"
            size="small"
          />
          <Button
            type="text"
            icon={<Type className="w-4 h-4" />}
            onClick={setSmallText}
            title="Small Text"
            size="small"
          />
          <Button
            type="text"
            onClick={setUppercase}
            title="Uppercase"
            size="small"
          >
            <span className="text-xs font-semibold">AA</span>
          </Button>
        </Space>
      </div>

      {/* Editor Content */}
      <div className="bg-white rounded-b-lg min-h-[150px] relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[150px] px-3 py-2 text-gray-900 outline-none focus:outline-none"
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
          data-placeholder={placeholder}
        />
        {isEmpty && !isFocused && (
          <div className="absolute top-2 left-3 pointer-events-none text-gray-400 text-sm">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
