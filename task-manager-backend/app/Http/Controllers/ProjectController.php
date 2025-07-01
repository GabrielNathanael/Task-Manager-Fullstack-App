<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $projects = $user->projects()
            ->withCount('tasks')
            ->withCount(['tasks as completed_tasks_count' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'Projects retrieved successfully.',
            'projects' => $projects
        ], 200);
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7', // <<--- TAMBAHKAN INI (untuk format hex color)
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project = $user->projects()->create([
            'name' => $request->name,
            'description' => $request->description,
            'color' => $request->color ?? '#FFFFFF', // <<--- SIMPAN COLOR, default putih
        ]);

        return response()->json([
            'message' => 'Project created successfully.',
            'project' => $project
        ], 201);
    }

    public function update(Request $request, Project $project)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->id !== $project->user_id) {
            return response()->json(['message' => 'Unauthorized: You do not own this project.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7', // <<--- TAMBAHKAN INI
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project->update([
            'name' => $request->name,
            'description' => $request->description,
            'color' => $request->color ?? '#FFFFFF', // <<--- SIMPAN COLOR
        ]);

        return response()->json([
            'message' => 'Project updated successfully.',
            'project' => $project
        ], 200);
    }

    public function destroy(Project $project)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->id !== $project->user_id) {
            return response()->json(['message' => 'Unauthorized: You do not own this project.'], 403);
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully.'
        ], 200);
    }
}