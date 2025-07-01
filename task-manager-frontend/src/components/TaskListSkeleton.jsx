import React from 'react';

const TaskListSkeleton = () => {
  const skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="bg-white rounded-lg shadow-md mt-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]"></th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]"></th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]"></th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {skeletonRows.map(index => (
                <tr key={index}>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mx-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mx-auto"></div></td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-3">
                      <div className="h-6 w-12 bg-gray-200 rounded-md animate-pulse"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskListSkeleton;
