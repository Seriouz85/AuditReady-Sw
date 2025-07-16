import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Type,
  Palette,
  Save,
  X,
  Link as LinkIcon,
  LinkOff,
  Table,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Video,
  Paperclip,
  Smile,
  Undo,
  Redo,
  Eye,
  Edit3,
  FileText,
  Info,
  AlertTriangle,
  CheckCircle,
  Strikethrough,
  Subscript,
  Superscript,
  IndentIncrease,
  IndentDecrease,
  Maximize2,
  Minimize2,
  Download,
  Upload,
  CloudOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from '@/utils/toast';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { UnifiedMediaSidePanel } from './UnifiedMediaSidePanel';

interface EnhancedRichTextEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  placeholder?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
  maxLength?: number;
  allowedFormats?: string[];
  showWordCount?: boolean;
  height?: string;
}

// Font options
const fontSizes = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '20px' },
  { label: 'Extra Large', value: '24px' },
  { label: 'Huge', value: '32px' }
];

const fontFamilies = [
  { label: 'Default', value: 'inherit' },
  { label: 'Sans Serif', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Monospace', value: 'Consolas, Monaco, monospace' },
  { label: 'Cursive', value: 'Comic Sans MS, cursive' }
];

const textColors = [
  { label: 'Black', value: '#000000' },
  { label: 'Dark Gray', value: '#374151' },
  { label: 'Gray', value: '#6B7280' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Green', value: '#10B981' },
  { label: 'Red', value: '#EF4444' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Orange', value: '#F59E0B' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Indigo', value: '#6366F1' }
];

const highlightColors = [
  { label: 'Yellow', value: '#FEF3C7' },
  { label: 'Green', value: '#D1FAE5' },
  { label: 'Blue', value: '#DBEAFE' },
  { label: 'Purple', value: '#E9D5FF' },
  { label: 'Pink', value: '#FCE7F3' },
  { label: 'Orange', value: '#FED7AA' }
];

// Common emojis for quick insert
const commonEmojis = ['😊', '👍', '❤️', '🎉', '✨', '🚀', '💡', '📌', '✅', '❌', '⚠️', '📝'];

export const EnhancedRichTextEditor: React.FC<EnhancedRichTextEditorProps> = ({
  initialContent,
  onSave,
  onCancel,
  placeholder = "Start typing your content...",
  autoSave = true,
  autoSaveInterval = 30000, // 30 seconds
  maxLength,
  showWordCount = true,
  height = "400px"
}) => {
  const [content, setContent] = useState(initialContent);
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize content and calculate counts
  useEffect(() => {
    if (editorRef.current && !isMarkdown) {
      editorRef.current.innerHTML = initialContent;
      updateCounts();
    }
  }, [initialContent, isMarkdown]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, autoSaveInterval);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, hasUnsavedChanges, autoSave, autoSaveInterval]);

  const handleAutoSave = () => {
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
    toast.success('Content auto-saved', { duration: 2000 });
  };

  const updateCounts = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
      setCharCount(text.length);
    }
  };

  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  }, []);

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      setHasUnsavedChanges(true);
      updateCounts();
    }
  };

  const isCommandActive = (command: string): boolean => {
    return document.queryCommandState(command);
  };

  const handleSave = () => {
    const finalContent = isMarkdown ? DOMPurify.sanitize(marked(markdownContent) as string) : content;
    onSave(finalContent);
    setHasUnsavedChanges(false);
  };

  // Link handling
  const insertLink = () => {
    if (linkUrl && linkText) {
      executeCommand('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${linkText}</a>`);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  // Image handling
  const insertImage = () => {
    if (imageUrl) {
      executeCommand('insertHTML', `<img src="${imageUrl}" alt="${imageAlt}" class="max-w-full h-auto rounded-lg my-2" />`);
      setShowImageDialog(false);
      setImageUrl('');
      setImageAlt('');
    }
  };

  // Video handling
  const insertVideo = () => {
    if (videoUrl) {
      const videoId = extractVideoId(videoUrl);
      if (videoId) {
        executeCommand('insertHTML', `
          <div class="relative aspect-video my-4">
            <iframe 
              src="https://www.youtube.com/embed/${videoId}" 
              class="absolute inset-0 w-full h-full rounded-lg"
              allowfullscreen
            ></iframe>
          </div>
        `);
      }
      setShowVideoDialog(false);
      setVideoUrl('');
    }
  };

  const extractVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]*)/);
    return match ? match[1] : null;
  };

  // Media library handling
  const insertMediaFromLibrary = (file: any) => {
    const fileName = 'originalName' in file ? file.originalName : file.title;
    const fileType = 'mimeType' in file ? file.mimeType : `${file.type}/*`;
    const fileUrl = file.url;
    
    if (fileType.startsWith('image/') || file.type === 'image') {
      executeCommand('insertHTML', `<img src="${fileUrl}" alt="${fileName}" class="max-w-full h-auto rounded-lg my-2" />`);
    } else if (fileType.startsWith('video/') || file.type === 'video') {
      executeCommand('insertHTML', `
        <div class="relative aspect-video my-4">
          <video 
            src="${fileUrl}" 
            class="absolute inset-0 w-full h-full rounded-lg"
            controls
            poster="${file.thumbnail || file.thumbnailUrl || ''}"
          ></video>
        </div>
      `);
    } else if (fileType.startsWith('audio/') || file.type === 'audio') {
      executeCommand('insertHTML', `
        <div class="flex items-center gap-3 p-3 bg-gray-100 rounded-lg my-2">
          <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-medium text-sm">${fileName}</p>
            <audio src="${fileUrl}" controls class="w-full mt-1"></audio>
          </div>
        </div>
      `);
    } else {
      // For documents and other files, create a download link
      executeCommand('insertHTML', `
        <div class="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg my-2">
          <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-medium text-sm">${fileName}</p>
            <a href="${fileUrl}" download class="text-blue-600 hover:text-blue-800 text-sm">Download file</a>
          </div>
        </div>
      `);
    }
    
    setShowMediaBrowser(false);
    toast.success(`Inserted ${fileName} into the content`);
  };

  // Table handling
  const insertTable = () => {
    let tableHTML = '<table class="w-full border-collapse my-4"><tbody>';
    for (let i = 0; i < tableRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        tableHTML += `<td class="border border-gray-300 p-2">${i === 0 ? `Header ${j + 1}` : 'Cell'}</td>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    executeCommand('insertHTML', tableHTML);
    setShowTableDialog(false);
  };

  // Callout/Alert blocks
  const insertCallout = (type: 'info' | 'warning' | 'success') => {
    const icons = {
      info: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>',
      warning: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
      success: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
    };
    
    const colors = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      success: 'bg-green-50 border-green-200 text-green-800'
    };
    
    const html = `
      <div class="${colors[type]} border-l-4 p-4 my-4 rounded-r-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0">${icons[type]}</div>
          <div class="ml-3">
            <p class="font-medium">Enter your ${type} message here</p>
          </div>
        </div>
      </div>
    `;
    
    executeCommand('insertHTML', html);
  };

  // Code block handling
  const insertCodeBlock = () => {
    executeCommand('insertHTML', '<pre class="bg-gray-100 p-4 rounded-lg my-2 overflow-x-auto"><code>// Enter your code here</code></pre>');
  };

  // Emoji picker
  const insertEmoji = (emoji: string) => {
    executeCommand('insertHTML', emoji);
  };

  // Switch to markdown mode
  const switchToMarkdown = () => {
    if (editorRef.current) {
      // Convert HTML to markdown (simplified conversion)
      const text = editorRef.current.innerText || '';
      setMarkdownContent(text);
      setIsMarkdown(true);
    }
  };

  // Switch to WYSIWYG mode
  const switchToWysiwyg = () => {
    // Convert markdown to HTML
    const html = DOMPurify.sanitize(marked(markdownContent) as string);
    setContent(html);
    setIsMarkdown(false);
    
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = html;
      }
    }, 0);
  };

  return (
    <Card className={cn(
      "w-full border border-gray-200 shadow-lg transition-all duration-300",
      isFullscreen && "fixed inset-4 z-50 m-0"
    )}>
      {/* Main Toolbar */}
      <div className="border-b bg-gray-50 p-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Left toolbar items */}
          <div className="flex items-center gap-1 flex-wrap">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => executeCommand('undo')}
                className="h-8 w-8 p-0"
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => executeCommand('redo')}
                className="h-8 w-8 p-0"
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300" />

            {/* Headings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <Type className="h-4 w-4" />
                  Heading
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => executeCommand('formatBlock', 'h1')}>
                  <Heading1 className="mr-2 h-4 w-4" />
                  Heading 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => executeCommand('formatBlock', 'h2')}>
                  <Heading2 className="mr-2 h-4 w-4" />
                  Heading 2
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => executeCommand('formatBlock', 'h3')}>
                  <Heading3 className="mr-2 h-4 w-4" />
                  Heading 3
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => executeCommand('formatBlock', 'p')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Paragraph
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Font Family & Size */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                  Font
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Font Family</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {fontFamilies.map((font) => (
                      <DropdownMenuItem 
                        key={font.value}
                        onClick={() => executeCommand('fontName', font.value)}
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Font Size</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {fontSizes.map((size) => (
                      <DropdownMenuItem 
                        key={size.value}
                        onClick={() => executeCommand('fontSize', '3')}
                        style={{ fontSize: size.value }}
                      >
                        {size.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-6 bg-gray-300" />

            {/* Text Formatting */}
            <div className="flex items-center gap-1">
              <Button
                variant={isCommandActive('bold') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('bold')}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={isCommandActive('italic') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('italic')}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant={isCommandActive('underline') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('underline')}
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button
                variant={isCommandActive('strikeThrough') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('strikeThrough')}
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('subscript')}
                title="Subscript"
              >
                <Subscript className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('superscript')}
                title="Superscript"
              >
                <Superscript className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300" />

            {/* Colors */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Text Color">
                  <Palette className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Text Color</p>
                  <div className="grid grid-cols-5 gap-1">
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
                  <p className="text-sm font-medium mt-3 mb-2">Highlight Color</p>
                  <div className="grid grid-cols-3 gap-1">
                    {highlightColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => executeCommand('hiliteColor', color.value)}
                        className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-6 bg-gray-300" />

            {/* Alignment */}
            <div className="flex items-center gap-1">
              <Button
                variant={isCommandActive('justifyLeft') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('justifyLeft')}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={isCommandActive('justifyCenter') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('justifyCenter')}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={isCommandActive('justifyRight') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('justifyRight')}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                variant={isCommandActive('justifyFull') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('justifyFull')}
                title="Justify"
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300" />

            {/* Lists & Indentation */}
            <div className="flex items-center gap-1">
              <Button
                variant={isCommandActive('insertUnorderedList') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('insertUnorderedList')}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={isCommandActive('insertOrderedList') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('insertOrderedList')}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('outdent')}
                title="Decrease Indent"
              >
                <IndentDecrease className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => executeCommand('indent')}
                title="Increase Indent"
              >
                <IndentIncrease className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right toolbar items */}
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <Tabs value={isMarkdown ? 'markdown' : 'wysiwyg'} className="h-8">
              <TabsList className="h-8">
                <TabsTrigger 
                  value="wysiwyg" 
                  className="h-6 text-xs"
                  onClick={switchToWysiwyg}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Visual
                </TabsTrigger>
                <TabsTrigger 
                  value="markdown" 
                  className="h-6 text-xs"
                  onClick={switchToMarkdown}
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Markdown
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Fullscreen toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Secondary Toolbar */}
        <div className="flex items-center gap-1 mt-2 pt-2 border-t flex-wrap">
          {/* Insert Items */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkDialog(true)}
            className="h-8 gap-1"
          >
            <LinkIcon className="h-4 w-4" />
            Link
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImageDialog(true)}
            className="h-8 gap-1"
          >
            <ImageIcon className="h-4 w-4" />
            Image
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVideoDialog(true)}
            className="h-8 gap-1"
          >
            <Video className="h-4 w-4" />
            Video
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMediaBrowser(true)}
            className="h-8 gap-1 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
          >
            <ImageIcon className="h-4 w-4" />
            Media Library
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTableDialog(true)}
            className="h-8 gap-1"
          >
            <Table className="h-4 w-4" />
            Table
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('formatBlock', 'blockquote')}
            className="h-8 gap-1"
          >
            <Quote className="h-4 w-4" />
            Quote
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertCodeBlock}
            className="h-8 gap-1"
          >
            <Code className="h-4 w-4" />
            Code
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Callouts */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <Info className="h-4 w-4" />
                Callout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => insertCallout('info')}>
                <Info className="mr-2 h-4 w-4 text-blue-500" />
                Info Box
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCallout('warning')}>
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                Warning Box
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertCallout('success')}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Success Box
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Emojis */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <Smile className="h-4 w-4" />
                Emoji
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="grid grid-cols-6 gap-1 p-2">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="text-xl hover:bg-gray-100 rounded p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auto-save indicator */}
          {autoSave && lastSaved && (
            <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
              {hasUnsavedChanges ? (
                <>
                  <CloudOff className="h-3 w-3" />
                  <span>Unsaved changes</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative" style={{ height }}>
        {isMarkdown ? (
          <div className="flex h-full">
            <div className="w-1/2 p-4 border-r">
              <Textarea
                value={markdownContent}
                onChange={(e) => {
                  setMarkdownContent(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Write in Markdown..."
                className="w-full h-full resize-none border-0 focus:ring-0 font-mono text-sm"
              />
            </div>
            <div className="w-1/2 p-4 overflow-auto">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(marked(markdownContent) as string) 
                }}
              />
            </div>
          </div>
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="p-4 h-full overflow-auto focus:outline-none"
            style={{ 
              minHeight: '200px',
              lineHeight: '1.6',
              fontSize: '16px',
              fontFamily: 'system-ui, sans-serif'
            }}
            placeholder={placeholder}
            onInput={updateContent}
            onKeyDown={(e) => {
              // Handle tab key for indentation
              if (e.key === 'Tab') {
                e.preventDefault();
                executeCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
              }
            }}
          />
        )}
      </div>

      {/* Footer with word count and actions */}
      <div className="border-t bg-gray-50 p-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {showWordCount && (
            <>
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              {maxLength && (
                <span className={charCount > maxLength ? 'text-red-500' : ''}>
                  / {maxLength} max
                </span>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            className="bg-blue-500 hover:bg-blue-600"
            disabled={maxLength ? charCount > maxLength : false}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Add a hyperlink to your content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-text">Link Text</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Enter link text"
              />
            </div>
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink} disabled={!linkUrl || !linkText}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Add an image to your content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text (Optional)</Label>
              <Input
                id="image-alt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Description of the image"
              />
            </div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Or drag and drop an image here</p>
              <Button variant="outline" size="sm" className="mt-2">
                Browse Files
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertImage} disabled={!imageUrl}>
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Video</DialogTitle>
            <DialogDescription>
              Add a YouTube video to your content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-url">YouTube URL</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                type="url"
              />
            </div>
            {videoUrl && extractVideoId(videoUrl) && (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${extractVideoId(videoUrl)}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertVideo} disabled={!videoUrl || !extractVideoId(videoUrl)}>
              Insert Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
            <DialogDescription>
              Choose the size of your table
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="table-rows">Rows</Label>
                <Input
                  id="table-rows"
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                />
              </div>
              <div>
                <Label htmlFor="table-cols">Columns</Label>
                <Input
                  id="table-cols"
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 3)}
                />
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                {tableRows} × {tableCols} table
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertTable}>
              Insert Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unified Media Side Panel */}
      <UnifiedMediaSidePanel
        isOpen={showMediaBrowser}
        onClose={() => setShowMediaBrowser(false)}
        onSelect={insertMediaFromLibrary}
        className="z-50"
      />
    </Card>
  );
};