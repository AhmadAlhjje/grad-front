"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProject, useUpdateProject } from "@/hooks";
import { PageHeader } from "@/components/layout";
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  Input,
  Textarea,
  Select,
  Loading,
  ErrorState,
} from "@/components/ui";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

const isValidDate = (str: string) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(str)) return false;
  const d = new Date(str);
  return d.toISOString().slice(0, 10) === str;
};

const projectSchema = z.object({
  name: z.string().min(3, "اسم المشروع يجب أن يكون 3 أحرف على الأقل"),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  type: z.enum(["needs_assessment", "intervention", "evaluation", "mixed"], {
    required_error: "يرجى اختيار نوع المشروع",
  }),
  status: z.enum(["draft", "active", "completed", "archived"]).default("draft"),

  startDate: z
    .string()
    .refine(isValidDate, { message: "تاريخ البدء غير صالح" }),
  endDate: z
    .string()
    .refine(isValidDate, { message: "تاريخ الانتهاء غير صالح" }),
  location: z.string().min(1, "الموقع مطلوب"),
  targetGroups: z
    .array(z.string())
    .min(1, "يجب إضافة فئة مستهدفة واحدة على الأقل"),
  budget: z.object({
    total: z.number().min(0, "الميزانية يجب أن تكون رقم موجب"),
    currency: z.string().default("SAR"),
    spent: z.number().default(0),
  }),
  goals: z.object({
    short_term: z
      .array(z.string())
      .min(1, "يجب إضافة هدف قصير المدى واحد على الأقل"),
    long_term: z
      .array(z.string())
      .min(1, "يجب إضافة هدف طويل المدى واحد على الأقل"),
  }),
  tags: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const typeOptions = [
  { value: "intervention", label: "تدخل" },
  { value: "needs_assessment", label: "دراسة احتياج" },
  { value: "evaluation", label: "تقييم" },
  { value: "mixed", label: "مختلط" },
];

const statusOptions = [
  { value: "draft", label: "مسودة" },
  { value: "active", label: "نشط" },
  { value: "completed", label: "مكتمل" },
  { value: "archived", label: "مؤرشف" },
];

export default function EditProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: project, isLoading, error, refetch } = useProject(id);
  const updateProject = useUpdateProject();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "intervention",
      status: "draft",
      startDate: "",
      endDate: "",
      location: "",
      targetGroups: [""],
      budget: {
        total: 0,
        currency: "SAR",
        spent: 0,
      },
      goals: {
        short_term: [""],
        long_term: [""],
      },
      tags: [],
    },
  });

  // تعبئة النموذج ببيانات المشروع عند تحميلها
  useEffect(() => {
    if (project) {
      const formatDateForInput = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
      };

      reset({
        name: project.name,
        description: project.description,
        type: project.type,
        status: project.status,
        startDate: formatDateForInput(project.startDate),
        endDate: formatDateForInput(project.endDate),
        location: project.location,
        targetGroups:
          project.targetGroups.length > 0 ? project.targetGroups : [""],
        budget: {
          total: project.budget.total,
          currency: project.budget.currency,
          spent: project.budget.spent,
        },
        goals: {
          short_term:
            project.goals.short_term.length > 0
              ? project.goals.short_term
              : [""],
          long_term:
            project.goals.long_term.length > 0 ? project.goals.long_term : [""],
        },
        tags: project.tags || [],
      });
    }
  }, [project, reset]);

  const {
    fields: targetGroupFields,
    append: appendTargetGroup,
    remove: removeTargetGroup,
  } = useFieldArray({
    control,
    name: "targetGroups" as never,
  });

  const {
    fields: shortTermGoalFields,
    append: appendShortTermGoal,
    remove: removeShortTermGoal,
  } = useFieldArray({
    control,
    name: "goals.short_term" as never,
  });

  const {
    fields: longTermGoalFields,
    append: appendLongTermGoal,
    remove: removeLongTermGoal,
  } = useFieldArray({
    control,
    name: "goals.long_term" as never,
  });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control,
    name: "tags" as never,
  });

  const toISODate = (dateString: string): string => {
    if (!dateString) {
      throw new Error("Date string is empty");
    }
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return date.toISOString();
  };

  const onSubmit = async (data: ProjectFormData) => {
    console.log("Raw form data:", data.startDate, data.endDate);
    try {
      const formattedData = {
        ...data,
        startDate: toISODate(data.startDate),
        endDate: toISODate(data.endDate),
        targetGroups: data.targetGroups.filter((g) => g.trim() !== ""),
        goals: {
          short_term: data.goals.short_term.filter((g) => g.trim() !== ""),
          long_term: data.goals.long_term.filter((g) => g.trim() !== ""),
        },
        tags: data.tags?.filter((t) => t.trim() !== "") || [],
      };
 console.log("Formatted data:", formattedData.startDate, formattedData.endDate);
      await updateProject.mutateAsync({ id, data: formattedData });
      router.push(`/projects/${id}`);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading text="جاري تحميل بيانات المشروع..." />
      </div>
    );
  }

  if (error || !project) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title="تعديل المشروع"
        subtitle={project.name}
        backLink={`/projects/${id}`}
        breadcrumbs={[
          { label: "المشاريع", href: "/projects" },
          { label: project.name, href: `/projects/${id}` },
          { label: "تعديل" },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader title="المعلومات الأساسية" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="اسم المشروع"
              placeholder="أدخل اسم المشروع"
              required
              error={errors.name?.message}
              {...register("name")}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="النوع"
                options={typeOptions}
                value={watch("type")}
                onChange={(value) =>
                  setValue("type", value as ProjectFormData["type"])
                }
                required
                error={errors.type?.message}
              />
              <Select
                label="الحالة"
                options={statusOptions}
                value={watch("status")}
                onChange={(value) =>
                  setValue("status", value as ProjectFormData["status"])
                }
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="الوصف"
                placeholder="أدخل وصفاً تفصيلياً للمشروع"
                required
                rows={4}
                error={errors.description?.message}
                {...register("description")}
              />
            </div>
          </div>
        </Card>

        {/* Dates & Location */}
        <Card>
          <CardHeader title="التوقيت والموقع" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="تاريخ البدء"
              type="date"
              required
              error={errors.startDate?.message}
              {...register("startDate")}
            />
            <Input
              label="تاريخ الانتهاء"
              type="date"
              required
              error={errors.endDate?.message}
              {...register("endDate")}
            />
            <Input
              label="الموقع"
              placeholder="المدينة أو المنطقة"
              required
              error={errors.location?.message}
              {...register("location")}
            />
          </div>
        </Card>

        {/* Target Groups */}
        <Card>
          <CardHeader
            title="الفئات المستهدفة"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<PlusIcon className="h-4 w-4" />}
                onClick={() => appendTargetGroup("")}
              >
                إضافة فئة
              </Button>
            }
          />
          <div className="space-y-3">
            {targetGroupFields.map((field, index) => (
              <div key={field.id} className="flex gap-3">
                <Input
                  placeholder="مثال: الشباب 18-25"
                  {...register(`targetGroups.${index}`)}
                  className="flex-1"
                />
                {targetGroupFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTargetGroup(index)}
                  >
                    <XMarkIcon className="h-5 w-5 text-danger-500" />
                  </Button>
                )}
              </div>
            ))}
            {errors.targetGroups?.message && (
              <p className="text-sm text-danger-600">
                {errors.targetGroups.message}
              </p>
            )}
          </div>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader title="الميزانية" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="إجمالي الميزانية"
              type="number"
              placeholder="0"
              required
              error={errors.budget?.total?.message}
              {...register("budget.total", { valueAsNumber: true })}
            />
            <Input
              label="المصروف"
              type="number"
              placeholder="0"
              error={errors.budget?.spent?.message}
              {...register("budget.spent", { valueAsNumber: true })}
            />
            <Select
              label="العملة"
              options={[
                { value: "SAR", label: "ريال سعودي (SAR)" },
                { value: "USD", label: "دولار أمريكي (USD)" },
                { value: "EUR", label: "يورو (EUR)" },
              ]}
              value={watch("budget.currency")}
              onChange={(value) => setValue("budget.currency", value)}
            />
          </div>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader title="الأهداف" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Short Term Goals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-secondary-700">
                  الأهداف قصيرة المدى
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => appendShortTermGoal("")}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {shortTermGoalFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder="أدخل الهدف"
                      {...register(`goals.short_term.${index}`)}
                      className="flex-1"
                    />
                    {shortTermGoalFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeShortTermGoal(index)}
                      >
                        <XMarkIcon className="h-4 w-4 text-danger-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Long Term Goals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-secondary-700">
                  الأهداف طويلة المدى
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => appendLongTermGoal("")}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {longTermGoalFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder="أدخل الهدف"
                      {...register(`goals.long_term.${index}`)}
                      className="flex-1"
                    />
                    {longTermGoalFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLongTermGoal(index)}
                      >
                        <XMarkIcon className="h-4 w-4 text-danger-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader
            title="العلامات (Tags)"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<PlusIcon className="h-4 w-4" />}
                onClick={() => appendTag("")}
              >
                إضافة علامة
              </Button>
            }
          />
          <div className="flex flex-wrap gap-3">
            {tagFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  placeholder="علامة"
                  {...register(`tags.${index}`)}
                  className="w-40"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTag(index)}
                >
                  <XMarkIcon className="h-4 w-4 text-danger-500" />
                </Button>
              </div>
            ))}
            {tagFields.length === 0 && (
              <p className="text-sm text-secondary-500">
                لا توجد علامات. اضغط على "إضافة علامة" لإضافة علامة جديدة.
              </p>
            )}
          </div>
        </Card>

        {/* Actions */}
        <Card>
          <CardFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
            <Button type="submit" isLoading={updateProject.isPending}>
              حفظ التغييرات
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
