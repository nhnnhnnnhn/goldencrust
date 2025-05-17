'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { CategoryDialog } from './category-dialog';
import { useDeleteCategoryMutation } from '@/redux/api/categoryApi';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { getTranslation } from '@/utils/translations';

interface Category {
  _id: string;
  name: string;
  description: string;
  status: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryDataTableProps {
  data: Category[];
  language: "en" | "vi";
}

export function CategoryDataTable({ data, language }: CategoryDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory] = useDeleteCategoryMutation();
  const t = getTranslation(language);

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: t.dashboard.categoryName,
    },
    {
      accessorKey: 'description',
      header: t.dashboard.categoryDesc,
    },
    {
      accessorKey: 'status',
      header: t.dashboard.categoryStatus,
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? 'default' : 'secondary'}>
          {row.original.status === "active" ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const category = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditCategory(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                try {
                  await deleteCategory(category._id).unwrap();
                  toast.success(t.dashboard.categoryDeleted);
                } catch (error) {
                  toast.error(t.dashboard.categoryError);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <CategoryDialog
        open={!!editCategory}
        onOpenChange={() => setEditCategory(null)}
        category={editCategory}
        language={language}
      />
    </div>
  );
} 