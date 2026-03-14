import { FaTrash, FaEdit, FaEye, FaGithub } from "react-icons/fa";
import { MdEmail, MdContactPhone } from "react-icons/md";

export default function ActionDropdown({ project, onDelete, onEdit, onView }) {
  return (
    <div className="relative group flex justify-center">
      
      {/* Button */}
      <button className="bg-gray-100 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-md text-sm font-medium transition duration-200">
        Actions
      </button>

      {/* Dropdown Menu */}
      <div className="absolute hidden group-hover:block right-0 mt-0 w-44 bg-white border rounded-lg shadow-lg z-50">

        {project.githubLink && (
          <a
            href={project.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
          >
            <FaGithub /> GitHub
          </a>
        )}

        {project.clientEmail && (
          <a
            href={`mailto:${project.clientEmail}`}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
          >
            <MdEmail /> Email
          </a>
        )}

        {project.contactInfo && (
          <a
            href={`tel:${project.contactInfo}`}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
          >
            <MdContactPhone /> Contact
          </a>
        )}

        <button
          onClick={() => onView(project.id)}
          className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          <FaEye /> View
        </button>

        <button
          onClick={() => onEdit(project.id)}
          className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          <FaEdit /> Edit
        </button>

        <button
          onClick={() => onDelete(project.id)}
          className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
        >
          <FaTrash /> Delete
        </button>

      </div>
    </div>
  );
}