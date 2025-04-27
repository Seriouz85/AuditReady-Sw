import React, { useRef, forwardRef } from 'react';
import { Standard } from '@/types';
import { Requirement } from '@/types/requirements';
import { useReactToPrint } from 'react-to-print';

// Example props, adjust as needed
const legendDefs = [
  { code: 'REG', desc: 'The control is related to a regulatory or certification requirement' },
  { code: 'CON', desc: 'The control is required due to contractual obligations' },
  { code: 'BP', desc: 'The control is needed according to best practices' },
  { code: 'RC', desc: 'The control is needed to mitigate inherent risk to control objectives' },
];

// Fetch company/org name from localStorage or fallback to mock
const getCompanyName = () => {
  // Try to get from localStorage (simulate profile)
  const org = localStorage.getItem('organizationProfile');
  if (org) {
    try {
      const parsed = JSON.parse(org);
      return parsed.name || 'AuditReady';
    } catch {
      return 'AuditReady';
    }
  }
  // Fallback to mock
  return 'AuditReady';
};

function formatStatus(status: string) {
  return status
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

interface SoAPreviewProps {
  standards: Standard[];
  requirements: Requirement[];
}

const SoAPreview = forwardRef<HTMLDivElement, SoAPreviewProps>(({ standards, requirements }, ref) => {
  const companyName = getCompanyName();
  const soaVersion = '1.0';
  const preparedBy = 'Compliance Team'; // Placeholder, can be dynamic
  const notes = '';
  const date = new Date().toLocaleString();

  // Filter requirements for selected standards
  const relevantRequirements = requirements.filter((req: Requirement) =>
    standards.some((std: Standard) => std.id.toLowerCase() === req.standardId.toLowerCase())
  );

  // Helper: is ISO 27001
  const isISO27001 = (standardId: string) =>
    standardId.toLowerCase().includes('iso-27001');

  return (
    <div>
      <div ref={ref} className="bg-white rounded-lg shadow p-4 border" data-soa-print>
        {/* Header/Metadata */}
        <div className="mb-4 border-b pb-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-2">
            <div>
              <h2 className="text-2xl font-bold mb-1">Statement of Applicability (SoA)</h2>
              <div className="text-muted-foreground text-sm">{companyName}</div>
            </div>
            <div className="text-right text-sm mt-2 md:mt-0">
              <div><strong>Date:</strong> {date}</div>
              <div><strong>Version:</strong> {soaVersion}</div>
              <div><strong>Prepared by:</strong> {preparedBy}</div>
            </div>
          </div>
          {notes && <div className="text-xs text-muted-foreground mb-1">{notes}</div>}
        </div>
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-2">
            <strong>Legend for Control Inclusion:</strong>
            <ul className="ml-4 mt-1">
              {legendDefs.map(l => (
                <li key={l.code}><strong>{l.code}:</strong> {l.desc}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="overflow-x-auto">
          {relevantRequirements.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No requirements found for the selected standards.</p>
              <p className="text-xs mt-2">Check that your requirements are linked to the correct standards and that standards are marked as applicable.</p>
            </div>
          ) : (
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 align-bottom" rowSpan={2}>Standard</th>
                  <th className="border px-2 py-1 align-bottom" rowSpan={2}>Clause</th>
                  <th className="border px-2 py-1 align-bottom" rowSpan={2}>Requirement</th>
                  <th className="border px-2 py-1 text-center" colSpan={4}>Justification for inclusion</th>
                  <th className="border px-2 py-1 align-bottom" rowSpan={2}>Justification for exclusion</th>
                  <th className="border px-2 py-1 align-bottom" rowSpan={2}>Status</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1 text-center">REG</th>
                  <th className="border px-2 py-1 text-center">CON</th>
                  <th className="border px-2 py-1 text-center">BP</th>
                  <th className="border px-2 py-1 text-center">RC</th>
                </tr>
              </thead>
              <tbody>
                {relevantRequirements.map((req: Requirement) => {
                  const std = standards.find((s: Standard) => s.id.toLowerCase() === req.standardId.toLowerCase());
                  const regChecked = isISO27001(req.standardId) ? true : (req as any).legendReg;
                  // Clause: use code if present, else section, else '-'
                  const clause = req.code || req.section || '-';
                  return (
                    <tr key={req.id} className="even:bg-gray-50">
                      <td className="border px-2 py-1">{std?.name}</td>
                      <td className="border px-2 py-1">{clause}</td>
                      <td className="border px-2 py-1">{req.name}</td>
                      <td className="border px-2 py-1 text-center">{regChecked ? '✔️' : ''}</td>
                      <td className="border px-2 py-1 text-center">{(req as any).legendCon ? '✔️' : ''}</td>
                      <td className="border px-2 py-1 text-center">{(req as any).legendBp ? '✔️' : ''}</td>
                      <td className="border px-2 py-1 text-center">{(req as any).legendRc ? '✔️' : ''}</td>
                      <td className="border px-2 py-1">{(req as any).justification || ''}</td>
                      <td className="border px-2 py-1">{formatStatus(req.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
});

interface ActionButtonsProps {
  soaRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ soaRef, onClose }) => {
  const handlePrint = useReactToPrint({
    content: () => soaRef.current,
    documentTitle: `SoA_${getCompanyName().replace(/\s+/g, '_')}`,
  });
  return (
    <>
      <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700" onClick={handlePrint}>
        Save as PDF
      </button>
      <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-300" onClick={onClose}>
        Close
      </button>
    </>
  );
};

export default Object.assign(SoAPreview, { ActionButtons }); 