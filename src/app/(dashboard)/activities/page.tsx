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
  Input,
  Button,
  Modal,
  Textarea,
} from '@/components/ui';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// Mock activities data
const mockActivities = [
  {
    id: '1',
    title: 'ورشة عمل مهارات التوظيف',
    description: 'ورشة تدريبية على مهارات كتابة السيرة الذاتية والمقابلات الوظيفية',
    project: 'برنامج التدريب المهني',
    type: 'workshop' as const,
    date: '2024-01-20',
    time: '09:00',
    duration: 4,
    location: 'قاعة التدريب - الرياض',
    capacity: 30,
    registered: 25,
    status: 'upcoming' as const,
  },
  {
    id: '2',
    title: 'جلسة إرشادية للمستفيدين',
    description: 'جلسة توجيهية حول فرص العمل المتاحة في السوق',
    project: 'برنامج التمكين الاقتصادي',
    type: 'session' as const,
    date: '2024-01-18',
    time: '14:00',
    duration: 2,
    location: 'أونلاين - زووم',
    capacity: 50,
    registered: 42,
    status: 'upcoming' as const,
  },
  {
    id: '3',
    title: 'دورة ريادة الأعمال',
    description: 'دورة مكثفة في أساسيات ريادة الأعمال وبدء المشاريع',
    project: 'برنامج التمكين الاقتصادي',
    type: 'course' as const,
    date: '2024-01-15',
    time: '10:00',
    duration: 8,
    location: 'مركز التدريب - جدة',
    capacity: 25,
    registered: 25,
    status: 'completed' as const,
  },
  {
    id: '4',
    title: 'لقاء تعريفي بالبرنامج',
    description: 'لقاء تعريفي للمستفيدين الجدد',
    project: 'برنامج دعم التعليم',
    type: 'meeting' as const,
    date: '2024-01-22',
    time: '11:00',
    duration: 1,
    location: 'القاعة الرئيسية - الرياض',
    capacity: 100,
    registered: 65,
    status: 'upcoming' as const,
  },
  {
    id: '5',
    title: 'تقييم نهاية البرنامج',
    description: 'تقييم شامل للمتدربين في نهاية البرنامج التدريبي',
    project: 'برنامج التدريب المهني',
    type: 'assessment' as const,
    date: '2024-01-10',
    time: '09:00',
    duration: 3,
    location: 'مركز الاختبارات',
    capacity: 40,
    registered: 38,
    status: 'completed' as const,
  },
];

const typeConfig = {
  workshop: { label: 'ورشة عمل', variant: 'primary' as const, color: '#0ea5e9' },
  session: { label: 'جلسة', variant: 'success' as const, color: '#22c55e' },
  course: { label: 'دورة', variant: 'warning' as const, color: '#f59e0b' },
  meeting: { label: 'لقاء', variant: 'default' as const, color: '#64748b' },
  assessment: { label: 'تقييم', variant: 'danger' as const, color: '#ef4444' },
};

const statusConfig = {
  upcoming: { label: 'قادم', variant: 'primary' as const },
  ongoing: { label: 'جاري', variant: 'warning' as const },
  completed: { label: 'مكتمل', variant: 'success' as const },
  cancelled: { label: 'ملغي', variant: 'danger' as const },
};

const typeOptions = [
  { value: '', label: 'جميع الأنواع' },
  { value: 'workshop', label: 'ورشة عمل' },
  { value: 'session', label: 'جلسة' },
  { value: 'course', label: 'دورة' },
  { value: 'meeting', label: 'لقاء' },
  { value: 'assessment', label: 'تقييم' },
];

