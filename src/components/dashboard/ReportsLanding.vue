<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0">
    <div class="max-w-4xl mx-auto mt-8 sm:mt-16 text-center px-4">
      <div class="inline-flex items-center justify-center p-6 bg-slate-100 rounded-full mb-6 theme-dashboard-bg-soft">
        <ChartBarIcon class="w-16 h-16 theme-text" />
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold theme-text-primary mb-4">
        {{ isRTL ? 'تقارير النظام' : 'System Reports' }}
      </h1>
      <p class="text-base theme-text-secondary max-w-lg mx-auto mb-8">
        {{ isRTL ? 'الرجاء اختيار أحد التقارير الديناميكية من القائمة الجانبية لعرض وتصفية البيانات.' : 'Please select a dynamic report from the sidebar to view and filter the data.' }}
      </p>
      
      <div class="border border-slate-200/80 bg-white rounded-2xl p-6 shadow-md max-w-md mx-auto text-start">
        <h3 class="text-sm font-semibold theme-text-primary mb-3 flex items-center gap-2">
          <InformationCircleIcon class="w-5 h-5 text-amber-500" />
          <span>{{ isRTL ? 'حول التقارير الديناميكية' : 'About Dynamic Reports' }}</span>
        </h3>
        <ul class="space-y-2 text-xs theme-text-muted">
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
            <span>{{ isRTL ? 'يتم سحب وتحديث هذه التقارير مباشرة من قاعدة بيانات النظام.' : 'These reports are fetched and updated directly from the system database.' }}</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
            <span>{{ isRTL ? 'يمكنك تصفية البيانات باستخدام معايير محددة وتصدير النتائج كملف Excel أو PDF أو CSV.' : 'You can filter the data using specific criteria and export results as Excel, PDF, or CSV.' }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChartBarIcon, InformationCircleIcon } from '@acme/icon-packs/legacy'

export default {
  name: 'ReportsLanding',
  components: {
    ChartBarIcon,
    InformationCircleIcon
  },
  setup() {
    const { locale } = useI18n()
    const isRTL = computed(() => locale.value === 'ar')
    return {
      isRTL
    }
  }
}
</script>
