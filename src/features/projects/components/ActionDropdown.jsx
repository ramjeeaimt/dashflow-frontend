import React, { useState, useRef, useEffect } from "react";
import { FaTrash, FaEdit, FaEye, FaGithub, FaChevronDown } from "react-icons/fa";
import { MdEmail, MdCheckCircle, MdHourglassEmpty } from "react-icons/md";

export default function ActionDropdown({ project, onDelete, onEdit, onView, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isCompleted = project.phase === "Completed";

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      
      {/* --- Trigger Button --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all duration-200 border rounded-lg shadow-sm ${
 isOpen 
 ? "bg-sidebar text-white border-slate-900" 
 : "bg-card text-foreground border-border hover:border-slate-400"
 }`}
      >
        Actions
        <FaChevronDown className={`text-[10px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* --- Dropdown Menu --- */}
      {isOpen && (
        <div className="absolute right-0 -mt-5 w-60 bg-card border border-border z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right">
          
          {/* Header */}
          <div className="px-4 py-3 bg-muted/60 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-sidebar text-white flex items-center justify-center text-[10px] font-semibold uppercase">
               {project.projectName.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wide leading-none mb-1">Project</p>
              <p className="text-xs font-bold text-foreground truncate">{project.projectName}</p>
            </div>
          </div>

          {/* Quick Status Toggle */}
          <div className="p-2">
            <button
              onClick={() => {
                onStatusChange(project.id, isCompleted ? "Development" : "Completed");
                setIsOpen(false);
              }}
              className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
 isCompleted
 ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
 : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
 }`}
            >
              {isCompleted ? <MdHourglassEmpty size={14} /> : <MdCheckCircle size={14} />}
              {isCompleted ? "Resume Work" : "Mark Done"}
            </button>
          </div>

          {/* Links Section */}
          <div className="px-2 pb-2 space-y-0.5">
            {(project.githubLink || project.links?.github) && (
              <a
                href={project.githubLink || project.links?.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground rounded-lg text-xs font-medium transition-all"
              >
                <FaGithub className="text-muted-foreground/70" size={14}/>
                GitHub Repository
              </a>
            )}

            <a
              href={`mailto:${project.clientEmail}`}
              className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground rounded-lg text-xs font-medium transition-all"
            >
              <MdEmail className="text-muted-foreground/70" size={14}/>
              Email Client
            </a>
          </div>

          {/* Grid Actions */}
          <div className="p-2 bg-muted/60 border-t border-border grid grid-cols-2 gap-2">
            <button
              onClick={() => { onView(project.id); setIsOpen(false); }}
              className="flex items-center justify-center gap-2 p-2 bg-card border border-border text-muted-foreground hover:text-foreground hover:border-slate-400 rounded-lg text-[10px] font-bold uppercase transition-all"
            >
              <FaEye size={12} /> View
            </button>
            <button
              onClick={() => { onEdit(project.id); setIsOpen(false); }}
              className="flex items-center justify-center gap-2 p-2 bg-card border border-border text-muted-foreground hover:text-foreground hover:border-slate-400 rounded-lg text-[10px] font-bold uppercase transition-all"
            >
              <FaEdit size={12} /> Edit
            </button>
          </div>

          {/* Delete Action */}
          <div className="p-1">
            <button
              onClick={() => { onDelete(project.id); setIsOpen(false); }}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all"
            >
              <FaTrash size={10} /> Delete Project
            </button>
          </div>

        </div>
      )}
    </div>
  );
}