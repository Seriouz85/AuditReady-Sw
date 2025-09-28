import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PhishingTemplate } from '../types';

interface TemplateFormProps {
  template: Partial<PhishingTemplate>;
  onTemplateChange: (template: Partial<PhishingTemplate>) => void;
  onAddTrackingLink: () => void;
  onRemoveTrackingLink: (index: number) => void;
  onAddQRCode: () => void;
  onRemoveQRCode: (index: number) => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  onTemplateChange,
  onAddTrackingLink,
  onRemoveTrackingLink,
  onAddQRCode,
  onRemoveQRCode
}) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="templateName">Template Name</Label>
        <Input 
          id="templateName" 
          placeholder="Enter template name" 
          className="mt-1 rounded-xl"
          value={template.name || ''}
          onChange={(e) => onTemplateChange({...template, name: e.target.value})}
        />
      </div>
      
      <div>
        <Label htmlFor="templateSubject">Email Subject</Label>
        <Input 
          id="templateSubject" 
          placeholder="Enter email subject line" 
          className="mt-1 rounded-xl"
          value={template.subject || ''}
          onChange={(e) => onTemplateChange({...template, subject: e.target.value})}
        />
      </div>
      
      <div>
        <Label htmlFor="templateContent">Email Content</Label>
        <Textarea 
          id="templateContent" 
          placeholder="Enter the main content of your email" 
          className="mt-1 min-h-[120px] rounded-xl"
          value={template.content || ''}
          onChange={(e) => onTemplateChange({...template, content: e.target.value})}
        />
      </div>
      
      <div>
        <Label className="flex justify-between items-center">
          <span>Tracking Links</span>
          <Button variant="outline" size="sm" onClick={onAddTrackingLink}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Link
          </Button>
        </Label>
        <div className="space-y-3 mt-2">
          {(template.trackingLinks || []).map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input 
                placeholder="Display Text" 
                className="flex-1 rounded-l-xl rounded-r-none"
                value={link.displayText}
                onChange={(e) => {
                  const updatedLinks = [...(template.trackingLinks || [])];
                  updatedLinks[index] = {...link, displayText: e.target.value};
                  onTemplateChange({...template, trackingLinks: updatedLinks});
                }}
              />
              <Input 
                placeholder="URL" 
                className="flex-1"
                value={link.url}
                onChange={(e) => {
                  const updatedLinks = [...(template.trackingLinks || [])];
                  updatedLinks[index] = {...link, url: e.target.value};
                  onTemplateChange({...template, trackingLinks: updatedLinks});
                }}
              />
              <Button variant="ghost" size="icon" onClick={() => onRemoveTrackingLink(index)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="flex justify-between items-center">
          <span>QR Codes</span>
          <Button variant="outline" size="sm" onClick={onAddQRCode}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add QR Code
          </Button>
        </Label>
        <div className="space-y-3 mt-2">
          {(template.qrCodes || []).map((qrCode, index) => (
            <div key={index} className="flex items-start gap-3 border p-3 rounded-xl">
              <div className="bg-white p-2 rounded-md">
                <QRCodeSVG value={qrCode.url} size={80} />
              </div>
              <div className="flex-1">
                <Input 
                  placeholder="Description" 
                  className="mb-2 w-full"
                  value={qrCode.description}
                  onChange={(e) => {
                    const updatedQRCodes = [...(template.qrCodes || [])];
                    updatedQRCodes[index] = {...qrCode, description: e.target.value};
                    onTemplateChange({...template, qrCodes: updatedQRCodes});
                  }}
                />
                <Input 
                  placeholder="URL" 
                  className="w-full"
                  value={qrCode.url}
                  onChange={(e) => {
                    const updatedQRCodes = [...(template.qrCodes || [])];
                    updatedQRCodes[index] = {...qrCode, url: e.target.value};
                    onTemplateChange({...template, qrCodes: updatedQRCodes});
                  }}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => onRemoveQRCode(index)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="templateDifficulty">Difficulty Level</Label>
          <Select 
            value={template.difficultyLevel || 'Medium'}
            onValueChange={(value) => onTemplateChange({...template, difficultyLevel: value})}
          >
            <SelectTrigger id="templateDifficulty" className="mt-1 rounded-xl">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="templateCategory">Category</Label>
          <Select 
            value={template.category || 'General'}
            onValueChange={(value) => onTemplateChange({...template, category: value})}
          >
            <SelectTrigger id="templateCategory" className="mt-1 rounded-xl">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Account Security">Account Security</SelectItem>
              <SelectItem value="IT Security">IT Security</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Executive">Executive</SelectItem>
              <SelectItem value="Document Sharing">Document Sharing</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};