const statusOptions = [
  { value: '', label: 'جميع الحالات' },
  { value: 'upcoming', label: 'قادم' },
  { value: 'ongoing', label: 'جاري' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
];

export default function ActivitiesPage() {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  const { data: projectsData } = useProjects({ limit: 100 });

  const projectOptions = [
    { value: '', label: 'جميع المشاريع' },
    ...(projectsData?.data?.map((p) => ({
      value: p._id,
      label: p.name,
    })) || []),
  ];

  const filteredActivities = mockActivities.filter((activity) => {
    if (selectedType && activity.type !== selectedType) return false;
    if (selectedStatus && activity.status !== selectedStatus) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const columns = [
    {
      key: 'title',
      title: 'النشاط',
      render: (value: string, row: typeof mockActivities[0]) => (
        <div>
          <p className="font-medium text-secondary-900">{value}</p>
          <p className="text-sm text-secondary-500 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'type',
      title: 'النوع',
      render: (value: keyof typeof typeConfig) => (
        <Badge variant={typeConfig[value].variant}>
          {typeConfig[value].label}
        </Badge>
      ),
    },
    {
      key: 'date',
      title: 'التاريخ والوقت',
      render: (value: string, row: typeof mockActivities[0]) => (
        <div>
          <div className="flex items-center gap-1 text-secondary-900">
            <CalendarDaysIcon className="h-4 w-4" />
            <span>{formatDate(value)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-secondary-500">
            <ClockIcon className="h-3 w-3" />
            <span>{row.time} ({row.duration} ساعات)</span>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      title: 'الموقع',
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <MapPinIcon className="h-4 w-4 text-secondary-400" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'registered',
      title: 'المسجلون',
      render: (value: number, row: typeof mockActivities[0]) => (
        <div className="flex items-center gap-1">
          <UserGroupIcon className="h-4 w-4 text-secondary-400" />
          <span className={value >= row.capacity ? 'text-danger-600' : ''}>
            {value}/{row.capacity}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'الحالة',
      render: (value: keyof typeof statusConfig) => (
        <Badge variant={statusConfig[value].variant}>
          {statusConfig[value].label}
        </Badge>
      ),
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

  // Group activities by date for calendar view
  const upcomingActivities = mockActivities
    .filter(a => a.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div>
      <PageHeader
        title="الأنشطة"
        subtitle="إدارة الأنشطة والفعاليات"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="h-5 w-5 me-2" />
            إضافة نشاط
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-primary-600">{mockActivities.length}</p>
          <p className="text-sm text-secondary-600">إجمالي الأنشطة</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-success-600">
            {mockActivities.filter(a => a.status === 'upcoming').length}
          </p>
          <p className="text-sm text-secondary-600">أنشطة قادمة</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-warning-600">
            {mockActivities.reduce((acc, a) => acc + a.registered, 0)}
          </p>
          <p className="text-sm text-secondary-600">إجمالي المسجلين</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-secondary-600">
            {mockActivities.filter(a => a.status === 'completed').length}
          </p>
          <p className="text-sm text-secondary-600">أنشطة مكتملة</p>
        </Card>
      </div>

      {/* Upcoming Activities Cards */}
      <Card className="mb-6">
        <CardHeader title="الأنشطة القادمة" subtitle="قائمة بالأنشطة المجدولة" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingActivities.slice(0, 3).map((activity) => (
            <div
              key={activity.id}
              className="p-4 border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <Badge variant={typeConfig[activity.type].variant}>
                  {typeConfig[activity.type].label}
                </Badge>
                <span className="text-sm text-secondary-500">{activity.time}</span>
              </div>
              <h3 className="font-medium text-secondary-900 mb-1">{activity.title}</h3>
              <p className="text-sm text-secondary-500 mb-3 line-clamp-2">{activity.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-secondary-600">
                  <CalendarDaysIcon className="h-4 w-4" />
                  <span>{new Date(activity.date).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex items-center gap-1 text-secondary-600">
                  <UserGroupIcon className="h-4 w-4" />
                  <span>{activity.registered}/{activity.capacity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
          <div className="w-48">
            <Select
              label="النوع"
              options={typeOptions}
              value={selectedType}
              onChange={setSelectedType}
            />
          </div>
          <div className="w-48">
            <Select
              label="الحالة"
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
            />
          </div>
        </div>
      </Card>

      {/* Activities Table */}
      <Card>
        <CardHeader title="قائمة الأنشطة" subtitle={`${filteredActivities.length} نشاط`} />
        <DataTable columns={columns} data={filteredActivities} rowKey="id" />
      </Card>

      {/* Add Activity Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة نشاط جديد"
        size="lg"
      >
        <form className="space-y-4">
          <Input label="عنوان النشاط" placeholder="أدخل عنوان النشاط" required />
          <Textarea label="الوصف" placeholder="وصف تفصيلي للنشاط" rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="المشروع"
              options={projectOptions.slice(1)}
              value=""
              onChange={() => {}}
              required
            />
            <Select
              label="نوع النشاط"
              options={typeOptions.slice(1)}
              value=""
              onChange={() => {}}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="التاريخ" type="date" required />
            <Input label="الوقت" type="time" required />
            <Input label="المدة (ساعات)" type="number" placeholder="2" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="الموقع" placeholder="قاعة التدريب أو رابط الاجتماع" required />
            <Input label="السعة" type="number" placeholder="30" required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">حفظ النشاط</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
