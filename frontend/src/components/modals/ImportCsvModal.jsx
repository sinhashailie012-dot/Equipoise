import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { employeeService } from '../../services/employeeService';
import { taskService } from '../../services/taskService';

export function ImportCsvModal({ isOpen, onClose, onImportSuccess }) {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [importType, setImportType] = useState('employees'); // 'employees' or 'tasks'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const resetState = () => {
    setSelectedFile(null);
    setPreviewRows([]);
    setImportResult(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a valid .csv file.');
      return;
    }

    setSelectedFile(file);
    setImportResult(null);

    // Read first few rows for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
        const rows = lines.slice(0, 6).map((line) => {
          // simple split handling basic quotes
          const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          return matches ? matches.map((m) => m.replace(/^"|"$/g, '')) : line.split(',');
        });
        setPreviewRows(rows);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = importType === 'employees'
        ? await employeeService.downloadTemplate()
        : await taskService.downloadTemplate();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${importType}_template.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${importType} template.`);
    } catch (err) {
      toast.error('Failed to download template.');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please choose a CSV file first.');
      return;
    }

    try {
      setIsUploading(true);
      setImportResult(null);

      const result = importType === 'employees'
        ? await employeeService.importEmployees(selectedFile)
        : await taskService.importTasks(selectedFile);

      setImportResult(result);

      if (result.errors && result.errors.length > 0) {
        toast.error(`Import failed with ${result.errors.length} error(s). No changes were saved.`);
      } else {
        toast.success(`Successfully imported ${result.rowsCreated} row(s)!`);
        if (onImportSuccess) {
          onImportSuccess();
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Import failed.';
      toast.error(errorMsg);
      setImportResult({
        rowsCreated: 0,
        rowsSkipped: 0,
        errors: [{ lineNumber: 1, message: errorMsg }],
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import CSV"
      subtitle="Upload a CSV file to bulk import employees or tasks with transactional validation."
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 text-xs text-[#2D5A43] hover:text-[#234735] font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download sample {importType} template
          </button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              loading={isUploading}
              disabled={!selectedFile || isUploading}
            >
              Upload & Import
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Toggle between employees and tasks */}
        <div className="flex items-center gap-2 border-b border-[#DDD4C4] pb-3">
          <label className="text-xs font-medium text-[#1E2A26] mr-2">Import target:</label>
          <button
            type="button"
            onClick={() => {
              setImportType('employees');
              resetState();
            }}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              importType === 'employees'
                ? 'bg-[#2D5A43] text-white font-medium'
                : 'bg-[#EAE4D9] text-[#6B6A60] hover:bg-[#DDD4C4]'
            }`}
          >
            Employees
          </button>
          <button
            type="button"
            onClick={() => {
              setImportType('tasks');
              resetState();
            }}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              importType === 'tasks'
                ? 'bg-[#2D5A43] text-white font-medium'
                : 'bg-[#EAE4D9] text-[#6B6A60] hover:bg-[#DDD4C4]'
            }`}
          >
            Tasks
          </button>
        </div>

        {/* File Picker */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#DDD4C4] hover:border-[#2D5A43] rounded-md p-6 text-center cursor-pointer bg-[#F8F5EE] transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-8 h-8 text-[#6B6A60] mx-auto mb-2" />
          <p className="text-xs font-medium text-[#1E2A26]">
            {selectedFile ? selectedFile.name : 'Click or drag a CSV file here to import'}
          </p>
          <p className="text-[11px] text-[#6B6A60] mt-1">
            Maximum file size: 5MB. Files are validated row-by-row before committing.
          </p>
        </div>

        {/* File Preview */}
        {previewRows.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#1E2A26]">
              <FileText className="w-3.5 h-3.5 text-[#6B6A60]" />
              <span>CSV Preview (First {previewRows.length - 1} rows)</span>
            </div>
            <div className="overflow-x-auto border border-[#DDD4C4] rounded bg-white max-h-40">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-[#F8F5EE] border-b border-[#DDD4C4]">
                    {previewRows[0].map((h, i) => (
                      <th key={i} className="py-1 px-2.5 font-medium text-[#1E2A26] truncate">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(1).map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-[#DDD4C4]/60 hover:bg-[#FBF8F2]">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-1 px-2.5 text-[#4A483E] truncate">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import Report / Result */}
        {importResult && (
          <div className="space-y-2 mt-4 pt-3 border-t border-[#DDD4C4]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1E2A26]">Import Report:</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-700 font-medium">Created: {importResult.rowsCreated}</span>
                <span className="text-[#6B6A60]">Skipped: {importResult.rowsSkipped}</span>
                {importResult.errors?.length > 0 && (
                  <span className="text-rose-600 font-medium">Errors: {importResult.errors.length}</span>
                )}
              </div>
            </div>

            {importResult.errors?.length > 0 ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded max-h-48 overflow-y-auto space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-rose-800 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Validation errors occurred. No rows were saved (transaction rolled back):</span>
                </div>
                <ul className="text-[11px] text-rose-700 space-y-1 pl-5 list-disc">
                  {importResult.errors.map((err, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">Line {err.lineNumber}:</span> {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All {importResult.rowsCreated} row(s) imported successfully without errors.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
