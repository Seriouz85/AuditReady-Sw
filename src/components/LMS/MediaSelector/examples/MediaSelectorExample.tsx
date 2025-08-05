import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Video, Plus } from 'lucide-react';
import { MediaSelector } from '../MediaSelector';
import { MediaItem } from '../types';

export const MediaSelectorExample: React.FC = () => {
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [selectorConfig, setSelectorConfig] = useState({
    allowMultiple: false,
    allowedTypes: ['image'] as ('image' | 'video' | 'document' | 'audio')[],
    maxSelections: 1
  });

  const handleMediaSelect = (media: MediaItem | MediaItem[]) => {
    if (Array.isArray(media)) {
      setSelectedMedia(media);
    } else {
      setSelectedMedia([media]);
    }
    console.log('Selected media:', media);
  };

  const openMediaSelector = (config: typeof selectorConfig) => {
    setSelectorConfig(config);
    setIsMediaSelectorOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Media Selector Integration Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single Image Selection */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Course Thumbnail Selection</h3>
            <p className="text-sm text-gray-600 mb-3">Select a single image for your course thumbnail</p>
            <Button 
              onClick={() => openMediaSelector({
                allowMultiple: false,
                allowedTypes: ['image'],
                maxSelections: 1
              })}
              className="w-full"
            >
              <Image className="h-4 w-4 mr-2" />
              Select Course Thumbnail
            </Button>
          </div>

          {/* Multiple Media Selection */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Lesson Media Gallery</h3>
            <p className="text-sm text-gray-600 mb-3">Select multiple images and videos for your lesson</p>
            <Button 
              onClick={() => openMediaSelector({
                allowMultiple: true,
                allowedTypes: ['image', 'video'],
                maxSelections: 5
              })}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Media to Lesson ({selectedMedia.length}/5)
            </Button>
          </div>

          {/* Video Only Selection */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Training Video Selection</h3>
            <p className="text-sm text-gray-600 mb-3">Select a training video for this module</p>
            <Button 
              onClick={() => openMediaSelector({
                allowMultiple: false,
                allowedTypes: ['video'],
                maxSelections: 1
              })}
              className="w-full"
              variant="secondary"
            >
              <Video className="h-4 w-4 mr-2" />
              Select Training Video
            </Button>
          </div>

          {/* Selected Media Display */}
          {selectedMedia.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-3">Selected Media ({selectedMedia.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedMedia.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                      {item.type === 'image' ? (
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.type} • {item.format}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedMedia([])}
                className="mt-3"
              >
                Clear Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Code</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { MediaSelector } from '@/components/LMS/MediaSelector/MediaSelector';
import { MediaItem } from '@/components/LMS/MediaSelector/types';

// In your component:
const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

const handleMediaSelect = (media: MediaItem | MediaItem[]) => {
  console.log('Selected media:', media);
  // Handle the selected media
};

// In your JSX:
<MediaSelector
  isOpen={isMediaSelectorOpen}
  onClose={() => setIsMediaSelectorOpen(false)}
  onSelect={handleMediaSelect}
  allowMultiple={true}
  allowedTypes={['image', 'video']}
  maxSelections={5}
  title="Select Media for Course"
/>`}
          </pre>
        </CardContent>
      </Card>

      {/* MediaSelector Component */}
      <MediaSelector
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={handleMediaSelect}
        allowMultiple={selectorConfig.allowMultiple}
        allowedTypes={selectorConfig.allowedTypes}
        maxSelections={selectorConfig.maxSelections}
        title="Select Media"
      />
    </div>
  );
};