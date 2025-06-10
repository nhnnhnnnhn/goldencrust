"use client";

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CategoryDataTable } from './_components/category-data-table';
import { CategoryDialog } from './_components/category-dialog';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import { LoadingPage } from '@/components/loading';
import { getTranslation } from '@/utils/translations';
import { useToast } from "@/hooks/use-toast"

export default function CategoriesPage() {
  const [open, setOpen] = useState(false);
  const { data: categoryData, isLoading } = useGetCategoriesQuery();
  const [language, setLanguage] = useState<"en" | "vi">("en");
  const { toast } = useToast();

  useEffect(() => {
    // Get initial language
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null;
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage);
    }

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language" && (e.newValue === "en" || e.newValue === "vi")) {
        setLanguage(e.newValue);
      }
    }

    // Listen for custom language change event (from same tab)
    const handleLanguageChange = (e: CustomEvent<"en" | "vi">) => {
      setLanguage(e.detail);
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("languageChange", handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("languageChange", handleLanguageChange as EventListener);
    }
  }, []);

  const t = getTranslation(language);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!categoryData) {
    toast({
      title: t.dashboard.errorTitle,
      description: t.dashboard.errorMessage,
      variant: "destructive",
    });
    return null;
  }

  const categories = categoryData.categories.map((category) => ({
    _id: category._id,
    name: category.name,
    description: category.description,
    status: category.status,
    slug: category.slug,
    createdAt: new Date(category.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US"),
    updatedAt: category.updatedAt
  }));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t.dashboard.categoryManagement}</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t.dashboard.addNewCategory}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.allCategories}</CardTitle>
          <CardDescription>
            {t.dashboard.categoryDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryDataTable data={categories} language={language} />
        </CardContent>
      </Card>

      <CategoryDialog open={open} onOpenChange={setOpen} language={language} />
    </div>
  );
} 