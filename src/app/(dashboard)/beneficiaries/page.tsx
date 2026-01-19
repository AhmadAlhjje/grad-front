'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks';
import {
  useBeneficiaries,
  useBeneficiariesStatistics,
  useCreateBeneficiary,
  useUpdateBeneficiary,
  useDeleteBeneficiary,
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
import { BarChart } from '@/components/charts';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import type { Beneficiary, CreateBeneficiaryData, UpdateBeneficiaryData } from '@/api';
import type { Project } from '@/types';
import { formatDate } from '@/lib/utils';

const beneficiaryTypeLabels = {
  person: 'فرد',
  area: 'منطقة',
  group: 'مجموعة',
};

export default function BeneficiariesPage() {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form and selected beneficiary states
  const [formData, setFormData] = useState<Partial<CreateBeneficiaryData>>({});
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

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

  // Mutations
  const createMutation = useCreateBeneficiary();
  const updateMutation = useUpdateBeneficiary();
  const deleteMutation = useDeleteBeneficiary();

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
    { value: 'person', label: 'فرد' },
    { value: 'area', label: 'منطقة' },
    { value: 'group', label: 'مجموعة' },
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
          b.city?.toLowerCase().includes(query) ||
          b.region?.toLowerCase().includes(query) ||
          b.notes?.toLowerCase().includes(query)
        );
      }
      return true;
    }) || [];

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.project || !formData.beneficiaryType) {
      return;
    }

    await createMutation.mutateAsync(formData as CreateBeneficiaryData);
    setIsCreateModalOpen(false);
    setFormData({});
  };

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiary || !formData.name || !formData.beneficiaryType) {
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedBeneficiary._id,
      data: formData as UpdateBeneficiaryData,
    });
    setIsEditModalOpen(false);
    setFormData({});
    setSelectedBeneficiary(null);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedBeneficiary) return;

    await deleteMutation.mutateAsync(selectedBeneficiary._id);
    setIsDeleteModalOpen(false);
    setSelectedBeneficiary(null);
  };

  // Open view modal
  const openViewModal = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsViewModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    const projectId = typeof beneficiary.project === 'object'
      ? (beneficiary.project as Project)._id
      : beneficiary.project;
    setFormData({
      name: beneficiary.name,
      beneficiaryType: beneficiary.beneficiaryType,
      project: projectId,
      city: beneficiary.city,
      region: beneficiary.region,
      populationSize: beneficiary.populationSize,
      notes: beneficiary.notes,
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsDeleteModalOpen(true);
  };

  // Helper function to get project name from beneficiary
  const getProjectName = (beneficiary: Beneficiary): string => {
    if (typeof beneficiary.project === 'object' && beneficiary.project !== null) {
      return (beneficiary.project as Project).name || 'غير معروف';
    }
    // If project is a string (ID), try to find it in projects list
    const project = projects.find(p => p._id === beneficiary.project);
    return project?.name || 'غير معروف';
  };

  const columns = [
    {
      key: 'name',
      title: 'الاسم',
      render: (value: string) => (
        <p className="font-medium text-secondary-900">{value}</p>
      ),
    },
    {
      key: 'project',
      title: 'المشروع',
      render: (_: unknown, row: Beneficiary) => (
        <span className="text-secondary-700">{getProjectName(row)}</span>
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
      key: 'city',
      title: 'المدينة',
      render: (value?: string) => value || '-',
    },
    {
      key: 'region',
      title: 'المنطقة',
      render: (value?: string) => value || '-',
    },
    {
      key: 'populationSize',
      title: 'حجم السكان',
      render: (value?: number) => (value ? value.toLocaleString('ar-SA') : '-'),
    },
    {
      key: 'notes',
      title: 'ملاحظات',
      render: (value?: string) => value ? (
        <span className="text-secondary-600 truncate max-w-[150px] inline-block">{value}</span>
      ) : '-',
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (_: unknown, row: Beneficiary) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => openViewModal(row)}>
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEditModal(row)}>
            <PencilSquareIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openDeleteModal(row)}>
            <TrashIcon className="h-4 w-4 text-danger-500" />
          </Button>
        </div>
      ),
    },
  ];

  // Prepare chart data from real statistics
  const typeData = statistics?.byType
    ? [
        { type: 'أفراد', count: statistics.byType.person?.count || 0 },
        { type: 'مناطق', count: statistics.byType.area?.count || 0 },
        { type: 'مجموعات', count: statistics.byType.group?.count || 0 },
      ].filter((item) => item.count > 0)
    : [];

  // Population data by type
  const populationData = statistics?.byType
    ? [
        { type: 'أفراد', population: statistics.byType.person?.totalPopulation || 0 },
        { type: 'مناطق', population: statistics.byType.area?.totalPopulation || 0 },
        { type: 'مجموعات', population: statistics.byType.group?.totalPopulation || 0 },
      ].filter((item) => item.population > 0)
    : [];

  // Get unique cities from beneficiaries for chart
  const cityData = beneficiaries
    ? Object.entries(
        beneficiaries.reduce((acc, b) => {
          if (b.city) {
            acc[b.city] = (acc[b.city] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>)
      )
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
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="h-5 w-5 me-2" />
              إضافة مستفيد
            </Button>
          </div>
        }
      />

      {/* Stats from real data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-primary-600">
            {statistics?.total || 0}
          </p>
          <p className="text-sm text-secondary-600">إجمالي المستفيدين</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-success-600">
            {statistics?.byType?.person?.count || 0}
          </p>
          <p className="text-sm text-secondary-600">أفراد</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-blue-600">
            {statistics?.byType?.area?.count || 0}
          </p>
          <p className="text-sm text-secondary-600">مناطق</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-purple-600">
            {statistics?.byType?.group?.count || 0}
          </p>
          <p className="text-sm text-secondary-600">مجموعات</p>
        </Card>
      </div>

      {/* Charts with real data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
          <CardHeader title="إجمالي السكان حسب النوع" />
          {populationData.length > 0 ? (
            <BarChart
              data={populationData}
              xKey="type"
              bars={[{ dataKey: 'population', name: 'السكان', color: '#8b5cf6' }]}
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
              placeholder="ابحث بالاسم أو المدينة..."
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

      {/* Create Beneficiary Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({});
        }}
        title="إضافة مستفيد جديد"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="الاسم"
              placeholder="أدخل الاسم"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Select
              label="نوع المستفيد"
              options={[
                { value: 'person', label: 'فرد' },
                { value: 'area', label: 'منطقة' },
                { value: 'group', label: 'مجموعة' },
              ]}
              value={(formData.beneficiaryType as string) || ''}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  beneficiaryType: value as 'person' | 'area' | 'group',
                })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="المشروع"
              options={projectOptions.slice(1)}
              value={formData.project || ''}
              onChange={(value) => setFormData({ ...formData, project: value })}
              required
            />
            <Input
              label="المدينة"
              placeholder="الرياض"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="المنطقة"
              placeholder="المنطقة"
              value={formData.region || ''}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            />
            <Input
              label="حجم السكان"
              type="number"
              placeholder="1000"
              value={formData.populationSize || ''}
              onChange={(e) =>
                setFormData({ ...formData, populationSize: parseInt(e.target.value) || undefined })
              }
            />
          </div>
          <Textarea
            label="ملاحظات"
            placeholder="أي ملاحظات إضافية..."
            rows={2}
            value={formData.notes || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                notes: e.target.value,
              })
            }
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
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

      {/* Edit Beneficiary Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setFormData({});
          setSelectedBeneficiary(null);
        }}
        title="تعديل المستفيد"
        size="lg"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="الاسم"
              placeholder="أدخل الاسم"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Select
              label="نوع المستفيد"
              options={[
                { value: 'person', label: 'فرد' },
                { value: 'area', label: 'منطقة' },
                { value: 'group', label: 'مجموعة' },
              ]}
              value={(formData.beneficiaryType as string) || ''}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  beneficiaryType: value as 'person' | 'area' | 'group',
                })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="المشروع"
              options={projectOptions.slice(1)}
              value={formData.project || ''}
              onChange={(value) => setFormData({ ...formData, project: value })}
              required
            />
            <Input
              label="المدينة"
              placeholder="الرياض"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="المنطقة"
              placeholder="المنطقة"
              value={formData.region || ''}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            />
            <Input
              label="حجم السكان"
              type="number"
              placeholder="1000"
              value={formData.populationSize || ''}
              onChange={(e) =>
                setFormData({ ...formData, populationSize: parseInt(e.target.value) || undefined })
              }
            />
          </div>
          <Textarea
            label="ملاحظات"
            placeholder="أي ملاحظات إضافية..."
            rows={2}
            value={formData.notes || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                notes: e.target.value,
              })
            }
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setFormData({});
                setSelectedBeneficiary(null);
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" isLoading={updateMutation.isPending}>
              تحديث المستفيد
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Beneficiary Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedBeneficiary(null);
        }}
        title="تفاصيل المستفيد"
        size="lg"
      >
        {selectedBeneficiary && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500">الاسم</p>
                <p className="font-medium text-secondary-900">{selectedBeneficiary.name}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">النوع</p>
                <Badge variant="info">
                  {beneficiaryTypeLabels[selectedBeneficiary.beneficiaryType]}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500">المشروع</p>
                <p className="font-medium text-secondary-900">{getProjectName(selectedBeneficiary)}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">المدينة</p>
                <p className="font-medium text-secondary-900">{selectedBeneficiary.city || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500">المنطقة</p>
                <p className="font-medium text-secondary-900">{selectedBeneficiary.region || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">حجم السكان</p>
                <p className="font-medium text-secondary-900">
                  {selectedBeneficiary.populationSize?.toLocaleString('ar-SA') || '-'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-secondary-500">ملاحظات</p>
              <p className="font-medium text-secondary-900">{selectedBeneficiary.notes || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500">تاريخ الإنشاء</p>
                <p className="font-medium text-secondary-900">{formatDate(selectedBeneficiary.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">آخر تحديث</p>
                <p className="font-medium text-secondary-900">{formatDate(selectedBeneficiary.updatedAt)}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedBeneficiary(null);
                }}
              >
                إغلاق
              </Button>
              <Button
                onClick={() => {
                  setIsViewModalOpen(false);
                  openEditModal(selectedBeneficiary);
                }}
              >
                تعديل
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBeneficiary(null);
        }}
        title="حذف المستفيد"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            هل أنت متأكد من حذف المستفيد <strong>{selectedBeneficiary?.name}</strong>؟
          </p>
          <p className="text-sm text-danger-600">
            هذا الإجراء لا يمكن التراجع عنه.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedBeneficiary(null);
              }}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              حذف
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
