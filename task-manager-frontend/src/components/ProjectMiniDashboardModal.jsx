import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { PlusIcon, SearchIcon } from "../assets/icons/Icons.jsx";

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
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-white rounded-lg shadow-md mt-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Project Tasks</h3>
        <p className="text-sm text-gray-600 mt-1">
          Description:{" "}
          {tasks.length > 0 && tasks[0].project?.description
            ? tasks[0].project.description
            : "None"}
        </p>
      </div>

      <div className="overflow-x-auto">
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
                  key={cell.id}
                  className={`px-6 py-4 text-sm align-top text-${
                    cell.column.columnDef.meta?.align || "left"
                  }`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`${
                    row.original.isOptimistic ? "opacity-50 animate-pulse" : ""
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
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      if (cachedTasks && cachedTasks.projectId === project.id) {
        setTasks(cachedTasks.tasks);
        setLoadingTasks(false);
        return;
      }
      setLoadingTasks(true);
      try {
        const authToken = localStorage.getItem("sanctum_token");
        const res = await axios.get(
          `http://localhost:8000/api/tasks?project_id=${project.id}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setTasks(res.data.tasks);
        onProjectTasksUpdated(
          project.id,
          res.data.tasks.length,
          res.data.tasks.filter((t) => t.status === "completed").length,
          res.data.tasks
        );
      } catch (err) {
        setError("Failed to fetch tasks.");
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [project.id]);

  const updateProjectCounts = (updatedTasks) => {
    onProjectTasksUpdated(
      project.id,
      updatedTasks.length,
      updatedTasks.filter((t) => t.status === "completed").length,
      updatedTasks
    );
  };

  const handleAddTask = async (form) => {
    const optimisticId = `temp-${Date.now()}`;
    const optimisticTask = {
      ...form,
      id: optimisticId,
      isOptimistic: true,
      project,
    };
    const updated = [optimisticTask, ...tasks];
    setTasks(updated);
    updateProjectCounts(updated);
    setShowAddTaskModal(false);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/tasks",
        { ...form, project_id: project.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("sanctum_token")}`,
          },
        }
      );
      const final = updated.map((t) =>
        t.id === optimisticId ? { ...res.data.task, project } : t
      );
      setTasks(final);
      updateProjectCounts(final);
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== optimisticId));
    }
  };

  const handleUpdateTask = async (taskId, data) => {
    const original = [...tasks];
    const optimistic = tasks.map((t) =>
      t.id === taskId ? { ...t, ...data, isOptimistic: true } : t
    );
    setTasks(optimistic);
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
      const final = tasks.map((t) =>
        t.id === taskId ? { ...res.data.task, project } : t
      );
      setTasks(final);
      updateProjectCounts(final);
    } catch {
      setTasks(original);
    }
  };

  const handleConfirmDelete = async (task) => {
    const original = [...tasks];
    const updated = tasks.filter((t) => t.id !== task.id);
    setTasks(updated);
    setTaskToDelete(null);
    updateProjectCounts(updated);
    try {
      await axios.delete(`http://localhost:8000/api/tasks/${task.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sanctum_token")}`,
        },
      });
    } catch {
      setTasks(original);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl min-h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
            <h3 className="text-2xl font-bold text-gray-800">
              Project: {project.name}
            </h3>

            {/* Search Box */}
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
            onEditTask={setEditingTask}
            onDeleteTask={setTaskToDelete}
            onShowDetail={(task) =>
              alert(
                `Title: ${task.title}\nDescription: ${
                  task.description || "No description"
                }\nDue: ${task.due_date || "N/A"}`
              )
            }
            search={search}
            setSearch={setSearch}
          />
        )}

        {/* Modal Add Task */}
        {showAddTaskModal && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Add Task</h3>
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
              >
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  required
                  className="mb-2 w-full border p-2 rounded"
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  className="mb-2 w-full border p-2 rounded"
                ></textarea>
                <input
                  type="date"
                  name="due_date"
                  className="mb-2 w-full border p-2 rounded"
                />
                <select
                  name="status"
                  className="mb-4 w-full border p-2 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Edit Task */}
        {editingTask && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Edit Task
              </h3>
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
              >
                <input
                  type="text"
                  name="title"
                  defaultValue={editingTask.title}
                  required
                  className="mb-2 w-full border p-2 rounded"
                />
                <textarea
                  name="description"
                  defaultValue={editingTask.description}
                  className="mb-2 w-full border p-2 rounded"
                ></textarea>
                <input
                  type="date"
                  name="due_date"
                  defaultValue={editingTask.due_date}
                  className="mb-2 w-full border p-2 rounded"
                />
                <select
                  name="status"
                  defaultValue={editingTask.status}
                  className="mb-4 w-full border p-2 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Delete Task */}
        {taskToDelete && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Confirm Delete
              </h3>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete this task?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setTaskToDelete(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDelete(taskToDelete)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { ProjectMiniDashboardModal };
