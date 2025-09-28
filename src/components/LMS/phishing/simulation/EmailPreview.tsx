import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, Mail, FileInput } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PhishingTemplate } from '../types';

interface EmailPreviewProps {
  template: Partial<PhishingTemplate>;
  onImportHTML?: () => void;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  template,
  onImportHTML
}) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Email Preview</Label>
          <Button variant="outline" size="sm" className="text-xs h-7 px-2">
            <Eye className="h-3 w-3 mr-1" />
            Preview in New Window
          </Button>
        </div>
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-gray-100 p-2 text-sm border-b">
            <div className="flex justify-between mb-1">
              <div><span className="font-medium">From:</span> Security Team &lt;security@company.com&gt;</div>
            </div>
            <div className="mb-1"><span className="font-medium">To:</span> recipient@company.com</div>
            <div className="mb-1"><span className="font-medium">Subject:</span> {template.subject || 'No Subject'}</div>
          </div>
          <div className="bg-white p-4 max-h-[400px] overflow-y-auto">
            {template.content ? (
              <div className="email-preview">
                {template.content.split('\n').map((line, i) => {
                  // Check if this line contains any of our tracking link texts
                  const matchingLink = (template.trackingLinks || []).find(
                    link => line.includes(link.displayText)
                  );
                  
                  if (matchingLink) {
                    const parts = line.split(matchingLink.displayText);
                    return (
                      <p key={i} className="mb-2">
                        {parts[0]}
                        <a 
                          href="#" 
                          className="text-blue-600 underline font-medium"
                          onClick={(e) => e.preventDefault()}
                        >
                          {matchingLink.displayText}
                        </a>
                        {parts[1]}
                      </p>
                    );
                  }
                  
                  return <p key={i} className="mb-2">{line}</p>;
                })}
                
                {/* Render QR codes if any */}
                {(template.qrCodes || []).length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-gray-700 mb-2">Scan the QR code below:</p>
                    <div className="flex flex-wrap gap-4">
                      {(template.qrCodes || []).map((qrCode, i) => (
                        <div key={i} className="text-center">
                          <div className="bg-white inline-block p-2 rounded-md shadow-sm border">
                            <QRCodeSVG value={qrCode.url} size={100} />
                          </div>
                          <p className="text-sm mt-1">{qrCode.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 border border-dashed rounded-lg">
                <Mail className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>This template does not have any content yet.</p>
                <p className="text-sm mt-1">Add content to see the preview here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {onImportHTML && (
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={onImportHTML}>
              <FileInput className="h-4 w-4 mr-2" />
              Import HTML
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};