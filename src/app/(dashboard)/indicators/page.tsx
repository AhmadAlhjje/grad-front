'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks';
import { PageHeader } from '@/components/layout';
import {
  Card,
  CardHeader,
  DataTable,
  Badge,
  Select,
  Button,
  ProgressBar,
  Modal,
  Input,
  Textarea,
} from '@/components/ui';
import { LineChart, BarChart } from '@/components/charts';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

// Mock indicators data
const mockIndicators = [
  {
    id: '1',
    name: 'معدل التوظيف بعد التدريب',
    description: 'نسبة المتدربين الذين حصلوا على وظائف خلال 6 أشهر',
    category: 'نتائج',
    type: 'percentage',
    target: 70,
    current: 65,
    baseline: 30,
    unit: '%',
    frequency: 'quarterly',
    trend: 'up' as const,
    project: 'برنامج التدريب المهني',
  },
  {
    id: '2',
    name: 'عدد المستفيدين',
    description: 'إجمالي عدد المستفيدين من البرنامج',
    category: 'مخرجات',
    type: 'number',
    target: 500,
    current: 423,
    baseline: 0,
    unit: 'مستفيد',
    frequency: 'monthly',
    trend: 'up' as const,
    project: 'برنامج التمكين الاقتصادي',
  },
  {
    id: '3',
    name: 'درجة رضا المستفيدين',
    description: 'متوسط درجة الرضا من 5',
    category: 'جودة',
    type: 'score',
    target: 4.5,
    current: 4.2,
    baseline: 3.0,
    unit: 'من 5',
    frequency: 'monthly',
    trend: 'stable' as const,
    project: 'برنامج التمكين الاقتصادي',
  },
  {
    id: '4',
    name: 'معدل إكمال التدريب',
    description: 'نسبة المتدربين الذين أكملوا البرنامج',
    category: 'مخرجات',
    type: 'percentage',
    target: 85,
    current: 78,
    baseline: 60,
    unit: '%',
    frequency: 'quarterly',
    trend: 'down' as const,
    project: 'برنامج التدريب المهني',
  },
  {
    id: '5',
    name: 'زيادة الدخل',
    description: 'متوسط نسبة زيادة دخل المستفيدين',
    category: 'أثر',
    type: 'percentage',
    target: 40,
    current: 35,
    baseline: 0,
    unit: '%',
    frequency: 'annually',
    trend: 'up' as const,
    project: 'برنامج التمكين الاقتصادي',
  },
];

const mockTrendData = [
  { month: 'يناير', employment: 45, satisfaction: 3.8, completion: 70 },
  { month: 'فبراير', employment: 50, satisfaction: 4.0, completion: 72 },
  { month: 'مارس', employment: 55, satisfaction: 4.1, completion: 75 },
  { month: 'أبريل', employment: 58, satisfaction: 4.2, completion: 76 },
  { month: 'مايو', employment: 62, satisfaction: 4.2, completion: 78 },
  { month: 'يونيو', employment: 65, satisfaction: 4.2, completion: 78 },
];

const categoryOptions = [
  { value: '', label: 'جميع الفئات' },
  { value: 'مخرجات', label: 'مخرجات' },
  { value: 'نتائج', label: 'نتائج' },
  { value: 'أثر', label: 'أثر' },
  { value: 'جودة', label: 'جودة' },
];

const frequencyLabels: Record<string, string> = {
  monthly: 'شهري',
  quarterly: 'ربع سنوي',
  annually: 'سنوي',
};

