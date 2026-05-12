"use client";

import { useState } from "react";
import Papa from "papaparse";
import { 
  IconX, 
  IconUpload, 
  IconFileSpreadsheet, 
  IconAlertCircle, 
  IconCheck, 
  IconLoader2 
} from "@tabler/icons-react";
import { importProductsAction, ImportRow } from "@/actions/import";

export function ImportModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ImportRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    setIsParsing(true);
    setError(null);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows: ImportRow[] = results.data.map((row: any) => {
            // Validate required fields
            if (!row.Name || !row.SKU) throw new Error("Missing required columns: Name and SKU are mandatory.");
            
            // Extract attributes (any column not in core fields)
            const coreFields = ["Name", "SKU", "Category", "Description", "BasePrice"];
            const attributes: Record<string, string> = {};
            Object.keys(row).forEach(key => {
              if (!coreFields.includes(key) && row[key]) {
                attributes[key] = row[key];
              }
            });

            return {
              name: row.Name,
              sku: row.SKU,
              category: row.Category || "Uncategorized",
              description: row.Description || "",
              basePrice: parseFloat(row.BasePrice) || 0,
              attributes
            };
          });

          setParsedData(rows);
        } catch (err: any) {
          setError(err.message || "Failed to parse CSV. Please check the format.");
          setParsedData([]);
        } finally {
          setIsParsing(false);
        }
      },
      error: (err) => {
        setError("Error reading file: " + err.message);
        setIsParsing(false);
      }
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setIsImporting(true);
    
    const res = await importProductsAction(parsedData);
    
    if (res.error) {
      setError(res.error);
      setIsImporting(false);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-primary w-full max-w-[800px] max-h-[90vh] rounded-[12px] border border-border-default shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-default">
          <div className="flex items-center gap-2">
            <IconFileSpreadsheet size={18} className="text-text-primary" />
            <h2 className="text-[14px] font-medium text-text-primary">Bulk Import Products</h2>
          </div>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary transition-colors">
            <IconX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          {/* 1. Upload Section */}
          {!file && (
            <label className="flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed border-border-strong rounded-[10px] bg-bg-tertiary cursor-pointer hover:bg-bg-secondary hover:border-text-muted transition-all">
              <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              <div className="w-10 h-10 rounded-full bg-bg-primary flex items-center justify-center shadow-sm">
                <IconUpload size={20} className="text-text-secondary" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-text-primary">Click to upload CSV</p>
                <p className="text-[11px] text-text-muted mt-1">Expected: Name, SKU, Category, Description, BasePrice...</p>
              </div>
            </label>
          )}

          {/* 2. Error State */}
          {error && (
            <div className="p-4 bg-[#FDE7E7] border border-[#F5C2C2] rounded-[8px] flex gap-3 text-[#A32D2D]">
              <IconAlertCircle size={20} className="flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="text-[13px] font-medium">Import Error</p>
                <p className="text-[12px] opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* 3. Preview Section */}
          {parsedData.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-mono uppercase text-text-muted tracking-wider">Preview ({parsedData.length} items)</h3>
                <button 
                  onClick={() => { setFile(null); setParsedData([]); setError(null); }}
                  className="text-[11px] text-text-muted hover:text-text-primary underline"
                >
                  Change File
                </button>
              </div>
              <div className="border border-border-default rounded-[8px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-bg-tertiary border-b border-border-default">
                    <tr>
                      <th className="px-4 py-2 text-[11px] font-mono text-text-muted">Name</th>
                      <th className="px-4 py-2 text-[11px] font-mono text-text-muted">SKU</th>
                      <th className="px-4 py-2 text-[11px] font-mono text-text-muted">Category</th>
                      <th className="px-4 py-2 text-[11px] font-mono text-text-muted text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-b border-border-subtle last:border-b-0">
                        <td className="px-4 py-2 text-[12px] text-text-primary font-medium">{row.name}</td>
                        <td className="px-4 py-2 text-[12px] font-mono text-text-secondary">{row.sku}</td>
                        <td className="px-4 py-2 text-[12px] text-text-secondary">{row.category}</td>
                        <td className="px-4 py-2 text-[12px] font-mono text-right text-text-primary">₵{row.basePrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <div className="p-2 bg-bg-tertiary text-center border-t border-border-default">
                    <p className="text-[11px] text-text-muted">...and {parsedData.length - 10} more items</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-default bg-bg-tertiary flex items-center justify-between">
          <p className="text-[11px] text-text-muted max-w-[400px]">
            {file ? "Review the data above before confirming. Duplicate SKUs will be updated." : "Supported format: UTF-8 encoded CSV files only."}
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-4 h-[36px] bg-transparent border border-border-default rounded-[7px] text-[13px] font-medium text-text-secondary hover:text-text-primary transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleImport}
              disabled={isImporting || parsedData.length === 0}
              className="flex items-center gap-2 px-6 h-[36px] bg-cta-bg text-cta-text rounded-[7px] text-[13px] font-medium hover:bg-cta-hover disabled:opacity-50 transition-all shadow-sm"
            >
              {isImporting ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  Start Import
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
