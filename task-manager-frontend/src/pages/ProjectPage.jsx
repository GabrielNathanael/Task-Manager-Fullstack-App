import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import MainLayout from "../components/MainLayout.jsx";
import {
  PlusIcon,
  EllipsisIcon,
  EditIcon,
  DeleteIcon,
} from "../assets/icons/Icons.jsx";
import ProjectCardSkeleton from "../components/ProjectCardSkeleton.jsx";
import { useNavigate } from "react-router-dom";
import { ProjectMiniDashboardModal } from "../components/ProjectMiniDashboardModal.jsx";

const COLOR_PALETTE = [
  "#60A5FA", // Blue
  "#F87171", // Red
  "#34D399", // Green
  "#FBBF24", // Yellow
  "#A78BFA", // Purple
  "#F472B6", // Pink
  "#9CA3AF", // Gray
  "#FB923C", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EF4444", // Rose
  "#8B5CF6", // Violet
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899", // Fuchsia
  "#14B8A6", // Teal
  "#7C3AED", // Indigo
];

const ProjectForm = ({ project, onSave, onClose }) => {
  const [name, setName] = useState(project ? project.name : "");
  const [description, setDescription] = useState(
    project ? project.description : ""
  );
  const [color, setColor] = useState(project ? project.color : "#60A5FA");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSave({ id: project?.id, name, description, color });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {project ? "Edit Project" : "Create New Project"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Project Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            ></textarea>
          </div>
          <div className="mb-4">
            <label
              htmlFor="color"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Label Color
            </label>
            <div className="flex space-x-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-4 h-4 rounded-full border-2 ${
                    color === c ? "border-black" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={isSubmitting}
            >
              {project ? "Update Project" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ taskId, onDeleteConfirm, onClose }) => (
  <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h3>
      <p className="text-gray-700 mb-6">
        Are you sure you want to delete this project?
      </p>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onDeleteConfirm(taskId)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const ProjectCard = ({
  project,
  onOpenMiniDashboard,
  onEdit,
  onDelete,
  onConfirmDelete,
}) => (
  <div
    className={`bg-white p-6 rounded-lg shadow-md border-t-4 ${
      project.isOptimistic ? "opacity-50 animate-pulse" : ""
    }`}
    style={{ borderColor: project.color || "#cccccc" }}
  >
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
      <button
        onClick={() => onOpenMiniDashboard(project)}
        className="text-gray-500 hover:text-gray-700"
      >
        <EllipsisIcon className="size-6" />
      </button>
    </div>
    <div className="border-t border-dashed border-gray-300 my-4"></div>
    <div className="flex justify-between text-sm text-gray-700">
      <span>Tasks: {project.tasks_count}</span>
      <span>Completed: {project.completed_tasks_count}</span>
    </div>
    <div className="mt-4 text-right space-x-3">
      <button
        onClick={() => onEdit(project)}
        className="text-green-600 hover:text-green-800"
      >
        <EditIcon className="size-5" />
      </button>
      <button
        onClick={onConfirmDelete}
        className="text-red-600 hover:text-red-800"
      >
        <DeleteIcon className="size-5" />
      </button>
    </div>
  </div>
);

const ProjectPage = () => {
  const { isAuthenticated, loadingAuth, currentUser, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const { search } = useSearch();
  const [selectedProjectForMiniDashboard, setSelectedProjectForMiniDashboard] =
    useState(null);
  const [cachedTasksByProject, setCachedTasksByProject] = useState({});
  const lastProjectCountRef = useRef(6);
  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem("last_project_count"));
    if (!isNaN(savedCount)) {
      lastProjectCountRef.current = savedCount;
    }

    if (!loadingAuth && !isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isAuthenticated && currentUser) {
      fetchProjects();
    }
  }, [isAuthenticated, loadingAuth, currentUser, navigate]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const authToken = localStorage.getItem("sanctum_token");
      const response = await axios.get("http://localhost:8000/api/projects", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const fetchedProjects = response.data.projects;

      lastProjectCountRef.current = fetchedProjects.length || 6;
      localStorage.setItem("last_project_count", lastProjectCountRef.current);

      setProjects(fetchedProjects);
    } catch (err) {
      setError("Failed to fetch projects.");
      if (err.response?.status === 401) handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectCount = (
    projectId,
    tasksCount,
    completedCount,
    updatedTasks
  ) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === projectId
          ? {
              ...proj,
              tasks_count: tasksCount,
              completed_tasks_count: completedCount,
            }
          : proj
      )
    );
    setCachedTasksByProject((prev) => ({
      ...prev,
      [projectId]: { projectId, tasks: updatedTasks },
    }));
  };

  const handleSaveProject = async (data) => {
    const isCreate = !data.id;
    const optimisticId = isCreate ? `temp-${Date.now()}` : data.id;
    const originalProjects = [...projects];
    if (isCreate) {
      setProjects((prev) => [
        {
          ...data,
          id: optimisticId,
          tasks_count: 0,
          completed_tasks_count: 0,
          isOptimistic: true,
        },
        ...prev,
      ]);
    } else {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === data.id ? { ...p, ...data, isOptimistic: true } : p
        )
      );
    }
    try {
      const authToken = localStorage.getItem("sanctum_token");
      const response = isCreate
        ? await axios.post("http://localhost:8000/api/projects", data, {
            headers: { Authorization: `Bearer ${authToken}` },
          })
        : await axios.put(
            `http://localhost:8000/api/projects/${data.id}`,
            data,
            { headers: { Authorization: `Bearer ${authToken}` } }
          );

      setProjects((prev) => [
        response.data.project,
        ...prev.filter((p) => p.id !== optimisticId),
      ]);
    } catch (err) {
      setError("Failed to save project.");
      setProjects(originalProjects);
      throw err;
    }
  };

  const handleDeleteProject = async (projectId) => {
    const originalProjects = [...projects];
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    try {
      const authToken = localStorage.getItem("sanctum_token");
      await axios.delete(`http://localhost:8000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    } catch (err) {
      setError("Failed to delete project.");
      setProjects(originalProjects);
    }
  };

  const handleEditProject = (project) => setEditingProject(project);
  const handleOpenMiniDashboard = (project) =>
    setSelectedProjectForMiniDashboard(project);
  const [projectToDelete, setProjectToDelete] = useState(null);

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
        <button
          onClick={() => setShowCreateProjectModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="size-5" />
          <span>Create Project</span>
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: lastProjectCountRef.current }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter((project) =>
            project.name.toLowerCase().includes(search.toLowerCase())
          ).length === 0 ? (
            <p className="col-span-full text-gray-600 text-center py-8">
              No projects found. Create a new one!
            </p>
          ) : (
            projects
              .filter((project) =>
                project.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpenMiniDashboard={handleOpenMiniDashboard}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onConfirmDelete={() => setProjectToDelete(project)}
                />
              ))
          )}
        </div>
      )}

      {showCreateProjectModal && (
        <ProjectForm
          onSave={handleSaveProject}
          onClose={() => setShowCreateProjectModal(false)}
        />
      )}

      {editingProject && (
        <ProjectForm
          project={editingProject}
          onSave={handleSaveProject}
          onClose={() => setEditingProject(null)}
        />
      )}

      {selectedProjectForMiniDashboard && (
        <ProjectMiniDashboardModal
          project={selectedProjectForMiniDashboard}
          onClose={() => setSelectedProjectForMiniDashboard(null)}
          currentUser={currentUser}
          cachedTasks={cachedTasksByProject[selectedProjectForMiniDashboard.id]}
          onProjectTasksUpdated={updateProjectCount}
        />
      )}
      {projectToDelete && (
        <DeleteConfirmationModal
          taskId={projectToDelete.id}
          onDeleteConfirm={(id) => {
            handleDeleteProject(id);
            setProjectToDelete(null);
          }}
          onClose={() => setProjectToDelete(null)}
        />
      )}
    </MainLayout>
  );
};

export default ProjectPage;
