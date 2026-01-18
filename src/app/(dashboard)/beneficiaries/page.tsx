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
import { BarChart, DonutChart } from '@/components/charts';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

// Mock beneficiaries data
const mockBeneficiaries = [
  {
    id: '1',
    name: 'أحمد محمد العلي',
    email: 'ahmed@example.com',
    phone: '0501234567',
    gender: 'male' as const,
    age: 28,
    city: 'الرياض',
    project: 'برنامج التدريب المهني',
    status: 'active' as const,
    joinDate: '2024-01-05',
    surveysCompleted: 3,
  },
  {
    id: '2',
    name: 'فاطمة سعد الدوسري',
    email: 'fatima@example.com',
    phone: '0559876543',
    gender: 'female' as const,
    age: 24,
    city: 'جدة',
    project: 'برنامج التمكين الاقتصادي',
    status: 'active' as const,
    joinDate: '2024-01-10',
    surveysCompleted: 2,
  },
  {
    id: '3',
    name: 'خالد عبدالله القحطاني',
    email: 'khaled@example.com',
    phone: '0543216789',
    gender: 'male' as const,
    age: 32,
    city: 'الدمام',
    project: 'برنامج التدريب المهني',
    status: 'completed' as const,
    joinDate: '2023-10-15',
    surveysCompleted: 5,
  },
  {
    id: '4',
    name: 'نورة حمد الشمري',
    email: 'noura@example.com',
    phone: '0567891234',
    gender: 'female' as const,
    age: 26,
    city: 'الرياض',
    project: 'برنامج دعم التعليم',
    status: 'active' as const,
    joinDate: '2024-01-12',
    surveysCompleted: 1,
  },
  {
    id: '5',
    name: 'محمد علي الغامدي',
    email: 'mohammed@example.com',
    phone: '0578901234',
    gender: 'male' as const,
    age: 30,
    city: 'مكة',
    project: 'برنامج التمكين الاقتصادي',
    status: 'inactive' as const,
    joinDate: '2023-09-20',
    surveysCompleted: 4,
  },
];

const statusConfig = {
  active: { label: 'نشط', variant: 'success' as const },
  completed: { label: 'أكمل البرنامج', variant: 'primary' as const },
  inactive: { label: 'غير نشط', variant: 'default' as const },
};

const genderLabels = {
  male: 'ذكر',
  female: 'أنثى',
};

const mockGenderData = [
  { name: 'ذكور', value: 60, color: '#0ea5e9' },
  { name: 'إناث', value: 40, color: '#ec4899' },
];

const mockAgeData = [
  { range: '18-24', count: 35 },
  { range: '25-34', count: 45 },
  { range: '35-44', count: 15 },
  { range: '45+', count: 5 },
];

const mockCityData = [
  { city: 'الرياض', count: 120 },
  { city: 'جدة', count: 85 },
  { city: 'الدمام', count: 60 },
  { city: 'مكة', count: 45 },
  { city: 'المدينة', count: 30 },
];

export default function BeneficiariesPage() {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: projectsData } = useProjects({ limit: 100 });

  const projectOptions = [
    { value: '', label: 'جميع المشاريع' },
    ...(projectsData?.data?.map((p) => ({
      value: p._id,
      label: p.name,
    })) || []),
  ];

  const statusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: 'active', label: 'نشط' },
    { value: 'completed', label: 'أكمل البرنامج' },
    { value: 'inactive', label: 'غير نشط' },
  ];

  const filteredBeneficiaries = mockBeneficiaries.filter((b) => {
    if (selectedStatus && b.status !== selectedStatus) return false;
    if (searchQuery && !b.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !b.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns = [
    {
      key: 'name',
      title: 'الاسم',
      render: (value: string, row: typeof mockBeneficiaries[0]) => (
        <div>
          <p className="font-medium text-secondary-900">{value}</p>
          <p className="text-sm text-secondary-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'gender',
      title: 'الجنس',
      render: (value: 'male' | 'female') => genderLabels[value],
    },
    {
      key: 'age',
      title: 'العمر',
      render: (value: number) => `${value} سنة`,
    },
    {
      key: 'city',
      title: 'المدينة',
    },
    {
      key: 'project',
      title: 'المشروع',
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
      key: 'surveysCompleted',
      title: 'الاستبيانات المكتملة',
      render: (value: number) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: () => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <EyeIcon className="h-4 w-4" />
          </Button>
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
        title="المستفيدون"
        subtitle="إدارة بيانات المستفيدين من البرامج"
        actions={
          <div className="flex gap-3">
            <Button variant="outline">
              <DocumentArrowDownIcon className="h-5 w-5 me-2" />
              تصدير
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="h-5 w-5 me-2" />
              إضافة مستفيد
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center py-4">
          <UserGroupIcon className="h-8 w-8 text-primary-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-primary-600">{mockBeneficiaries.length}</p>
          <p className="text-sm text-secondary-600">إجمالي المستفيدين</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-success-600">
            {mockBeneficiaries.filter(b => b.status === 'active').length}
          </p>
          <p className="text-sm text-secondary-600">مستفيدون نشطون</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-primary-600">
            {mockBeneficiaries.filter(b => b.status === 'completed').length}
          </p>
          <p className="text-sm text-secondary-600">أكملوا البرنامج</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-secondary-600">
            {mockBeneficiaries.reduce((acc, b) => acc + b.surveysCompleted, 0)}
          </p>
          <p className="text-sm text-secondary-600">إجمالي الردود</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader title="التوزيع حسب الجنس" />
          <DonutChart
            data={mockGenderData}
            centerValue="340"
            centerLabel="مستفيد"
            height={200}
            outerRadius={70}
          />
        </Card>
        <Card>
          <CardHeader title="التوزيع حسب العمر" />
          <BarChart
            data={mockAgeData}
            xKey="range"
            bars={[{ dataKey: 'count', name: 'العدد', color: '#0ea5e9' }]}
            height={200}
          />
        </Card>
        <Card>
          <CardHeader title="التوزيع حسب المدينة" />
          <BarChart
            data={mockCityData}
            xKey="city"
            bars={[{ dataKey: 'count', name: 'العدد', color: '#22c55e' }]}
            height={200}
          />
        </Card>
      </div>

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
              label="الحالة"
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
            />
          </div>
          <div className="w-64">
            <Input
              label="البحث"
              placeholder="ابحث بالاسم أو البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
        </div>
      </Card>

      {/* Beneficiaries Table */}
      <Card>
        <CardHeader title="قائمة المستفيدين" subtitle={`${filteredBeneficiaries.length} مستفيد`} />
        <DataTable columns={columns} data={filteredBeneficiaries} rowKey="id" />
      </Card>

      {/* Add Beneficiary Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة مستفيد جديد"
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="الاسم الكامل" placeholder="أدخل الاسم" required />
            <Input label="البريد الإلكتروني" type="email" placeholder="example@email.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="رقم الهاتف" placeholder="05xxxxxxxx" />
            <Input label="العمر" type="number" placeholder="25" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="الجنس"
              options={[
                { value: 'male', label: 'ذكر' },
                { value: 'female', label: 'أنثى' },
              ]}
              value=""
              onChange={() => {}}
              required
            />
            <Input label="المدينة" placeholder="الرياض" />
          </div>
          <Select
            label="المشروع"
            options={projectOptions.slice(1)}
            value=""
            onChange={() => {}}
            required
          />
          <Textarea label="ملاحظات" placeholder="أي ملاحظات إضافية..." rows={2} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">حفظ المستفيد</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
