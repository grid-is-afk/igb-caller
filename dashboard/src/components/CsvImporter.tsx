"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, X, Loader2 } from "lucide-react";

interface CsvImporterProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
    defaultDate?: Date;
}

export function CsvImporter({ isOpen, onClose, onImportComplete, defaultDate }: CsvImporterProps) {
    interface CsvRow {
        "Client Name"?: string;
        name?: string;
        Name?: string;
        "Phone Number"?: string;
        phone?: string;
        PhoneNumber?: string;
        "Services Rendered"?: string;
        Services?: string;
        servicesOffered?: string;
        "Invoice Amount"?: string;
        Amount?: string;
        billOrPayment?: string;
        "Next Call"?: string;
    }
    const [data, setData] = useState<CsvRow[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setData(results.data);
            },
            error: (error) => {
                alert("Error parsing CSV: " + error.message);
            }
        });
    };

    const processImport = async () => {
        setLoading(true);

        try {
            // map raw csv data to schema shape
            const payload = data.map((row) => ({
                name: row["Client Name"] || row["name"] || row["Name"],
                phoneNumber: row["Phone Number"] || row["phone"] || row["PhoneNumber"],
                servicesOffered: row["Services Rendered"] || row["Services"] || row["servicesOffered"],
                billOrPayment: row["Invoice Amount"] || row["Amount"] || row["billOrPayment"],
                nextCallDate: row["Next Call"] ? new Date(row["Next Call"]) : (defaultDate || new Date())
            })).filter(p => p.name && p.phoneNumber); // Client-side validation

            if (payload.length === 0) {
                alert("No valid rows found. Check column headers.");
                setLoading(false);
                return;
            }

            const res = await fetch("/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (res.ok) {
                alert(`Import successful! Added ${result.count} contacts.`);
                onImportComplete();
                onClose();
                setData([]);
            } else {
                throw new Error(result.error || "Import failed");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            alert(`Error: ${message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl w-full max-w-2xl shadow-2xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-[#262626]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Upload size={20} /> Import CSV {defaultDate ? `for ${defaultDate.toLocaleDateString()}` : ""}
                    </h2>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {!data.length ? (
                        <div className="h-full border-2 border-dashed border-[#262626] rounded-lg flex flex-col items-center justify-center text-neutral-500 hover:border-cyan-500/50 hover:bg-[#111] transition-all cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}>
                            <Upload size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium text-white">Click to Upload CSV</p>
                            <p className="text-sm">Requirements: &quot;Client Name&quot;, &quot;Phone Number&quot;</p>
                            <input
                                type="file"
                                accept=".csv"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-white font-medium">Preview ({data.length} rows)</span>
                                <button onClick={() => setData([])} className="text-xs text-neutral-400 hover:text-white underline">Clear</button>
                            </div>
                            <div className="border border-[#262626] rounded overflow-hidden">
                                <table className="w-full text-xs text-left text-neutral-400">
                                    <thead className="bg-[#111] text-neutral-200">
                                        <tr>
                                            <th className="p-2 border-b border-r border-[#262626]">Client Name</th>
                                            <th className="p-2 border-b border-r border-[#262626]">Phone</th>
                                            <th className="p-2 border-b border-r border-[#262626]">Amount</th>
                                            <th className="p-2 border-b border-[#262626]">Services</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#262626]">
                                        {data.slice(0, 10).map((row, i) => (
                                            <tr key={i}>
                                                <td className="p-2 border-r border-[#262626]">{row["Client Name"] || row["name"]}</td>
                                                <td className="p-2 border-r border-[#262626]">{row["Phone Number"] || row["phone"]}</td>
                                                <td className="p-2 border-r border-[#262626]">{row["Invoice Amount"] || row["Amount"]}</td>
                                                <td className="p-2">{row["Services Rendered"] || row["Services"]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {data.length > 10 && <div className="p-2 text-center text-neutral-600 italic bg-[#0f0f0f] border-t border-[#262626]">...and {data.length - 10} more</div>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[#262626] flex justify-end gap-3 bg-[#0a0a0a]">
                    <button onClick={onClose} className="px-4 py-2 rounded text-neutral-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={processImport}
                        disabled={!data.length || loading}
                        className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white px-6 py-2 rounded font-medium transition-colors flex items-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? "Importing..." : "Run Import"}
                    </button>
                </div>
            </div>
        </div>
    );
}
