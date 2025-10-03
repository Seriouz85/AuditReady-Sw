import { Button } from "@/components/ui/button";
import { toast } from "@/utils/toast";

interface AuditReadyGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  guidance: string;
  requirementCode: string;
  requirementName: string;
  onApplyGuidance?: (formattedGuidance: string) => void;
}

export function AuditReadyGuidanceModal({
  isOpen,
  onClose,
  guidance,
  requirementCode,
  requirementName,
  onApplyGuidance
}: AuditReadyGuidanceModalProps) {
  if (!isOpen) return null;

  const handleApply = () => {
    // Get bullet points and manually strip any existing dashes or bullet prefixes
    const bulletElements = document.querySelectorAll('.prose ul li');

    const bullets = Array.from(bulletElements)
      .map(el => {
        const text = el.textContent || '';
        return text.replace(/^[-•*]\s+/, '').trim();
      })
      .filter(text => text.length > 0)
      .join('\n• ');

    const formattedGuidance = bullets.length > 0 ?
      `Implementation:\n\n• ${bullets}` :
      'No implementation guidance available.';

    onApplyGuidance?.(formattedGuidance);
    toast.success("Guidance applied to requirement");
    onClose();
  };

  const renderContent = () => {
    const content = guidance || 'No guidance available.';

    if (!content || content.trim() === '' || content === 'No guidance available.') {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No AuditReady guidance is available for this requirement.</p>
        </div>
      );
    }

    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const implIdx = lines.findIndex(l =>
      l.toLowerCase().includes('implementation') ||
      l.includes('**Implementation**')
    );
    const bulletPoints: string[] = [];
    if (implIdx >= 0) {
      for (let i = implIdx + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length > 0 &&
            !line.toLowerCase().includes('implementation') &&
            !line.includes('**Implementation**')) {
          const cleanedLine = line
            .replace(/^[•*]+ */, '')
            .replace(/^- */, '')
            .trim();
          if (cleanedLine && !bulletPoints.includes(cleanedLine)) {
            bulletPoints.push(cleanedLine);
          }
        }
      }
    }
    return (
      <div>
        <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-2">Implementation</h4>
        {bulletPoints.length > 0 ? (
          <ul className="list-disc pl-6 space-y-3">
            {bulletPoints.map((point, idx) => (
              <li key={idx} className="text-base">{point}</li>
            ))}
          </ul>
        ) : (
          <p>No implementation details available.</p>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 p-8 rounded-lg max-w-3xl w-full shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">AuditReady guidance</h3>
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-1 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            onClick={handleApply}
          >
            Apply to Requirement
          </Button>
        </div>
        <div className="prose dark:prose-invert max-w-none max-h-[70vh] overflow-y-auto w-full px-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
