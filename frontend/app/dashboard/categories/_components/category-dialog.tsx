'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '@/redux/api/categoryApi';
import { toast } from 'sonner';
import { getTranslation } from '@/utils/translations';

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.string().default("active"),
});

interface Category {
  _id: string;
  name: string;
  description: string;
  status: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  language: "en" | "vi";
}

export function CategoryDialog({ open, onOpenChange, category, language }: CategoryDialogProps) {
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const t = getTranslation(language);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      status: "active",
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description,
        status: category.status,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        status: "active",
      });
    }
  }, [category, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (category) {
        await updateCategory({
          id: category._id,
          body: values,
        }).unwrap();
        toast.success(t.dashboard.categoryUpdated);
      } else {
        await createCategory(values).unwrap();
        toast.success(t.dashboard.categoryCreated);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(t.dashboard.categoryError);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? t.dashboard.editCategory : t.dashboard.createCategory}
          </DialogTitle>
          <DialogDescription>
            {t.dashboard.categoryDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.dashboard.categoryName}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.dashboard.categoryDesc}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t.dashboard.categoryStatus}
                    </FormLabel>
                    <FormDescription>
                      {t.dashboard.activateCategory}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "active"}
                      onCheckedChange={(checked) => field.onChange(checked ? "active" : "inactive")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {category ? t.dashboard.editCategory : t.dashboard.createCategory}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 