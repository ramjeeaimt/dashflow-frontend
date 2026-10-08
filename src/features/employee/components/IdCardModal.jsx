import React, { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import Icon from '../../../components/AppIcon';

/**
 * Employee ID card, drawn directly onto a canvas with the 2D API. We avoid
 * html2canvas here because its text renderer clips glyph descenders and drops
 * cross-origin images. Drawing by hand gives crisp, predictable output that is
 * identical on screen (the preview is the same canvas) and in the PNG / PDF.
 */

const CARD_W = 270;
const CARD_H = 428; // 270:428 ≈ CR80 portrait ratio (54 : 85.6mm)
const SCALE = 3;

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const loadImage = (src) =>
    new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });

const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
};

const ellipsize = (ctx, text, maxW) => {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = String(text);
    while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
    return t + '…';
};

const IdCardModal = ({ employee, company, onClose }) => {
    const canvasRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [busy, setBusy] = useState(null);

    const name = `${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`.trim() || 'Employee';
    const photoSrc = employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=256`;

    useEffect(() => {
        let cancelled = false;

        const draw = async () => {
            try { if (document.fonts?.ready) await document.fonts.ready; } catch { /* ignore */ }
            const [photo, logo] = await Promise.all([loadImage(photoSrc), loadImage(company?.logo)]);
            if (cancelled) return;

            const canvas = document.createElement('canvas');
            canvas.width = CARD_W * SCALE;
            canvas.height = CARD_H * SCALE;
            const ctx = canvas.getContext('2d');
            ctx.scale(SCALE, SCALE);
            ctx.textBaseline = 'middle';

            // Background
            ctx.fillStyle = '#ffffff';
            roundRect(ctx, 0, 0, CARD_W, CARD_H, 18);
            ctx.fill();

            // Header band (clipped to the rounded top)
            const headerH = 96;
            ctx.save();
            roundRect(ctx, 0, 0, CARD_W, CARD_H, 18);
            ctx.clip();
            const grad = ctx.createLinearGradient(0, 0, CARD_W, headerH);
            grad.addColorStop(0, '#6366f1');
            grad.addColorStop(1, '#7c3aed');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, CARD_W, headerH);
            ctx.restore();

            // Logo tile
            const lx = 18, ly = 22, ls = 36;
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            roundRect(ctx, lx, ly, ls, ls, 8);
            ctx.fill();
            if (logo) {
                ctx.save();
                roundRect(ctx, lx + 3, ly + 3, ls - 6, ls - 6, 6);
                ctx.clip();
                ctx.drawImage(logo, lx + 3, ly + 3, ls - 6, ls - 6);
                ctx.restore();
            } else {
                ctx.fillStyle = '#4f46e5';
                ctx.font = '900 18px Inter, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText((company?.name || 'C').charAt(0).toUpperCase(), lx + ls / 2, ly + ls / 2 + 1);
            }

            // Company name
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 15px Inter, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(ellipsize(ctx, company?.name || 'Company', CARD_W - (lx + ls + 10) - 14), lx + ls + 10, ly + ls / 2 + 1);

            // Photo
            const pr = 42, pcx = CARD_W / 2, pcy = headerH - 4;
            ctx.save();
            ctx.beginPath();
            ctx.arc(pcx, pcy, pr + 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
            ctx.clip();
            if (photo) {
                // cover-fit the (square) source into the circle
                ctx.drawImage(photo, pcx - pr, pcy - pr, pr * 2, pr * 2);
            } else {
                ctx.fillStyle = '#6366f1';
                ctx.fillRect(pcx - pr, pcy - pr, pr * 2, pr * 2);
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 34px Inter, Arial, sans-serif';
                ctx.textAlign = 'center';
                const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
                ctx.fillText(initials, pcx, pcy + 1);
            }
            ctx.restore();

            // Name
            ctx.fillStyle = '#1e293b';
            ctx.font = '800 20px Inter, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(ellipsize(ctx, name, CARD_W - 24), pcx, pcy + pr + 24);

            // Designation pill
            const desig = (employee.designation?.name || 'Staff').toUpperCase();
            ctx.font = 'bold 10px Inter, Arial, sans-serif';
            const pillW = Math.min(ctx.measureText(desig).width + 24, CARD_W - 40);
            const pillY = pcy + pr + 40, pillH = 20;
            ctx.fillStyle = '#eef2ff';
            roundRect(ctx, pcx - pillW / 2, pillY, pillW, pillH, pillH / 2);
            ctx.fill();
            ctx.fillStyle = '#4f46e5';
            ctx.fillText(ellipsize(ctx, desig, pillW - 20), pcx, pillY + pillH / 2 + 1);

            // Detail rows
            const rows = [
                ['EMPLOYEE ID', employee.employeeCode || employee.id?.slice(0, 8)?.toUpperCase() || '—'],
                ['DEPARTMENT', employee.department?.name || 'General'],
                ['TYPE', employee.employmentType || 'Full-time'],
                ['JOINED', fmt(employee.hireDate)],
            ];
            let ry = pillY + pillH + 26;
            const padX = 22;
            rows.forEach(([label, value]) => {
                ctx.textAlign = 'left';
                ctx.fillStyle = '#94a3b8';
                ctx.font = '700 9px Inter, Arial, sans-serif';
                ctx.fillText(label, padX, ry);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#334155';
                ctx.font = 'bold 11px Inter, Arial, sans-serif';
                ctx.fillText(ellipsize(ctx, String(value), CARD_W - padX * 2 - 90), CARD_W - padX, ry);
                ry += 24;
            });

            // Barcode strip
            const bcY = CARD_H - 74, bcH = 26, bcX0 = 45, bcX1 = CARD_W - 45;
            ctx.fillStyle = '#1e293b';
            let bx = bcX0;
            let seed = 7;
            while (bx < bcX1 - 2) {
                const w = 1 + (seed % 3);
                const h = 8 + ((seed * 13) % 18);
                ctx.fillRect(bx, bcY + (bcH - h), w, h);
                bx += w + 1 + (seed % 2);
                seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            }

            // Footer
            ctx.textAlign = 'center';
            ctx.fillStyle = '#94a3b8';
            ctx.font = '500 8px Inter, Arial, sans-serif';
            ctx.fillText(ellipsize(ctx, company?.website || 'This card remains company property', CARD_W - 30), pcx, CARD_H - 30);

            // Bottom accent bar
            ctx.save();
            roundRect(ctx, 0, 0, CARD_W, CARD_H, 18);
            ctx.clip();
            const ag = ctx.createLinearGradient(0, 0, CARD_W, 0);
            ag.addColorStop(0, '#6366f1');
            ag.addColorStop(1, '#7c3aed');
            ctx.fillStyle = ag;
            ctx.fillRect(0, CARD_H - 6, CARD_W, 6);
            ctx.restore();

            canvasRef.current = canvas;
            setPreview(canvas.toDataURL('image/png'));
        };

        draw();
        return () => { cancelled = true; };
    }, [employee, company, photoSrc]);

    const downloadPng = () => {
        if (!canvasRef.current) return;
        setBusy('png');
        try {
            const link = document.createElement('a');
            link.download = `ID-Card-${name.replace(/\s+/g, '-')}.png`;
            link.href = canvasRef.current.toDataURL('image/png');
            link.click();
        } finally { setBusy(null); }
    };

    const downloadPdf = () => {
        if (!canvasRef.current) return;
        setBusy('pdf');
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 85.6] });
            pdf.addImage(canvasRef.current.toDataURL('image/png'), 'PNG', 0, 0, 54, 85.6);
            pdf.save(`ID-Card-${name.replace(/\s+/g, '-')}.pdf`);
        } finally { setBusy(null); }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-card rounded-2xl shadow-xl border border-border max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Icon name="CreditCard" size={16} className="text-primary" /> Employee ID Card</h3>
                    <button onClick={onClose} className="p-1 hover:bg-muted/60 rounded-lg text-muted-foreground/70"><Icon name="X" size={18} /></button>
                </div>

                <div className="p-6 flex flex-col items-center">
                    <div style={{ width: CARD_W, height: CARD_H }} className="rounded-2xl overflow-hidden shadow-lg bg-muted/40 flex items-center justify-center">
                        {preview
                            ? <img src={preview} alt="ID card" style={{ width: CARD_W, height: CARD_H }} />
                            : <Icon name="Loader" size={28} className="animate-spin text-primary" />}
                    </div>

                    <div className="flex items-center gap-2 mt-6 w-full">
                        <button onClick={downloadPng} disabled={!preview || !!busy} className="flex-1 px-4 py-2.5 bg-muted text-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-border disabled:opacity-60">
                            {busy === 'png' ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Image" size={14} />} PNG
                        </button>
                        <button onClick={downloadPdf} disabled={!preview || !!busy} className="flex-1 px-4 py-2.5 bg-sidebar text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                            {busy === 'pdf' ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Download" size={14} />} Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdCardModal;
