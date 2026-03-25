import { FaTrash, FaEdit, FaEye, FaGithub } from "react-icons/fa";
import { MdEmail, MdContactPhone, MdCheckCircle, MdHourglassEmpty } from "react-icons/md";
import { RiProgress5Fill } from "react-icons/ri";


export default function ActionDropdown({ project, onDelete, onEdit, onView, onStatusChange }) {
  // Determine if the project is already completed
  const isCompleted = project.phase === "Completed";

  return (
    <div className="relative group flex justify-center">

      {/* Main Button */}
      <button className="bg-gray-100 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-md text-sm font-medium transition duration-200">
        Actions
      </button>

      {/* Dropdown Menu */}
      <div className="absolute hidden group-hover:block right-0 mt-8 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2">

        {/* Toggle Status Button */}
        <button
          onClick={() => onStatusChange(project.id, isCompleted ? "Development" : "Completed")}
          className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-semibold transition ${isCompleted
              ? "text-orange-600 hover:bg-orange-50"
              : "text-black hover:bg-green-50"
            }`}
        >
          {isCompleted ? (
            <>
              <MdHourglassEmpty className="text-lg" /> Set to In Progress
            </>
          ) : (
            <>
              <MdCheckCircle className="text-lg" />  Completed

            </>
          )}

        </button>
        <button
          onClick={() => onStatusChange(project.id, isCompleted ? "Development" : "Completed")}
          className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-semibold transition ${isCompleted
              ? "text-orange-600 hover:bg-orange-50"
              : "text-black hover:bg-green-50"
            }`}
        >
          {isCompleted ? (
            <>
              <MdHourglassEmpty className="text-lg" /> Set to In Progress
            </>
          ) : (
            <>
              <RiProgress5Fill className="text-lg" />
              progress

            </>
          )}

        </button>


        <hr className="my-1 border-gray-100" />

        {project.githubLink && (
          <a
            href={project.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-black gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
          >
            <FaGithub /> GitHub
          </a>
        )}

        {project.clientEmail && (
          <a
            href={`mailto:${project.clientEmail}`}
            className="flex items-center text-black gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
          >
            <MdEmail /> Email
          </a>
        )}

        {project.contactInfo && (
          <a
            href={`tel:${project.contactInfo}`}
            className="flex items-center text-black gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
          >
            <MdContactPhone /> Contact
          </a>
        )}

        <button
          onClick={() => onView(project.id)}
          className="flex items-center text-black gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
        >
          <FaEye /> View
        </button>

        <button
          onClick={() => onEdit(project.id)}
          className="flex items-center text-black gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
        >
          <FaEdit /> Edit
        </button>

        <button
          onClick={() => onDelete(project.id)}
          className="flex items-center text-black gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 text-sm"
        >
          <FaTrash /> Delete
        </button>

      </div>
    </div>
  );
}