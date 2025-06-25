<?php

return [
    'project_id' => env('FIREBASE_PROJECT_ID'),
    'credentials' => storage_path('app/' . env('FIREBASE_CREDENTIALS')),
];