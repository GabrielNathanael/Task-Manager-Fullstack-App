import React from 'react';

const ProjectCardSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-gray-200 animate-pulse h-40">
        <div className="flex justify-between items-start mb-4">
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
        </div>
        <div className="border-t border-dashed border-gray-300 my-4"></div>
        <div className="flex justify-between text-sm">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
        <div className="mt-4 text-right">
            <div className="h-8 w-20 bg-gray-300 rounded-lg inline-block"></div>
        </div>
    </div>
);

export default ProjectCardSkeleton;
