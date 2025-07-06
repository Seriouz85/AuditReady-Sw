import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Type,
  Palette,
  Save,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RichTextEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

const fontSizes = [
  { label: 'Small', value: '14px', class: 'text-sm' },
  { label: 'Normal', value: '16px', class: 'text-base' },
  { label: 'Large', value: '18px', class: 'text-lg' },
  { label: 'Extra Large', value: '24px', class: 'text-xl' },
  { label: 'Heading', value: '32px', class: 'text-2xl' }
];

const textColors = [
  { label: 'Black', value: '#000000', class: 'text-black' },
  { label: 'Gray', value: '#6B7280', class: 'text-gray-500' },
  { label: 'Blue', value: '#3B82F6', class: 'text-blue-500' },
  { label: 'Green', value: '#10B981', class: 'text-green-500' },
  { label: 'Red', value: '#EF4444', class: 'text-red-500' },
  { label: 'Purple', value: '#8B5CF6', class: 'text-purple-500' },
  { label: 'Orange', value: '#F59E0B', class: 'text-orange-500' }
];

const fonts = [
  { label: 'Sans Serif', value: 'system-ui, sans-serif', class: 'font-sans' },
  { label: 'Serif', value: 'Georgia, serif', class: 'font-serif' },
  { label: 'Monospace', value: 'Consolas, monospace', class: 'font-mono' }
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent,
  onSave,
  onCancel,
  placeholder = "Enter your content..."
}) => {
  const [content, setContent] = useState(initialContent);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSave = () => {
    const htmlContent = editorRef.current?.innerHTML || '';
    onSave(htmlContent);
  };

  const isCommandActive = (command: string): boolean => {
    return document.queryCommandState(command);
  };

  return (
    <Card className="w-full border border-gray-200 shadow-lg">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-3 border-b bg-gray-50 flex-wrap">
        {/* Font Size */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">
              <Type className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {fontSizes.map((size) => (
              <DropdownMenuItem 
                key={size.value}
                onClick={() => executeCommand('fontSize', '3')}
                className={size.class}
              >
                {size.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Font Family */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">
              Aa
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {fonts.map((font) => (
              <DropdownMenuItem 
                key={font.value}
                onClick={() => executeCommand('fontName', font.value)}
                className={font.class}
              >
                {font.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Formatting */}
        <Button
          variant={isCommandActive('bold') ? 'default' : 'ghost'}
          size="sm"
          className="h-8"
          onClick={() => executeCommand('bold')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={isCommandActive('italic') ? 'default' : 'ghost'}
          size="sm"
          className="h-8"
          onClick={() => executeCommand('italic')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={isCommandActive('underline') ? 'default' : 'ghost'}
          size="sm"
          className="h-8"
          onClick={() => executeCommand('underline')}
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Color */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">
              <Palette className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="grid grid-cols-3 gap-1 p-2">
              {textColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => executeCommand('foreColor', color.value)}
                  className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <Button
          variant={isCommandActive('justifyLeft') ? 'default' : 'ghost'}
          size="sm"
          className="h-8"
          onClick={() => executeCommand('justifyLeft')}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={isCommandActive('justifyCenter') ? 'default' : 'ghost'}
          size="sm"
          className="h-8"
          onClick={() => executeCommand('justifyCenter')}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={isCommandActive('justifyRight') ? 'default' : 'ghost'}
          size="sm"
          className="h-8"
          onClick={() => executeCommand('justifyRight')}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          variant={isCommandActive('insertUnorderedList') ? 'default' : 'ghost'}
          size="sm"
          className="h-8"
          onClick={() => executeCommand('insertUnorderedList')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={isCommandActive('insertOrderedList') ? 'default' : 'ghost'}
          size="sm"
          className="h-8"
          onClick={() => executeCommand('insertOrderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        {/* Quote */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => executeCommand('formatBlock', 'blockquote')}
        >
          <Quote className="h-4 w-4" />
        </Button>

        {/* Actions */}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          style={{ 
            lineHeight: '1.6',
            fontSize: '16px',
            fontFamily: 'system-ui, sans-serif'
          }}
          placeholder={placeholder}
          onInput={(e) => {
            const target = e.target as HTMLDivElement;
            setContent(target.innerHTML);
          }}
        />
      </div>
    </Card>
  );
};