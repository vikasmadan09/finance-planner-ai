import React from "react";
import { format } from "date-fns";

import { toZonedTime } from "date-fns-tz";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnFiltersState,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import SkeletonTable from "./SkeletonTable";

type Expense = {
  date: string;
  category: string;
  amount: string;
  display_amount: string;
};

interface ExpenseListProps {
  expenses: Expense[];
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const columns = React.useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        header: "Date",
        accessorKey: "timestamp",
        filterFn: "includesString",
        cell: (info) => {
          const raw = info.getValue() as string;
          const utcDate = new Date(raw);
          const localDate = toZonedTime(utcDate, userTimeZone);
          return format(localDate, "yyyy-MM-dd HH:mm:ss");
        },
      },
      {
        header: "Amount",
        accessorKey: "amount",
        filterFn: "includesString",
        cell: ({ row }) => row.original.display_amount,
      },
      {
        header: "Item",
        accessorKey: "item",
        filterFn: "includesString",
        cell: (info) => `${info.getValue()}`, // Optional: format amount
      },
      {
        header: "Category",
        accessorKey: "category",
        filterFn: "includesString",
        cell: (info) => info.getValue(),
      },
      {
        header: "Notes",
        accessorKey: "notes",
        filterFn: "includesString",
        cell: (info) => info.getValue(),
      },
    ],
    []
  );

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "timestamp", desc: true }, // 👈 default sort: date DESC
  ]);

  const table = useReactTable({
    data: expenses,
    columns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    enableColumnFilters: true,
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  return (
    <>
      <div className="mt-8 w-full">
        {/* Global Filter Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border px-4 py-2 rounded w-full max-w-xs"
          />
        </div>
        {/* Table */}
        <table className="bg-white w-full rounded shadow text-sm">
          <thead className="bg-gray-100 text-left">
            {table.getHeaderGroups().map((headerGroup) => (
              <React.Fragment key={headerGroup.id}>
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-2 cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" ? " 🔼" : ""}
                      {header.column.getIsSorted() === "desc" ? " 🔽" : ""}
                    </th>
                  ))}
                </tr>
                <tr>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-2">
                      {header.column.getCanFilter() ? (
                        <input
                          type="text"
                          value={
                            (header.column.getFilterValue() ?? "") as string
                          }
                          onChange={(e) =>
                            header.column.setFilterValue(e.target.value)
                          }
                          className="border px-2 py-1 rounded w-full"
                          placeholder={`Filter`}
                        />
                      ) : null}
                    </th>
                  ))}
                </tr>
              </React.Fragment>
            ))}
          </thead>
          {expenses.length > 0 ? (
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : (
            <SkeletonTable rows={table.getState().pagination.pageSize} />
          )}
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="flex items-center gap-2 mr-15">
            <label htmlFor="pageSize" className="text-sm font-medium">
              Page size:
            </label>
            <select
              id="pageSize"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="border px-2 py-1 rounded"
            >
              {[5, 10, 20, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
