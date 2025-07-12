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
  XIcon,
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
            {project ? "Edit Project" : "Create New Project"}
          </h3>
          <p className="text-gray-500 text-xs">
            {project
              ? "Update your project details"
              : "Start something amazing today"}
          </p>
        </div>

        <div className="space-y-5">
          <div className="group">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600"
            >
              Project Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-400 hover:bg-gray-50"
                placeholder="Enter project name..."
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full"></div>
            </div>
          </div>

          <div className="group">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600"
            >
              Description{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-400 hover:bg-gray-50 resize-none"
                placeholder="Describe your project..."
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full"></div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Label Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                    color === c
                      ? "border-gray-800 shadow-lg scale-110 ring-2 ring-gray-300"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            {color && (
              <div className="mt-2 text-xs text-gray-500 font-mono">
                Selected: {color}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center space-x-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-semibold transition-colors duration-200 hover:bg-gray-50 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>{project ? "Update Project" : "Create Project"}</span>
                  <PlusIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ taskId, onDeleteConfirm, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-in zoom-in-95 duration-200">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-3 text-gray-900">
          Confirm Deletion
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          Are you sure you want to delete this project?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This action cannot be undone.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onDeleteConfirm(taskId)}
          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
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
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [error]);

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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 mb-4 px-4 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all duration-300 animate-in fade-in">
          <XIcon className="w-4 h-4 text-red" />
          <span className="font-medium">{error}</span>
        </div>
      )}

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
