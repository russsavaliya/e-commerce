import React, { useRef, useEffect, useState } from 'react';
import { Button, Space, Divider, Select, Popover } from 'antd';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link, Code, Type,
  Palette, Eraser
} from 'lucide-react';

const { Option } = Select;

const RichTextEditor = ({ value, onChange, placeholder = 'Enter description...' }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
    orderedList: false,
    unorderedList: false,
  });
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

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
          let strikethrough = false;

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
            if (tagName === 'strike' || tagName === 's' || style.textDecoration.includes('line-through')) {
              strikethrough = true;
            }

            node = node.parentElement;
          }

          setActiveFormats(prev => ({ ...prev, bold, italic, underline, strikethrough }));
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

  const toggleBold = () => execCommand('bold');
  const toggleItalic = () => execCommand('italic');
  const toggleUnderline = () => execCommand('underline');
  const toggleStrikethrough = () => execCommand('strikeThrough');

  const insertBulletList = () => execCommand('insertUnorderedList');
  const insertNumberedList = () => execCommand('insertOrderedList');

  const alignLeft = () => execCommand('justifyLeft');
  const alignCenter = () => execCommand('justifyCenter');
  const alignRight = () => execCommand('justifyRight');
  const alignJustify = () => execCommand('justifyFull');

  const changeFontSize = (size) => {
    execCommand('formatBlock', size);
  };

  const changeFontFamily = (font) => {
    execCommand('fontName', font);
  };

  const changeTextColor = (color) => {
    setTextColor(color);
    execCommand('foreColor', color);
  };

  const changeBackgroundColor = (color) => {
    setBgColor(color);
    execCommand('backColor', color);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertCodeBlock = () => {
    execCommand('formatBlock', 'pre');
  };

  const clearFormatting = () => {
    execCommand('removeFormat');
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

  const setLowercase = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      const lowercaseText = selectedText.toLowerCase();

      range.deleteContents();
      range.insertNode(document.createTextNode(lowercaseText));

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

  // Color picker popover content
  const colorPickerContent = (type) => (
    <div className="p-2">
      <input
        type="color"
        value={type === 'text' ? textColor : bgColor}
        onChange={(e) => type === 'text' ? changeTextColor(e.target.value) : changeBackgroundColor(e.target.value)}
        className="w-full h-8 cursor-pointer"
      />
      <div className="mt-2 grid grid-cols-5 gap-1">
        {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'].map(color => (
          <div
            key={color}
            className="w-6 h-6 rounded cursor-pointer border border-gray-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => type === 'text' ? changeTextColor(color) : changeBackgroundColor(color)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        {/* Font Family */}
        <Select
          defaultValue="Arial"
          size="small"
          style={{ width: 120 }}
          onChange={changeFontFamily}
          placeholder="Font"
        >
          <Option value="Arial">Arial</Option>
          <Option value="Georgia">Georgia</Option>
          <Option value="Times New Roman">Times New Roman</Option>
          <Option value="Courier New">Courier New</Option>
          <Option value="Verdana">Verdana</Option>
          <Option value="Helvetica">Helvetica</Option>
        </Select>

        {/* Font Size */}
        <Select
          defaultValue="p"
          size="small"
          style={{ width: 100 }}
          onChange={changeFontSize}
          placeholder="Size"
        >
          <Option value="h1">Heading 1</Option>
          <Option value="h2">Heading 2</Option>
          <Option value="h3">Heading 3</Option>
          <Option value="h4">Heading 4</Option>
          <Option value="p">Normal</Option>
        </Select>

        <Divider type="vertical" />

        {/* Text Formatting */}
        <Space size="small">
          <Button
            type={activeFormats.bold ? 'primary' : 'text'}
            icon={<Bold className="w-4 h-4" />}
            onClick={toggleBold}
            title="Bold (Ctrl+B)"
            size="small"
          />
          <Button
            type={activeFormats.italic ? 'primary' : 'text'}
            icon={<Italic className="w-4 h-4" />}
            onClick={toggleItalic}
            title="Italic (Ctrl+I)"
            size="small"
          />
          <Button
            type={activeFormats.underline ? 'primary' : 'text'}
            icon={<Underline className="w-4 h-4" />}
            onClick={toggleUnderline}
            title="Underline (Ctrl+U)"
            size="small"
          />
          <Button
            type={activeFormats.strikethrough ? 'primary' : 'text'}
            icon={<Strikethrough className="w-4 h-4" />}
            onClick={toggleStrikethrough}
            title="Strikethrough"
            size="small"
          />
        </Space>

        <Divider type="vertical" />

        {/* Colors */}
        <Space size="small">
          <Popover content={colorPickerContent('text')} title="Text Color" trigger="click">
            <Button
              type="text"
              icon={<Palette className="w-4 h-4" />}
              title="Text Color"
              size="small"
            />
          </Popover>
          <Popover content={colorPickerContent('bg')} title="Background Color" trigger="click">
            <Button
              type="text"
              title="Background Color"
              size="small"
            >
              <div className="flex items-center gap-1">
                <Type className="w-4 h-4" />
                <div className="w-3 h-3 border border-gray-400" style={{ backgroundColor: bgColor }} />
              </div>
            </Button>
          </Popover>
        </Space>

        <Divider type="vertical" />

        {/* Lists */}
        <Space size="small">
          <Button
            type="text"
            icon={<List className="w-4 h-4" />}
            onClick={insertBulletList}
            title="Bullet List"
            size="small"
          />
          <Button
            type="text"
            icon={<ListOrdered className="w-4 h-4" />}
            onClick={insertNumberedList}
            title="Numbered List"
            size="small"
          />
        </Space>

        <Divider type="vertical" />

        {/* Alignment */}
        <Space size="small">
          <Button
            type="text"
            icon={<AlignLeft className="w-4 h-4" />}
            onClick={alignLeft}
            title="Align Left"
            size="small"
          />
          <Button
            type="text"
            icon={<AlignCenter className="w-4 h-4" />}
            onClick={alignCenter}
            title="Align Center"
            size="small"
          />
          <Button
            type="text"
            icon={<AlignRight className="w-4 h-4" />}
            onClick={alignRight}
            title="Align Right"
            size="small"
          />
          <Button
            type="text"
            icon={<AlignJustify className="w-4 h-4" />}
            onClick={alignJustify}
            title="Justify"
            size="small"
          />
        </Space>

        <Divider type="vertical" />

        {/* Additional Options */}
        <Space size="small">
          <Button
            type="text"
            icon={<Link className="w-4 h-4" />}
            onClick={insertLink}
            title="Insert Link"
            size="small"
          />
          <Button
            type="text"
            icon={<Code className="w-4 h-4" />}
            onClick={insertCodeBlock}
            title="Code Block"
            size="small"
          />
          <Button
            type="text"
            icon={<Eraser className="w-4 h-4" />}
            onClick={clearFormatting}
            title="Clear Formatting"
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
          <Button
            type="text"
            onClick={setLowercase}
            title="Lowercase"
            size="small"
          >
            <span className="text-xs font-semibold">aa</span>
          </Button>
        </Space>
      </div>

      {/* Editor Content */}
      <div className="bg-white rounded-b-lg min-h-[200px] relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[200px] px-3 py-2 text-gray-900 outline-none focus:outline-none"
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
