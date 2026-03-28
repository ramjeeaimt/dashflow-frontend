import { FaTrash, FaEdit, FaEye, FaGithub, FaChevronDown } from "react-icons/fa";
import { MdEmail, MdCheckCircle, MdHourglassEmpty } from "react-icons/md";

export default function ActionDropdown({ project, onDelete, onEdit, onView, onStatusChange }) {
  const isCompleted = project.phase === "Completed";

  return (
    <div className="relative group flex justify-center">
      
      {/* --- Main Trigger Button --- */}
      <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 group-hover:border-blue-500 group-hover:text-blue-600 px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all duration-300 active:scale-95">
        Actions
        <FaChevronDown className="text-[10px] group-hover:rotate-180 transition-transform duration-300" />
      </button>

      {/* --- Unique Styled Dropdown Menu --- */}
      <div className="absolute hidden group-hover:block right-0 mt-10 w-64 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
        
        {/* Section 1: Header with Project Initials */}
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-md shadow-blue-100">
             {project.projectName.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Active Project</p>
            <p className="text-xs font-black text-slate-800 truncate">{project.projectName}</p>
          </div>
        </div>

        {/* Section 2: Quick Status Toggle */}
        <div className="p-2">
          <button
            onClick={() => onStatusChange(project.id, isCompleted ? "Development" : "Completed")}
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-200 ${
              isCompleted
                ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            }`}
          >
            {isCompleted ? (
              <> <MdHourglassEmpty size={18} /> Resume Project </>
            ) : (
              <> <MdCheckCircle size={18} /> Mark Completed </>
            )}
          </button>
        </div>

        {/* Section 3: Links */}
        <div className="px-2 pb-2 space-y-1">
          {(project.githubLink || project.links?.github) && (
            <a
              href={project.githubLink || project.links?.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-xs font-bold transition-all"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg group-hover:bg-blue-100"><FaGithub size={14}/></div>
              Open Repository
            </a>
          )}

          <a
            href={`mailto:${project.clientEmail}`}
            className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-bold transition-all"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg"><MdEmail size={14}/></div>
            Contact Client
          </a>
        </div>

        {/* Section 4: Management Actions Grid */}
        <div className="p-2 bg-slate-50/50 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onView(project.id)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white text-slate-600 hover:text-blue-600 hover:shadow-md hover:shadow-blue-50 rounded-2xl transition-all border border-slate-100 active:scale-95"
            >
              <FaEye size={16} /> 
              <span className="text-[10px] font-black uppercase tracking-wider">View</span>
            </button>
            <button
              onClick={() => onEdit(project.id)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white text-slate-600 hover:text-indigo-600 hover:shadow-md hover:shadow-indigo-50 rounded-2xl transition-all border border-slate-100 active:scale-95"
            >
              <FaEdit size={16} /> 
              <span className="text-[10px] font-black uppercase tracking-wider">Edit</span>
            </button>
          </div>

          <button
            onClick={() => onDelete(project.id)}
            className="flex items-center justify-center gap-2 w-full mt-2 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
          >
            <FaTrash size={12} /> Delete Project
          </button>
        </div>

      </div>
    </div>
  );
}