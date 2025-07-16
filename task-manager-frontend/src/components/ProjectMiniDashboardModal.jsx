import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { PlusIcon, SearchIcon } from "../assets/icons/Icons.jsx";
import Pagination from "../components/Pagination";
import { X, Calendar, Tag, FileText, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

const formatStatusText = (status) => {
  if (!status) return "";
  return status
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
  localProject,
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
            className="cursor-pointer text-sm font-medium text-gray-900 hover:text-blue-600 break-words"
          >
            {row.original.title}
          </div>
        ),
      },
      {
        header: "Project",
        accessorKey: "project.name",
        meta: { align: "left" },
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
              onClick={() => onDeleteTask(row.original)}
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
        <h3 className="text-xl font-bold text-gray-800">Project Tasks</h3>
        <p className="text-sm text-gray-600 mt-1">
          Description: {localProject?.description || "None"}
        </p>
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
                      className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-${
                        header.column.columnDef.meta?.align || "left"
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-gray-600"
                  >
                    No tasks found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`${
                      row.original.isOptimistic
                        ? "opacity-50 animate-pulse"
                        : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`px-6 py-4 text-sm align-top text-${
                          cell.column.columnDef.meta?.align || "left"
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col items-center space-y-2">
          <Pagination
            pageIndex={table.getState().pagination.pageIndex}
            pageCount={table.getPageCount()}
            setPageIndex={table.setPageIndex}
          />
          <span className="text-xs text-gray-500 mb-1 mt-1">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
        </div>
      </div>
    </div>
  );
};

const ProjectMiniDashboardModal = ({
  project,
  onClose,
  currentUser,
  cachedTasks,
  onProjectTasksUpdated,
}) => {
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [search, setSearch] = useState("");
  const [localProject, setLocalProject] = useState(project);
  const queryClient = useQueryClient();

  useEffect(() => {
    const latest = queryClient
      .getQueryData(["projects"])
      ?.find((p) => p.id === project.id);
    if (latest && JSON.stringify(latest) !== JSON.stringify(localProject)) {
      setLocalProject(latest);
    }
  }, [queryClient, project.id, localProject]);
  const [addTaskErrors, setAddTaskErrors] = useState({ title: "", status: "" });
  const [editTaskErrors, setEditTaskErrors] = useState({
    title: "",
    status: "",
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);

  const {
    data: tasks = [],
    isLoading: loadingTasks,
    error,
  } = useQuery({
    queryKey: ["tasks", project.id],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:8000/api/tasks?project_id=${project.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("sanctum_token")}`,
          },
        }
      );
      return res.data.tasks;
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateProjectCounts = (updatedTasks) => {
    onProjectTasksUpdated(
      project.id,
      updatedTasks.length,
      updatedTasks.filter((t) => t.status === "completed").length,
      updatedTasks
    );
  };

  const handleAddTask = async (data) => {
    setAddTaskErrors({ title: "", status: "" });

    const newErrors = {
      title: data.title.trim() ? "" : "Title is required.",
      status: data.status.trim() ? "" : "Status is required.",
    };

    if (newErrors.title || newErrors.status) {
      setAddTaskErrors(newErrors);
      return;
    }

    const newTask = {
      ...data,
      project_id: project.id,
      isOptimistic: true,
    };

    const previous = queryClient.getQueryData(["tasks", project.id]) || [];
    queryClient.setQueryData(["tasks", project.id], [newTask, ...previous]);
    setShowAddTaskModal(false);

    try {
      const res = await axios.post(
        `http://localhost:8000/api/tasks`,
        {
          ...data,
          project_id: project.id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("sanctum_token")}`,
          },
        }
      );

      const createdTask = { ...res.data.task, project };

      queryClient.setQueryData(["tasks", project.id], (old = []) => {
        return [createdTask, ...old.filter((t) => !t.isOptimistic)];
      });

      queryClient.setQueryData(["tasks"], (prev = []) => [
        createdTask,
        ...prev,
      ]);

      const updated = [createdTask, ...previous];
      updateProjectCounts(updated);
    } catch {
      queryClient.setQueryData(["tasks", project.id], previous);
    }
  };

  const handleUpdateTask = async (taskId, data) => {
    setEditTaskErrors({ title: "", status: "" });

    const newErrors = {
      title: data.title.trim() ? "" : "Title is required.",
      status: data.status.trim() ? "" : "Status is required.",
    };

    if (newErrors.title || newErrors.status) {
      setEditTaskErrors(newErrors);
      return;
    }

    const original = queryClient.getQueryData(["tasks", project.id]) || [];

    const optimisticTasks = original.map((t) =>
      t.id === taskId ? { ...t, ...data, isOptimistic: true } : t
    );
    queryClient.setQueryData(["tasks", project.id], optimisticTasks);
    setEditingTask(null);

    try {
      const res = await axios.put(
        `http://localhost:8000/api/tasks/${taskId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("sanctum_token")}`,
          },
        }
      );

      const updatedTask = { ...res.data.task, project };
      const updatedTasks = original.map((t) =>
        t.id === taskId ? updatedTask : t
      );

      queryClient.setQueryData(["tasks", project.id], updatedTasks);

      queryClient.setQueryData(["tasks"], (prev = []) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );

      updateProjectCounts(updatedTasks);
    } catch {
      queryClient.setQueryData(["tasks", project.id], original);
    }
  };

  const handleConfirmDelete = async (task) => {
    const original = queryClient.getQueryData(["tasks", project.id]);
    const updated = original.filter((t) => t.id !== task.id);
    queryClient.setQueryData(["tasks", project.id], updated);
    setTaskToDelete(null);
    updateProjectCounts(updated);
    queryClient.setQueryData(["projects"], (old = []) =>
      old.map((p) =>
        p.id === project.id
          ? {
              ...p,
              tasks_count: updated.length,
              completed_tasks_count: updated.filter(
                (t) => t.status === "completed"
              ).length,
            }
          : p
      )
    );
    try {
      await axios.delete(`http://localhost:8000/api/tasks/${task.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sanctum_token")}`,
        },
      });

      queryClient.setQueryData(["tasks"], (prev = []) =>
        prev.filter((t) => t.id !== task.id)
      );
    } catch {
      queryClient.setQueryData(["tasks", project.id], original);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl min-h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
            <h3 className="text-2xl font-bold text-gray-800">
              Project: {localProject.name}
            </h3>

            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center space-x-1 text-sm"
              >
                <PlusIcon className="size-4" />
                <span>Add Task</span>
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1.5 px-3 rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loadingTasks ? (
          <p className="text-center text-gray-600">Loading tasks...</p>
        ) : (
          <TaskList
            tasks={tasks}
            onEditTask={(task) => {
              setEditTaskErrors({ title: "", status: "" });
              setEditingTask(task);
            }}
            onDeleteTask={setTaskToDelete}
            onShowDetail={setSelectedTaskForDetail}
            search={search}
            setSearch={setSearch}
            pagination={pagination}
            setPagination={setPagination}
            localProject={localProject}
          />
        )}

        {showAddTaskModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 relative">
              <button
                onClick={() => {
                  setAddTaskErrors({ title: "", status: "" });
                  setShowAddTaskModal(false);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Add New Task
                </h3>
                <p className="text-sm text-gray-600">
                  Create a new task to keep track of your progress
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  handleAddTask({
                    title: form.title.value,
                    description: form.description.value,
                    due_date: form.due_date.value,
                    status: form.status.value,
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <FileText size={14} />
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter task title..."
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border ${
                      addTaskErrors.title
                        ? "border-red-500 focus:ring-red-300"
                        : "border-gray-200 focus:ring-blue-500"
                    } focus:border-transparent focus:ring-2 outline-none transition-all bg-white/50 backdrop-blur-sm`}
                  />
                  {addTaskErrors.title && (
                    <p className="text-xs text-red-600 mt-1">
                      {addTaskErrors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <FileText size={14} />
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="2"
                    placeholder="Add task description..."
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm resize-none"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <Calendar size={14} />
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <Clock size={14} />
                    Status
                  </label>
                  <select
                    name="status"
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border ${
                      addTaskErrors.status
                        ? "border-red-500 focus:ring-red-300"
                        : "border-gray-200 focus:ring-blue-500"
                    } focus:border-transparent focus:ring-2 outline-none transition-all bg-white/50 backdrop-blur-sm appearance-none cursor-pointer`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  {addTaskErrors.status && (
                    <p className="text-xs text-red-600 mt-1">
                      {addTaskErrors.status}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAddTaskErrors({ title: "", status: "" });
                      setShowAddTaskModal(false);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl font-medium text-gray-700 bg-gray-100 hover:scale-105 hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl font-medium text-white bg-blue-500 hover:scale-105 hover:bg-blue-600 transition-all duration-200 shadow-lg"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingTask && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 relative">
              <button
                onClick={() => setEditingTask(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Edit Task
                </h3>
                <p className="text-sm text-gray-600">
                  Update your task details
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  handleUpdateTask(editingTask.id, {
                    title: form.title.value,
                    description: form.description.value,
                    due_date: form.due_date.value,
                    status: form.status.value,
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <FileText size={14} />
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingTask.title}
                    placeholder="Enter task title..."
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border ${
                      editTaskErrors.title
                        ? "border-red-500 focus:ring-red-300"
                        : "border-gray-200 focus:ring-blue-500"
                    } focus:border-transparent focus:ring-2 outline-none transition-all bg-white/50 backdrop-blur-sm`}
                  />
                  {editTaskErrors.title && (
                    <p className="text-xs text-red-600 mt-1">
                      {editTaskErrors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <FileText size={14} />
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingTask.description}
                    rows="2"
                    placeholder="Add task description..."
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm resize-none"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <Calendar size={14} />
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    defaultValue={editingTask.due_date}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <Clock size={14} />
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingTask.status}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border ${
                      editTaskErrors.status
                        ? "border-red-500 focus:ring-red-300"
                        : "border-gray-200 focus:ring-blue-500"
                    } focus:border-transparent focus:ring-2 outline-none transition-all bg-white/50 backdrop-blur-sm appearance-none cursor-pointer`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  {editTaskErrors.status && (
                    <p className="text-xs text-red-600 mt-1">
                      {editTaskErrors.status}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:scale-105 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl font-medium text-white bg-blue-500 hover:scale-105 hover:bg-blue-600 transition-all duration-200 shadow-lg"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {taskToDelete && (
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
                  Confirm Delete
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-2">
                  Are you sure you want to delete this task?
                </p>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setTaskToDelete(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDelete(taskToDelete)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {selectedTaskForDetail && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="relative bg-slate-800 rounded-t-2xl p-6 text-white flex-shrink-0">
                <button
                  onClick={() => setSelectedTaskForDetail(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-slate-700 rounded-full">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedTaskForDetail.title}
                    </h3>
                    <p className="text-slate-300 text-sm">Task Details</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
                {/* Project */}
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Tag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Project
                    </p>
                    <p className="text-gray-900 font-medium">
                      {selectedTaskForDetail.project?.name ||
                        "Not in any project"}
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
                      {selectedTaskForDetail.description ||
                        "No description provided."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Status
                    </p>
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedTaskForDetail.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : selectedTaskForDetail.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {formatStatusText(selectedTaskForDetail.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Due Date
                    </p>
                    <p className="text-gray-900 font-medium">
                      {selectedTaskForDetail.due_date
                        ? (() => {
                            const date = new Date(
                              selectedTaskForDetail.due_date
                            ).toLocaleDateString("en-GB", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              timeZone: "Asia/Jakarta",
                            });
                            const parts = date.split(" ");
                            return `${parts[0]}, ${parts.slice(1).join(" ")}`;
                          })()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 p-6 flex-shrink-0">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedTaskForDetail(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { ProjectMiniDashboardModal };
