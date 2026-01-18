'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks';
import {
  useBeneficiaries,
  useBeneficiariesStatistics,
  useCreateBeneficiary,
} from '@/hooks/use-beneficiaries';
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
  LoadingSpinner,
  EmptyState,
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
import type { Beneficiary, CreateBeneficiaryData } from '@/api';

const genderLabels = {
  male: 'ذكر',
  female: 'أنثى',
  other: 'آخر',
};

const beneficiaryTypeLabels = {
  individual: 'فرد',
  family: 'أسرة',
  organization: 'منظمة',
  community: 'مجتمع',
};

export default function BeneficiariesPage() {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateBeneficiaryData>>({});

  // Fetch data from API
  const { data: allProjects } = useProjects({});
  const { data: beneficiaries, isLoading } = useBeneficiaries({
    projectId: selectedProject || undefined,
    beneficiaryType: selectedType || undefined,
    city: selectedCity || undefined,
  });
  const { data: statistics } = useBeneficiariesStatistics(
    selectedProject || undefined
  );
  const createMutation = useCreateBeneficiary();

  const projects = allProjects || [];

  const projectOptions = [
    { value: '', label: 'جميع المشاريع' },
    ...projects.map((p) => ({
      value: p._id,
      label: p.name,
    })),
  ];

  const typeOptions = [
    { value: '', label: 'جميع الأنواع' },
    { value: 'individual', label: 'فرد' },
    { value: 'family', label: 'أسرة' },
    { value: 'organization', label: 'منظمة' },
    { value: 'community', label: 'مجتمع' },
  ];

  // Get unique cities from beneficiaries for filter
  const cities = beneficiaries
    ? Array.from(new Set(beneficiaries.map((b) => b.city).filter(Boolean)))
    : [];
  const cityOptions = [
    { value: '', label: 'جميع المدن' },
    ...cities.map((city) => ({ value: city!, label: city! })),
  ];

  // Client-side search filtering
  const filteredBeneficiaries =
    beneficiaries?.filter((b) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          b.name.toLowerCase().includes(query) ||
          b.email?.toLowerCase().includes(query) ||
          b.phone?.includes(query)
        );
      }
      return true;
    }) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.project || !formData.beneficiaryType) {
      return;
    }

    await createMutation.mutateAsync(formData as CreateBeneficiaryData);
    setIsModalOpen(false);
    setFormData({});
  };

  const columns = [
    {
      key: 'name',
      title: 'الاسم',
      render: (value: string, row: Beneficiary) => (
        <div>
          <p className="font-medium text-secondary-900">{value}</p>
          {row.email && <p className="text-sm text-secondary-500">{row.email}</p>}
        </div>
      ),
    },
    {
      key: 'beneficiaryType',
      title: 'النوع',
      render: (value: keyof typeof beneficiaryTypeLabels) => (
        <Badge variant="info">{beneficiaryTypeLabels[value]}</Badge>
      ),
    },
    {
      key: 'gender',
      title: 'الجنس',
      render: (value?: 'male' | 'female' | 'other') =>
        value ? genderLabels[value] : '-',
    },
    {
      key: 'age',
      title: 'العمر',
      render: (value?: number) => (value ? `${value} سنة` : '-'),
    },
    {
      key: 'city',
      title: 'المدينة',
      render: (value?: string) => value || '-',
    },
    {
      key: 'phone',
      title: 'الهاتف',
      render: (value?: string) => value || '-',
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (_: unknown, row: Beneficiary) => (
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

  // Prepare chart data from real statistics
  const genderData = statistics?.genderDistribution
    ? [
        {
          name: 'ذكور',
          value: statistics.genderDistribution.male || 0,
          color: '#0ea5e9',
        },
        {
          name: 'إناث',
          value: statistics.genderDistribution.female || 0,
          color: '#ec4899',
        },
        {
          name: 'آخر',
          value: statistics.genderDistribution.other || 0,
          color: '#94a3b8',
        },
      ].filter((item) => item.value > 0)
    : [];

  const typeData = statistics?.byType
    ? [
        { type: 'أفراد', count: statistics.byType.individual || 0 },
        { type: 'أسر', count: statistics.byType.family || 0 },
        { type: 'منظمات', count: statistics.byType.organization || 0 },
        { type: 'مجتمعات', count: statistics.byType.community || 0 },
      ].filter((item) => item.count > 0)
    : [];

  const cityData = statistics?.byCity
    ? Object.entries(statistics.byCity)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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

      {/* Stats from real data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center py-4">
          <UserGroupIcon className="h-8 w-8 text-primary-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-primary-600">
            {statistics?.totalBeneficiaries || 0}
          </p>
          <p className="text-sm text-secondary-600">إجمالي المستفيدين</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-success-600">
            {statistics?.byType.individual || 0}
          </p>
          <p className="text-sm text-secondary-600">أفراد</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-blue-600">
            {statistics?.byType.family || 0}
          </p>
          <p className="text-sm text-secondary-600">أسر</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-purple-600">
            {statistics?.byType.organization || 0}
          </p>
          <p className="text-sm text-secondary-600">منظمات</p>
        </Card>
      </div>

      {/* Charts with real data */}
      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader title="التوزيع حسب الجنس" />
            {genderData.length > 0 ? (
              <DonutChart
                data={genderData}
                centerValue={statistics.totalBeneficiaries.toString()}
                centerLabel="مستفيد"
                height={200}
                outerRadius={70}
              />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-secondary-400">
                لا توجد بيانات
              </div>
            )}
          </Card>
          <Card>
            <CardHeader title="التوزيع حسب النوع" />
            {typeData.length > 0 ? (
              <BarChart
                data={typeData}
                xKey="type"
                bars={[{ dataKey: 'count', name: 'العدد', color: '#0ea5e9' }]}
                height={200}
              />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-secondary-400">
                لا توجد بيانات
              </div>
            )}
          </Card>
          <Card>
            <CardHeader title="التوزيع حسب المدينة" />
            {cityData.length > 0 ? (
              <BarChart
                data={cityData}
                xKey="city"
                bars={[{ dataKey: 'count', name: 'العدد', color: '#22c55e' }]}
                height={200}
              />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-secondary-400">
                لا توجد بيانات
              </div>
            )}
          </Card>
        </div>
      )}

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
              label="المدينة"
              options={cityOptions}
              value={selectedCity}
              onChange={setSelectedCity}
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

      {/* Beneficiaries Table with real data */}
      <Card>
        <CardHeader
          title="قائمة المستفيدين"
          subtitle={`${filteredBeneficiaries.length} مستفيد`}
        />
        {filteredBeneficiaries.length > 0 ? (
          <DataTable
            columns={columns}
            data={filteredBeneficiaries}
            rowKey="_id"
          />
        ) : (
          <EmptyState
            title="لا توجد بيانات"
            description="لم يتم العثور على مستفيدين. ابدأ بإضافة مستفيد جديد."
            icon="users"
          />
        )}
      </Card>

      {/* Add Beneficiary Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({});
        }}
        title="إضافة مستفيد جديد"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="الاسم الكامل"
              placeholder="أدخل الاسم"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="example@email.com"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="رقم الهاتف"
              placeholder="05xxxxxxxx"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="العمر"
              type="number"
              placeholder="25"
              value={formData.age || ''}
              onChange={(e) =>
                setFormData({ ...formData, age: parseInt(e.target.value) || undefined })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="الجنس"
              options={[
                { value: 'male', label: 'ذكر' },
                { value: 'female', label: 'أنثى' },
                { value: 'other', label: 'آخر' },
              ]}
              value={(formData.gender as string) || ''}
              onChange={(value) =>
                setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' })
              }
            />
            <Input
              label="المدينة"
              placeholder="الرياض"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="نوع المستفيد"
              options={[
                { value: 'individual', label: 'فرد' },
                { value: 'family', label: 'أسرة' },
                { value: 'organization', label: 'منظمة' },
                { value: 'community', label: 'مجتمع' },
              ]}
              value={(formData.beneficiaryType as string) || ''}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  beneficiaryType: value as
                    | 'individual'
                    | 'family'
                    | 'organization'
                    | 'community',
                })
              }
              required
            />
            <Select
              label="المشروع"
              options={projectOptions.slice(1)}
              value={formData.project || ''}
              onChange={(value) => setFormData({ ...formData, project: value })}
              required
            />
          </div>
          <Textarea
            label="ملاحظات"
            placeholder="أي ملاحظات إضافية..."
            rows={2}
            value={((formData.metadata as any)?.notes as string) || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                metadata: { ...(formData.metadata || {}), notes: e.target.value },
              })
            }
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({});
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              حفظ المستفيد
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
