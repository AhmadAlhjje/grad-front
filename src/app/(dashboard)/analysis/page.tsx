'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProjects, useProjectAnalysis } from '@/hooks';
import { PageHeader } from '@/components/layout';
import {
  Card,
  CardHeader,
  Select,
  Loading,
  EmptyState,
  Badge,
  ProgressBar,
} from '@/components/ui';
import { LineChart, BarChart, RadarChart, DonutChart } from '@/components/charts';
import {
  LightBulbIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

// Mock analysis data
const mockSentimentData = {
  overall: 'positive' as const,
  score: 0.78,
  breakdown: {
    positive: 65,
    neutral: 25,
    negative: 10,
  },
};

const mockTopics = [
  { topic: 'التدريب والتعليم', frequency: 45, keywords: ['تدريب', 'تعلم', 'مهارات'], sentiment: 'positive' as const },
  { topic: 'التوظيف', frequency: 32, keywords: ['وظيفة', 'عمل', 'فرص'], sentiment: 'positive' as const },
  { topic: 'الدعم والمساعدة', frequency: 28, keywords: ['دعم', 'مساعدة', 'توجيه'], sentiment: 'neutral' as const },
  { topic: 'التحديات', frequency: 15, keywords: ['صعوبة', 'تحدي', 'عقبة'], sentiment: 'negative' as const },
];

const mockInsights = [
  {
    category: 'التأثير الإيجابي',
    insight: '78% من المشاركين أبدوا رضاهم عن البرنامج التدريبي',
    confidence: 0.92,
  },
  {
    category: 'فرص التحسين',
    insight: 'يوصي المشاركون بزيادة مدة التدريب العملي',
    confidence: 0.85,
  },
  {
    category: 'النتائج',
    insight: '45% من المشاركين حصلوا على فرص عمل بعد البرنامج',
    confidence: 0.88,
  },
];

const mockRecommendations = [
  'زيادة مدة التدريب العملي من أسبوعين إلى شهر',
  'إضافة برامج إرشاد مهني للخريجين',
  'توسيع الشراكات مع القطاع الخاص',
  'تقديم دورات متقدمة للمتفوقين',
];

const mockImpactTrend = [
  { month: 'يناير', knowledge: 2.8, skills: 2.5, confidence: 2.3 },
  { month: 'فبراير', knowledge: 3.2, skills: 2.9, confidence: 2.8 },
  { month: 'مارس', knowledge: 3.6, skills: 3.3, confidence: 3.2 },
  { month: 'أبريل', knowledge: 4.0, skills: 3.8, confidence: 3.7 },
  { month: 'مايو', knowledge: 4.3, skills: 4.1, confidence: 4.0 },
];

const mockPrePostData = [
  { dimension: 'المعرفة', pre: 2.8, post: 4.3 },
  { dimension: 'المهارات', pre: 2.5, post: 4.1 },
  { dimension: 'الثقة', pre: 2.3, post: 4.0 },
  { dimension: 'التطبيق', pre: 2.0, post: 3.8 },
  { dimension: 'التواصل', pre: 2.6, post: 4.2 },
];

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get('project');
  const [selectedProject, setSelectedProject] = useState(projectIdFromUrl || '');

  const { data: projectsData } = useProjects({ limit: 100 });
  const { data: analysisData, isLoading } = useProjectAnalysis(selectedProject);

  const projectOptions = [
    { value: '', label: 'اختر مشروع' },
    ...(projectsData?.data?.map((p) => ({
      value: p._id,
      label: p.name,
    })) || []),
  ];

  const sentimentColors = [
    { name: 'إيجابي', value: mockSentimentData.breakdown.positive, color: '#22c55e' },
    { name: 'محايد', value: mockSentimentData.breakdown.neutral, color: '#94a3b8' },
    { name: 'سلبي', value: mockSentimentData.breakdown.negative, color: '#ef4444' },
  ];

  return (
    <div>
      <PageHeader
        title="التحليل والرؤى"
        subtitle="تحليل البيانات واستخراج الرؤى من الاستبيانات"
      />

      {/* Project Selector */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select
              label="اختر المشروع"
              options={projectOptions}
              value={selectedProject}
              onChange={setSelectedProject}
              placeholder="اختر مشروع للتحليل"
            />
          </div>
          {selectedProject && (
            <Badge variant="success" size="lg">
              تم تحميل بيانات التحليل
            </Badge>
          )}
        </div>
      </Card>

      {!selectedProject ? (
        <EmptyState
          title="اختر مشروع للتحليل"
          description="اختر مشروعاً من القائمة أعلاه لعرض نتائج التحليل"
          icon={<LightBulbIcon className="h-8 w-8 text-secondary-400" />}
        />
      ) : isLoading ? (
        <Loading text="جاري تحميل التحليلات..." />
      ) : (
        <div className="space-y-6">
          {/* Sentiment & Impact Score */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sentiment Analysis */}
            <Card>
              <CardHeader title="تحليل المشاعر" subtitle="توزيع المشاعر في الردود" />
              <DonutChart
                data={sentimentColors}
                centerValue={`${Math.round(mockSentimentData.score * 100)}%`}
                centerLabel="إيجابي"
                height={200}
                outerRadius={80}
              />
              <div className="mt-4 flex items-center justify-center">
                <Badge
                  variant={
                    mockSentimentData.overall === 'positive'
                      ? 'success'
                      : mockSentimentData.overall === 'negative'
                      ? 'danger'
                      : 'default'
                  }
                  size="lg"
                >
                  {mockSentimentData.overall === 'positive'
                    ? 'إيجابي بشكل عام'
                    : mockSentimentData.overall === 'negative'
                    ? 'سلبي بشكل عام'
                    : 'محايد'}
                </Badge>
              </div>
            </Card>

            {/* Impact Trend */}
            <Card className="lg:col-span-2">
              <CardHeader title="اتجاه الأثر" subtitle="تطور المؤشرات عبر الزمن" />
              <LineChart
                data={mockImpactTrend}
                xKey="month"
                lines={[
                  { dataKey: 'knowledge', name: 'المعرفة', color: '#0ea5e9' },
                  { dataKey: 'skills', name: 'المهارات', color: '#22c55e' },
                  { dataKey: 'confidence', name: 'الثقة', color: '#f59e0b' },
                ]}
                height={200}
              />
            </Card>
          </div>

          {/* Pre/Post Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="مقارنة قبلي / بعدي" subtitle="تحسن المؤشرات بعد التدخل" />
              <BarChart
                data={mockPrePostData}
                xKey="dimension"
                bars={[
                  { dataKey: 'pre', name: 'قبل', color: '#94a3b8' },
                  { dataKey: 'post', name: 'بعد', color: '#0ea5e9' },
                ]}
                height={250}
              />
            </Card>

            <Card>
              <CardHeader title="أبعاد الأثر" subtitle="الأداء عبر الأبعاد المختلفة" />
              <RadarChart
                data={mockPrePostData}
                dataKey="dimension"
                radars={[
                  { dataKey: 'pre', name: 'قبل', color: '#94a3b8', fillOpacity: 0.2 },
                  { dataKey: 'post', name: 'بعد', color: '#0ea5e9', fillOpacity: 0.3 },
                ]}
                height={250}
              />
            </Card>
          </div>

          {/* Topics */}
          <Card>
            <CardHeader
              title="المواضيع المستخرجة"
              subtitle="أبرز المواضيع المذكورة في الردود"
              action={
                <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-secondary-400" />
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTopics.map((topic, index) => (
                <div
                  key={index}
                  className="p-4 bg-secondary-50 rounded-lg border border-secondary-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-secondary-900">{topic.topic}</h4>
                    <Badge
                      variant={
                        topic.sentiment === 'positive'
                          ? 'success'
                          : topic.sentiment === 'negative'
                          ? 'danger'
                          : 'default'
                      }
                      size="sm"
                    >
                      {topic.sentiment === 'positive'
                        ? 'إيجابي'
                        : topic.sentiment === 'negative'
                        ? 'سلبي'
                        : 'محايد'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <ProgressBar
                      value={topic.frequency}
                      max={50}
                      size="sm"
                      variant={
                        topic.sentiment === 'positive'
                          ? 'success'
                          : topic.sentiment === 'negative'
                          ? 'danger'
                          : 'primary'
                      }
                    />
                    <span className="text-sm text-secondary-500">{topic.frequency}%</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {topic.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="text-xs px-2 py-1 bg-white rounded border border-secondary-200"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Insights & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insights */}
            <Card>
              <CardHeader
                title="الرؤى المستخرجة"
                subtitle="رؤى مستخرجة من تحليل البيانات"
                action={<LightBulbIcon className="h-5 w-5 text-secondary-400" />}
              />
              <div className="space-y-4">
                {mockInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 bg-primary-50 rounded-lg border border-primary-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="primary" size="sm">
                        {insight.category}
                      </Badge>
                      <span className="text-xs text-secondary-500">
                        ثقة: {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-secondary-700">{insight.insight}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader
                title="التوصيات"
                subtitle="توصيات لتحسين الأداء"
                action={<SparklesIcon className="h-5 w-5 text-secondary-400" />}
              />
              <div className="space-y-3">
                {mockRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-success-50 rounded-lg border border-success-100"
                  >
                    <div className="w-6 h-6 rounded-full bg-success-500 text-white flex items-center justify-center flex-shrink-0 text-sm">
                      {index + 1}
                    </div>
                    <p className="text-secondary-700">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Impact Summary */}
          <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
            <CardHeader
              title="ملخص الأثر"
              action={<ArrowTrendingUpIcon className="h-5 w-5 text-primary-600" />}
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-600">53%</p>
                <p className="text-sm text-secondary-600">تحسن في المعرفة</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-success-600">64%</p>
                <p className="text-sm text-secondary-600">تحسن في المهارات</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-warning-600">74%</p>
                <p className="text-sm text-secondary-600">تحسن في الثقة</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">4.3/5</p>
                <p className="text-sm text-secondary-600">درجة الأثر الإجمالية</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
