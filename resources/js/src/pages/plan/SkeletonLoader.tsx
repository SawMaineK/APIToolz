import React from "react";

export default function SkeletonLoader() {
  return (
    <div className="p-6 max-w-3xl">
      {/* AI Info Banner */}
      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-3 w-80 bg-gray-100 rounded animate-pulse"></div>

      <hr className="my-6" />

      {/* Business Problem Section */}
      <div className="mb-6">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-3"></div>
        <div className="h-4 w-72 bg-gray-100 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
      </div>

      {/* Purpose Section */}
      <div className="mb-6">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
          <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>

      {/* User Requirements Section */}
      <div className="mb-4">
        <div className="h-5 w-44 bg-gray-200 rounded animate-pulse mb-3"></div>

        {/* Fake User Card */}
        <div className="flex gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-52 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Bullet List Placeholder */}
        <ul className="space-y-2">
          <li className="h-4 w-5/6 bg-gray-100 rounded animate-pulse"></li>
          <li className="h-4 w-4/6 bg-gray-100 rounded animate-pulse"></li>
          <li className="h-4 w-3/6 bg-gray-100 rounded animate-pulse"></li>
        </ul>
      </div>
    </div>
  );
}
