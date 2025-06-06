'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { getTranslation } from '@/utils/translations';

interface Category {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

interface CategoryDataTableProps {
  data: Category[];
  language: "en" | "vi";
}

export function CategoryDataTable({ data, language }: CategoryDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteCategory] = useDeleteCategoryMutation();
  const t = getTranslation(language);

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete._id).unwrap();
      toast.success(t.dashboard.categoryDeleted);
      setCategoryToDelete(null);
    } catch (error) {
      toast.error(t.dashboard.categoryError);
    }
  };

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
              onClick={() => handleDeleteClick(category)}
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

      <CategoryDialog
        open={!!editCategory}
        onOpenChange={() => setEditCategory(null)}
        category={editCategory}
        language={language}
      />

      {/* Delete Confirmation Dialog */}
      {categoryToDelete && (
        <Dialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete.name}"?</p>
              <p className="text-sm text-gray-500 mt-2">
                Lưu ý: Việc xóa danh mục có thể ảnh hưởng đến các món ăn thuộc danh mục này.
              </p>
            </div>
            <DialogFooter>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setCategoryToDelete(null)} className="sm:mr-2">
                  Hủy
                </Button>
                <Button onClick={handleConfirmDelete} variant="destructive">
                  Xóa
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 