import React from "react";
import {
  DoubleArrowNext,
  DoubleArrowPrev,
  SingleArrowNext,
  SingleArrowPrev,
} from "../assets/icons/Icons";

const Pagination = ({ pageIndex, pageCount, setPageIndex }) => {
  const maxVisible = 5;

  const getPageNumbers = () => {
    const pages = [];

    const start = Math.max(1, pageIndex + 1 - Math.floor(maxVisible / 2));
    const end = Math.min(pageCount, start + maxVisible - 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("ellipsis-start");
    }

    for (let i = start; i <= end && i <= pageCount; i++) {
      pages.push(i);
    }

    if (end < pageCount) {
      if (end < pageCount - 1) pages.push("ellipsis-end");
      pages.push(pageCount);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex justify-center mt-4 space-x-1">
      <button
        onClick={() => setPageIndex(0)}
        disabled={pageIndex === 0}
        className="px-1.5 py-0.5 text-xs border rounded disabled:opacity-50"
        aria-label="First page"
      >
        <DoubleArrowPrev />
      </button>
      <button
        onClick={() => setPageIndex(pageIndex - 1)}
        disabled={pageIndex === 0}
        className="px-1.5 py-0.5 text-xs border rounded disabled:opacity-50"
        aria-label="Previous page"
      >
        <SingleArrowPrev />
      </button>

      {pages.map((p, i) =>
        typeof p === "string" ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 py-1 text-sm text-gray-500"
          >
            ...
          </span>
        ) : (
          <button
            key={`page-${p}`}
            onClick={() => setPageIndex(p - 1)}
            className={`px-1.5 py-0.5 text-sm border rounded ${
              p - 1 === pageIndex ? "bg-black text-white" : ""
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => setPageIndex(pageIndex + 1)}
        disabled={pageIndex >= pageCount - 1}
        className="px-1.5 py-0.5 text-xs border rounded disabled:opacity-50"
        aria-label="Next page"
      >
        <SingleArrowNext />
      </button>
      <button
        onClick={() => setPageIndex(pageCount - 1)}
        disabled={pageIndex >= pageCount - 1}
        className="px-1.5 py-0.5 text-sm border rounded disabled:opacity-50"
        aria-label="Last page"
      >
        <DoubleArrowNext />
      </button>
    </div>
  );
};

export default Pagination;
