'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProject } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardFooter, Button, Input, Textarea, Select } from '@/components/ui';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const projectSchema = z.object({
  name: z.string().min(3, 'اسم المشروع يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  type: z.enum(['needs_assessment', 'intervention', 'evaluation', 'mixed'], {
    required_error: 'يرجى اختيار نوع المشروع',
  }),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
  startDate: z.string().min(1, 'تاريخ البدء مطلوب'),
  endDate: z.string().min(1, 'تاريخ الانتهاء مطلوب'),
  location: z.string().min(1, 'الموقع مطلوب'),
  targetGroups: z.array(z.string()).min(1, 'يجب إضافة فئة مستهدفة واحدة على الأقل'),
  budget: z.object({
    total: z.number().min(0, 'الميزانية يجب أن تكون رقم موجب'),
    currency: z.string().default('SAR'),
    spent: z.number().default(0),
  }),
  goals: z.object({
    short_term: z.array(z.string()).min(1, 'يجب إضافة هدف قصير المدى واحد على الأقل'),
    long_term: z.array(z.string()).min(1, 'يجب إضافة هدف طويل المدى واحد على الأقل'),
  }),
  tags: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const typeOptions = [
  { value: 'intervention', label: 'تدخل' },
  { value: 'needs_assessment', label: 'دراسة احتياج' },
  { value: 'evaluation', label: 'تقييم' },
  { value: 'mixed', label: 'مختلط' },
];

const statusOptions = [
  { value: 'draft', label: 'مسودة' },
  { value: 'active', label: 'نشط' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'archived', label: 'مؤرشف' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'intervention',
      status: 'draft',
      startDate: '',
      endDate: '',
      location: '',
      targetGroups: [''],
      budget: {
        total: 0,
        currency: 'SAR',
        spent: 0,
      },
      goals: {
        short_term: [''],
        long_term: [''],
      },
      tags: [],
    },
  });

  const {
    fields: targetGroupFields,
    append: appendTargetGroup,
    remove: removeTargetGroup,
  } = useFieldArray({
    control,
    name: 'targetGroups' as never,
  });

  const {
    fields: shortTermGoalFields,
    append: appendShortTermGoal,
    remove: removeShortTermGoal,
  } = useFieldArray({
    control,
    name: 'goals.short_term' as never,
  });

  const {
    fields: longTermGoalFields,
    append: appendLongTermGoal,
    remove: removeLongTermGoal,
  } = useFieldArray({
    control,
    name: 'goals.long_term' as never,
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // تحويل التواريخ لصيغة ISO 8601 الكاملة
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        // تصفية القيم الفارغة من المصفوفات
        targetGroups: data.targetGroups.filter((g) => g.trim() !== ''),
        goals: {
          short_term: data.goals.short_term.filter((g) => g.trim() !== ''),
          long_term: data.goals.long_term.filter((g) => g.trim() !== ''),
        },
        tags: data.tags?.filter((t) => t.trim() !== '') || [],
      };
      console.log('Sending data:', JSON.stringify(formattedData, null, 2));
      await createProject.mutateAsync(formattedData);
      router.push('/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div>
      <PageHeader
        title="إنشاء مشروع جديد"
        subtitle="أدخل بيانات المشروع الأساسية"
        backLink="/projects"
        breadcrumbs={[
          { label: 'المشاريع', href: '/projects' },
          { label: 'إنشاء مشروع جديد' },
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
              {...register('name')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="النوع"
                options={typeOptions}
                value={watch('type')}
                onChange={(value) => setValue('type', value as ProjectFormData['type'])}
                required
                error={errors.type?.message}
              />
              <Select
                label="الحالة"
                options={statusOptions}
                value={watch('status')}
                onChange={(value) => setValue('status', value as ProjectFormData['status'])}
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="الوصف"
                placeholder="أدخل وصفاً تفصيلياً للمشروع"
                required
                rows={4}
                error={errors.description?.message}
                {...register('description')}
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
              {...register('startDate')}
            />
            <Input
              label="تاريخ الانتهاء"
              type="date"
              required
              error={errors.endDate?.message}
              {...register('endDate')}
            />
            <Input
              label="الموقع"
              placeholder="المدينة أو المنطقة"
              required
              error={errors.location?.message}
              {...register('location')}
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
                onClick={() => appendTargetGroup('')}
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
              <p className="text-sm text-danger-600">{errors.targetGroups.message}</p>
            )}
          </div>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader title="الميزانية" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="إجمالي الميزانية"
              type="number"
              placeholder="0"
              required
              error={errors.budget?.total?.message}
              {...register('budget.total', { valueAsNumber: true })}
            />
            <Select
              label="العملة"
              options={[
                { value: 'SAR', label: 'ريال سعودي (SAR)' },
                { value: 'USD', label: 'دولار أمريكي (USD)' },
                { value: 'EUR', label: 'يورو (EUR)' },
              ]}
              value={watch('budget.currency')}
              onChange={(value) => setValue('budget.currency', value)}
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
                <h4 className="font-medium text-secondary-700">الأهداف قصيرة المدى</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => appendShortTermGoal('')}
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
                <h4 className="font-medium text-secondary-700">الأهداف طويلة المدى</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => appendLongTermGoal('')}
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

        {/* Actions */}
        <Card>
          <CardFooter>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              إلغاء
            </Button>
            <Button type="submit" isLoading={createProject.isPending}>
              إنشاء المشروع
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
