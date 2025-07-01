<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $query = $user->tasks()->with('project');

        if ($request->has('project_id') && $request->input('project_id') !== null) {
            $projectId = $request->input('project_id');
            if ($projectId === 'null') {
                $query->whereNull('project_id');
            } else {
                $query->where('project_id', $projectId);
            }
        }

        $tasks = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'message' => 'Tasks retrieved successfully.',
            'tasks' => $tasks
        ], 200);
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $task = $user->tasks()->create([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status ?? 'pending',
            'due_date' => $request->due_date,
            'project_id' => $request->project_id,
        ]);

        $task->load('project');

        return response()->json([
            'message' => 'Task created successfully.',
            'task' => $task
        ], 201);
    }

    public function update(Request $request, Task $task)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->id !== $task->user_id) {
            return response()->json(['message' => 'Unauthorized: You do not own this task.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $task->update([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'due_date' => $request->due_date,
            'project_id' => $request->project_id,
        ]);
        
        $task->load('project');

        return response()->json([
            'message' => 'Task updated successfully.',
            'task' => $task
        ], 200);
    }
    
    public function destroy(Task $task)
    {
        $user = Auth::user();

        if ($user->id !== $task->user_id) {
            return response()->json(['message' => 'Unauthorized: You do not own this task.'], 403);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.'
        ], 200);
    }
}
