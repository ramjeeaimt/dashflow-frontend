import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Icon from '../../../components/AppIcon';

/**
 * Printable employee ID card. The card itself is plain DOM so html2canvas can
 * rasterise it for PNG/PDF export. Photo and logo use crossOrigin so the
 * captured canvas isn't tainted (Cloudinary / ui-avatars send CORS headers).
 */

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const IdCardModal = ({ employee, company, onClose }) => {
    const cardRef = useRef(null);
    const [busy, setBusy] = useState(null);

    const name = `${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`.trim() || 'Employee';
    const photo = employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=256`;
    const rows = [
        { label: 'Employee ID', value: employee.employeeCode || employee.id?.slice(0, 8)?.toUpperCase() || '—' },
        { label: 'Department', value: employee.department?.name || 'General' },
        { label: 'Type', value: employee.employmentType || 'Full-time' },
        { label: 'Joined', value: fmt(employee.hireDate) },
    ];

    const capture = async () => {
        return html2canvas(cardRef.current, {
            scale: 3,
            useCORS: true,
            backgroundColor: null,
            logging: false,
        });
    };

    const downloadPng = async () => {
        setBusy('png');
        try {
            const canvas = await capture();
            const link = document.createElement('a');
            link.download = `ID-Card-${name.replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('PNG export failed:', err);
            alert('Could not export the ID card image.');
        } finally {
            setBusy(null);
        }
    };

    const downloadPdf = async () => {
        setBusy('pdf');
        try {
            const canvas = await capture();
            const imgData = canvas.toDataURL('image/png');
            // CR80 portrait card: 54mm x 85.6mm.
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 85.6] });
            pdf.addImage(imgData, 'PNG', 0, 0, 54, 85.6);
            pdf.save(`ID-Card-${name.replace(/\s+/g, '-')}.pdf`);
        } catch (err) {
            console.error('PDF export failed:', err);
            alert('Could not export the ID card PDF.');
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-card rounded-2xl shadow-xl border border-border max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Icon name="CreditCard" size={16} className="text-primary" /> Employee ID Card</h3>
                    <button onClick={onClose} className="p-1 hover:bg-muted/60 rounded-lg text-muted-foreground/70"><Icon name="X" size={18} /></button>
                </div>

                <div className="p-6 flex flex-col items-center">
                    {/* ===== THE CARD ===== */}
                    <div
                        ref={cardRef}
                        style={{ width: 260, height: 412 }}
                        className="relative rounded-2xl overflow-hidden shadow-lg bg-white flex flex-col"
                    >
                        {/* Header band */}
                        <div className="relative h-28 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center gap-2 px-4">
                            {company?.logo ? (
                                <img src={company.logo} crossOrigin="anonymous" alt="logo" className="w-8 h-8 rounded-md object-contain bg-white/90 p-0.5" />
                            ) : (
                                <div className="w-8 h-8 rounded-md bg-white/90 flex items-center justify-center text-indigo-600 font-black text-sm">
                                    {(company?.name || 'C').charAt(0)}
                                </div>
                            )}
                            <span className="text-white font-bold text-sm truncate">{company?.name || 'Company'}</span>
                        </div>

                        {/* Photo */}
                        <div className="flex justify-center -mt-12">
                            <img
                                src={photo}
                                crossOrigin="anonymous"
                                alt={name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-slate-100"
                            />
                        </div>

                        {/* Identity */}
                        <div className="text-center px-4 mt-2">
                            <p className="text-base font-black text-slate-800 leading-tight">{name}</p>
                            <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wide">
                                {employee.designation?.name || 'Staff'}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="px-5 mt-3 space-y-1.5 flex-1">
                            {rows.map((r) => (
                                <div key={r.label} className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-400 font-semibold uppercase tracking-wide">{r.label}</span>
                                    <span className="text-slate-700 font-bold truncate max-w-[130px] text-right">{r.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Faux barcode + footer */}
                        <div className="px-5 pb-3">
                            <div className="flex items-end gap-[2px] h-7 justify-center mb-1">
                                {Array.from({ length: 40 }).map((_, i) => (
                                    <div key={i} style={{ width: 2, height: `${((i * 37) % 20) + 8}px` }} className="bg-slate-800" />
                                ))}
                            </div>
                            <p className="text-center text-[8px] text-slate-400 font-medium truncate">{company?.website || 'This card remains company property'}</p>
                        </div>

                        {/* Side accent */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-violet-600" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-6 w-full">
                        <button onClick={downloadPng} disabled={!!busy} className="flex-1 px-4 py-2.5 bg-muted text-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-border disabled:opacity-60">
                            {busy === 'png' ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Image" size={14} />} PNG
                        </button>
                        <button onClick={downloadPdf} disabled={!!busy} className="flex-1 px-4 py-2.5 bg-sidebar text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                            {busy === 'pdf' ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Download" size={14} />} Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdCardModal;
