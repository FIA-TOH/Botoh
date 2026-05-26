'use client';

import React, { useEffect, useMemo, useState } from 'react';

interface PaginationLabels {
  rowsPerPage: string;
  page: string;
  pageOf: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
}

export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const rows = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  return { rows, page, pageSize, totalPages, setPage, setPageSize };
}

interface Props {
  labels: PaginationLabels;
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
}

export function PaginationControls({
  labels,
  page,
  pageSize,
  totalPages,
  setPage,
  setPageSize,
}: Props) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-300">
      <label className="flex items-center gap-2">
        <span>{labels.rowsPerPage}</span>
        <select
          className="rounded bg-gray-700 px-2 py-1 text-white"
          value={pageSize}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
        >
          {[5, 10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>
      <div className="flex items-center gap-2">
        <span>{labels.page} {page} {labels.pageOf} {totalPages}</span>
        <button type="button" aria-label={labels.firstPage} title={labels.firstPage} disabled={page === 1} onClick={() => setPage(1)} className="rounded bg-gray-700 px-2 py-1 disabled:opacity-40">|&lt;</button>
        <button type="button" aria-label={labels.previousPage} title={labels.previousPage} disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded bg-gray-700 px-2 py-1 disabled:opacity-40">&lt;</button>
        <button type="button" aria-label={labels.nextPage} title={labels.nextPage} disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded bg-gray-700 px-2 py-1 disabled:opacity-40">&gt;</button>
        <button type="button" aria-label={labels.lastPage} title={labels.lastPage} disabled={page === totalPages} onClick={() => setPage(totalPages)} className="rounded bg-gray-700 px-2 py-1 disabled:opacity-40">&gt;|</button>
      </div>
    </div>
  );
}
