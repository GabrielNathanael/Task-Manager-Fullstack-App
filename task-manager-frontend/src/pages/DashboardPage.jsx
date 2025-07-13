import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/MainLayout.jsx";
import TaskListSkeleton from "../components/TaskListSkeleton.jsx";
import { PlusIcon } from "../assets/icons/Icons.jsx";
import { useSearch } from "../context/SearchContext";
import Pagination from "../components/Pagination";
import { X, Calendar, Tag, FileText, Clock } from "lucide-react";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

const formatStatusText = (status) => {
  if (!status) return "";
  return status
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const TaskForm = ({
  onTaskCreated,
  currentUser,
  onOptimisticAdd,
  onClose,
  projects,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const selectedProjectId = projectId === "" ? null : parseInt(projectId, 10);
    const optimisticTask = {
      id: `temp-${Date.now()}`,
      title,
      description,
      status,
      due_date: dueDate,
      project_id: selectedProjectId,
      user_id: currentUser.uid,
      isOptimistic: true,
    };
    onOptimisticAdd(optimisticTask);
    onClose();
    try {
      const authToken = localStorage.getItem("sanctum_token");
      const response = await axios.post(
        "http://localhost:8000/api/tasks",
        {
          title,
          description,
          due_date: dueDate,
          status,
          project_id: selectedProjectId,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      onTaskCreated(optimisticTask.id, response.data.task);
    } catch (err) {
      console.error("Error creating task:", err);
      onTaskCreated(optimisticTask.id, null);
      setError("Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Add New Task</h3>
          <p className="text-sm text-gray-600">
            Create a new task to keep track of your progress
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="title"
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <FileText size={14} />
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter task title..."
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="project"
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <Tag size={14} />
              Project
            </label>
            <select
              id="project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
            >
              <option value="">Not in any project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="description"
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <FileText size={14} />
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              placeholder="Add task description..."
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm resize-none"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="dueDate"
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <Calendar size={14} />
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="status"
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <Clock size={14} />
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
              <p className="text-red-600 text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl font-medium text-gray-700 bg-gray-100 hover:scale-105  hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm rounded-xl font-medium text-white bg-blue-500 hover:scale-105  hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                "Add Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskList = ({
  tasks,
  onDeleteTask,
  onEditTask,
  onShowDetail,
  search,
  setSearch,
  pagination,
  setPagination,
}) => {
  const data = useMemo(() => tasks, [tasks]);

  const columns = useMemo(
    () => [
      {
        header: "Title",
        accessorKey: "title",
        meta: { align: "left" },
        cell: ({ row }) => (
          <div
            onClick={() => onShowDetail(row.original)}
            className="cursor-pointer text-sm font-medium text-gray-900 hover:text-blue-600 break-words text-left"
          >
            {row.original.title}
          </div>
        ),
      },
      {
        header: "Project",
        accessorFn: (row) => row.project?.name ?? "Not in any project",
        meta: { align: "left" },
        cell: ({ row }) => (
          <div className="text-sm text-gray-500 text-left break-words">
            {row.original.project?.name || "Not in any project"}
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { align: "center" },
        cell: ({ row }) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              row.original.status === "completed"
                ? "bg-green-100 text-green-800"
                : row.original.status === "in_progress"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {formatStatusText(row.original.status)}
          </span>
        ),
      },
      {
        header: "Due Date",
        accessorKey: "due_date",
        meta: { align: "center" },
        cell: ({ row }) =>
          row.original.due_date
            ? new Date(row.original.due_date).toLocaleDateString()
            : "N/A",
      },
      {
        header: "Actions",
        accessorKey: "actions",
        meta: { align: "center" },
        cell: ({ row }) => (
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => onEditTask(row.original)}
              className="px-3 py-1 text-xs text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-md"
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteTask(row.original.id)}
              className="px-3 py-1 text-xs text-red-700 bg-red-100 hover:bg-red-200 rounded-md"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [onDeleteTask, onEditTask, onShowDetail]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: search,
      pagination,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white rounded-lg shadow-md mt-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Your Tasks</h3>
      </div>
      <div className="min-h-[280px] flex flex-col justify-between">
        <div className="overflow-x-auto min-h-[320px]">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        header.column.columnDef.meta?.align === "center"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`${
                    row.original.isOptimistic ? "opacity-50 animate-pulse" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-6 py-4 text-sm align-top ${
                        cell.column.columnDef.meta?.align === "center"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-gray-600"
                  >
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4">
          <div className="flex flex-col items-center space-y-1">
            <Pagination
              pageIndex={table.getState().pagination.pageIndex}
              pageCount={table.getPageCount()}
              setPageIndex={(index) => table.setPageIndex(index)}
            />
            <p className="text-xs text-gray-500 mb-1 mt-1">
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskEditModal = ({ task, onUpdate, onClose, projects }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toISOString().split("T")[0]
    : "";
  const [dueDate, setDueDate] = useState(formattedDueDate);
  const [status, setStatus] = useState(task.status);
  const [projectId, setProjectId] = useState(task.project_id || "");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const selectedProjectId = projectId === "" ? null : parseInt(projectId, 10);
    try {
      await onUpdate(task.id, {
        title,
        description,
        due_date: dueDate,
        status,
        project_id: selectedProjectId,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update task.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Edit Task</h3>
          <p className="text-sm text-gray-600">Update your task details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="editTitle"
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <FileText size={14} />
              Title
            </label>
            <input
              type="text"
              id="editTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter task title..."
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="editProject"
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <Tag size={14} />
              Project
            </label>
            <select
              id="editProject"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
            >
              <option value="">Not in any project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="editDescription"
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <FileText size={14} />
              Description
            </label>
            <textarea
              id="editDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              placeholder="Add task description..."
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm resize-none"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="editDueDate"
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <Calendar size={14} />
              Due Date
            </label>
            <input
              type="date"
              id="editDueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="editStatus"
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <Clock size={14} />
              Status
            </label>
            <select
              id="editStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
              <p className="text-red-600 text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:scale-105 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm rounded-xl font-medium text-white bg-blue-500 hover:scale-105  hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Update Task
            </button>
          </div>
        </form>
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
          Are you sure you want to delete this task?
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

const TaskDetailModal = ({ task, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="relative bg-slate-800 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-700 rounded-full">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{task.title}</h3>
              <p className="text-slate-300 text-sm">Task Details</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">Project</p>
              <p className="text-gray-900 font-medium">
                {task.project?.name || "Not in any project"}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Description
              </p>
              <p className="text-gray-900 leading-relaxed">
                {task.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
              <span
                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  task.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : task.status === "in_progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {formatStatusText(task.status)}
              </span>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">Due Date</p>
              <p className="text-gray-900 font-medium">
                {task.due_date
                  ? (() => {
                      const date = new Date(task.due_date).toLocaleDateString(
                        "en-GB",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          timeZone: "Asia/Jakarta",
                        }
                      );
                      const parts = date.split(" ");
                      return `${parts[0]}, ${parts.slice(1).join(" ")}`;
                    })()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 p-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { search, setSearch } = useSearch();
  const navigate = useNavigate();
  const { currentUser, loadingAuth, isAuthenticated, handleLogout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const handleOptimisticAdd = (optimisticTask) => {
    const project = projects.find((p) => p.id === optimisticTask.project_id);
    const taskWithProject = { ...optimisticTask, project };
    setTasks((prev) => [taskWithProject, ...prev]);
  };

  const handleTaskChange = (tempId, newTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === tempId ? { ...newTask, isOptimistic: false } : t
      )
    );
  };

  const handleDeleteTask = (taskId) => setTaskToDelete(taskId);
  const handleEditTask = (task) => setEditingTask(task);
  const handleShowTaskDetail = (task) => setSelectedTaskForDetail(task);

  const onDeleteConfirm = async (taskId) => {
    const originalTasks = [...tasks];
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    setTaskToDelete(null);
    try {
      const authToken = localStorage.getItem("sanctum_token");
      await axios.delete(`http://localhost:8000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    } catch (err) {
      setError("Failed to delete task.");
      setTasks(originalTasks);
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    const originalTasks = [...tasks];
    const project = projects.find((p) => p.id === updatedData.project_id);
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updatedData, project, isOptimistic: true }
          : task
      )
    );
    setEditingTask(null);
    try {
      const authToken = localStorage.getItem("sanctum_token");
      const response = await axios.put(
        `http://localhost:8000/api/tasks/${taskId}`,
        updatedData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...response.data.task, isOptimistic: false }
            : task
        )
      );
    } catch (err) {
      setError("Failed to update task.");
      setTasks(originalTasks);
    }
  };

  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchInitialData = async () => {
      if (isAuthenticated) {
        setIsLoading(true);
        setError(null);
        try {
          const authToken = localStorage.getItem("sanctum_token");
          const [tasksResponse, projectsResponse] = await Promise.all([
            axios.get("http://localhost:8000/api/tasks", {
              headers: { Authorization: `Bearer ${authToken}` },
            }),
            axios.get("http://localhost:8000/api/projects", {
              headers: { Authorization: `Bearer ${authToken}` },
            }),
          ]);
          setTasks(tasksResponse.data.tasks);
          setProjects(projectsResponse.data.projects);
        } catch (err) {
          setError("Could not fetch initial data.");
          if (err.response?.status === 401) handleLogout();
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (!loadingAuth) {
      fetchInitialData();
    }
  }, [loadingAuth, isAuthenticated, navigate, handleLogout]);

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={() => setShowAddTaskModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
        >
          <PlusIcon className="size-5" />
          <span>Add New Task</span>
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {isLoading ? (
        <TaskListSkeleton />
      ) : (
        <TaskList
          tasks={tasks}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
          onShowDetail={handleShowTaskDetail}
          search={search}
          setSearch={setSearch}
          pagination={pagination}
          setPagination={setPagination}
        />
      )}

      {showAddTaskModal && (
        <TaskForm
          onTaskCreated={handleTaskChange}
          onOptimisticAdd={handleOptimisticAdd}
          currentUser={currentUser}
          onClose={() => setShowAddTaskModal(false)}
          projects={projects}
        />
      )}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onUpdate={handleUpdateTask}
          onClose={() => setEditingTask(null)}
          projects={projects}
        />
      )}
      {taskToDelete && (
        <DeleteConfirmationModal
          taskId={taskToDelete}
          onDeleteConfirm={onDeleteConfirm}
          onClose={() => setTaskToDelete(null)}
        />
      )}
      {selectedTaskForDetail && (
        <TaskDetailModal
          task={selectedTaskForDetail}
          onClose={() => setSelectedTaskForDetail(null)}
        />
      )}
    </MainLayout>
  );
};

export default DashboardPage;