export default function IndicatorsPage() {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: projectsData } = useProjects({ limit: 100 });

  const projectOptions = [
    { value: '', label: 'جميع المشاريع' },
    ...(projectsData?.data?.map((p) => ({
      value: p._id,
      label: p.name,
    })) || []),
  ];

  const filteredIndicators = mockIndicators.filter((indicator) => {
    if (selectedCategory && indicator.category !== selectedCategory) return false;
    return true;
  });

  const getProgressVariant = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'danger';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <ArrowTrendingUpIcon className="h-4 w-4 text-success-500" />;
    if (trend === 'down') return <ArrowTrendingDownIcon className="h-4 w-4 text-danger-500" />;
    return <ChartBarIcon className="h-4 w-4 text-secondary-400" />;
  };

  const columns = [
    {
      key: 'name',
      title: 'المؤشر',
      render: (value: string, row: typeof mockIndicators[0]) => (
        <div>
          <p className="font-medium text-secondary-900">{value}</p>
          <p className="text-sm text-secondary-500">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'الفئة',
      render: (value: string) => (
        <Badge variant="primary" size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'progress',
      title: 'التقدم',
      render: (_: unknown, row: typeof mockIndicators[0]) => (
        <div className="w-40">
          <div className="flex justify-between text-sm mb-1">
            <span>{row.current} {row.unit}</span>
            <span className="text-secondary-500">الهدف: {row.target}</span>
          </div>
          <ProgressBar
            value={row.current}
            max={row.target}
            size="sm"
            variant={getProgressVariant(row.current, row.target)}
          />
        </div>
      ),
    },
    {
      key: 'trend',
      title: 'الاتجاه',
      render: (value: 'up' | 'down' | 'stable') => (
        <div className="flex items-center gap-2">
          {getTrendIcon(value)}
          <span className="text-sm text-secondary-600">
            {value === 'up' ? 'صاعد' : value === 'down' ? 'هابط' : 'مستقر'}
          </span>
        </div>
      ),
    },
    {
      key: 'frequency',
      title: 'التكرار',
      render: (value: string) => frequencyLabels[value] || value,
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: () => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <PencilSquareIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <TrashIcon className="h-4 w-4 text-danger-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="المؤشرات"
        subtitle="تتبع وقياس مؤشرات الأداء والأثر"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="h-5 w-5 me-2" />
            إضافة مؤشر
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-primary-600">{mockIndicators.length}</p>
          <p className="text-sm text-secondary-600">إجمالي المؤشرات</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-success-600">
            {mockIndicators.filter(i => (i.current / i.target) >= 0.9).length}
          </p>
          <p className="text-sm text-secondary-600">في المسار الصحيح</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-warning-600">
            {mockIndicators.filter(i => (i.current / i.target) >= 0.7 && (i.current / i.target) < 0.9).length}
          </p>
          <p className="text-sm text-secondary-600">تحتاج متابعة</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-danger-600">
            {mockIndicators.filter(i => (i.current / i.target) < 0.7).length}
          </p>
          <p className="text-sm text-secondary-600">متأخرة</p>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="mb-6">
        <CardHeader title="اتجاه المؤشرات الرئيسية" subtitle="تطور المؤشرات خلال الأشهر الماضية" />
        <LineChart
          data={mockTrendData}
          xKey="month"
          lines={[
            { dataKey: 'employment', name: 'معدل التوظيف', color: '#0ea5e9' },
            { dataKey: 'satisfaction', name: 'الرضا (×20)', color: '#22c55e' },
            { dataKey: 'completion', name: 'معدل الإكمال', color: '#f59e0b' },
          ]}
          height={300}
        />
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-64">
            <Select
              label="المشروع"
              options={projectOptions}
              value={selectedProject}
              onChange={setSelectedProject}
            />
          </div>
          <div className="w-64">
            <Select
              label="الفئة"
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </div>
      </Card>

      {/* Indicators Table */}
      <Card>
        <CardHeader title="قائمة المؤشرات" subtitle={`${filteredIndicators.length} مؤشر`} />
        <DataTable columns={columns} data={filteredIndicators} rowKey="id" />
      </Card>

      {/* Add Indicator Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة مؤشر جديد"
        size="lg"
      >
        <form className="space-y-4">
          <Input label="اسم المؤشر" placeholder="أدخل اسم المؤشر" required />
          <Textarea label="الوصف" placeholder="وصف المؤشر" rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="الفئة"
              options={categoryOptions.slice(1)}
              value=""
              onChange={() => {}}
              required
            />
            <Select
              label="التكرار"
              options={[
                { value: 'monthly', label: 'شهري' },
                { value: 'quarterly', label: 'ربع سنوي' },
                { value: 'annually', label: 'سنوي' },
              ]}
              value=""
              onChange={() => {}}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="القيمة الأساسية" type="number" placeholder="0" />
            <Input label="القيمة الحالية" type="number" placeholder="0" />
            <Input label="القيمة المستهدفة" type="number" placeholder="100" required />
          </div>
          <Input label="الوحدة" placeholder="مثال: %, مستفيد, ريال" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">حفظ المؤشر</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
