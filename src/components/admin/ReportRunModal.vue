<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div
      class="bg-white rounded shadow w-11/12 max-w-3xl p-4 flex flex-col max-h-[80vh]"
    >
      <div class="flex justify-between items-center mb-4 flex-none">
        <h3 class="font-bold">{{ $t("admin.runReport") }}</h3>
        <button
          @click="$emit('close')"
          class="p-2 rounded hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-700"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div class="overflow-auto flex-1">
        <div v-if="loading" class="p-2">{{ $t("labels.loading") }}</div>
        <div v-else>
          <div v-if="report">
            <h4 class="font-semibold">{{ report.title }}</h4>
            <p class="text-sm text-gray-600">{{ report.description }}</p>

            <div class="mt-4 space-y-4">
              <div v-for="p in report.params || []" :key="p.name" class="mb-2">
                <label class="block text-sm font-medium text-gray-700">{{
                  p.label || (locale !== "en" && p.arName ? p.arName : p.name)
                }}</label>
                <div v-if="!p.type || p.type === 'TEXT'">
                  <input
                    v-model="values[p.name]"
                    class="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-indigo-300"
                  />
                </div>
                
                <div v-else-if="p.type === 'NUMBER'">
                  <input
                    type="number"
                    v-model.number="values[p.name]"
                    class="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-indigo-300"
                  />
                </div>

                <div v-else-if="p.type === 'DATE'">
                  <DateField
                    v-model="values[p.name]"
                    class="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-indigo-300"
                  />
                </div>

                <div v-else-if="p.type === 'BOOLEAN'">
                  <input
                    type="checkbox"
                    v-model="values[p.name]"
                    class="h-4 w-4 text-indigo-600"
                  />
                </div>

                <div v-else-if="p.type === 'DROPDOWN'">
                  <div
                    v-if="paramLoading[p.name]"
                    class="text-sm text-gray-500"
                  >
                    {{ $t("reports.loadingOptions") }}
                  </div>
                  <SearchDropdown
                    :modelValue="selectedLabels[p.name] || ''"
                    :items="paramOptions[p.name] || []"
                    :allItems="paramOptions[p.name] || []"
                    :placeholder="$t('placeholders.search')"
                    itemKey="id"
                    itemLabel="label"
                    :inputClass="'w-full border rounded px-3 py-2 focus:ring-1 focus:ring-indigo-300'"
                    @update:modelValue="(q) => onOptionSearch(p.name, q)"
                    @select="(item) => onSelectOption(p.name, item)"
                  />
                  <div v-if="values[p.name]" class="mt-1 text-sm text-gray-700">
                    {{ $t("reports.selected") }} {{ values[p.name].label }}
                  </div>
                </div>

                <div v-else-if="p.type === 'MULTISELECT'">
                  <div
                    v-if="paramLoading[p.name]"
                    class="text-sm text-gray-500"
                  >
                    {{ $t("reports.loadingOptions") }}
                  </div>
                  <SearchDropdown
                    :modelValue="selectedLabels[p.name] || ''"
                    :items="paramOptions[p.name] || []"
                    :allItems="paramOptions[p.name] || []"
                    :placeholder="$t('placeholders.search')"
                    itemKey="id"
                    itemLabel="label"
                    :inputClass="'w-full border rounded px-3 py-2 focus:ring-1 focus:ring-indigo-300'"
                    @update:modelValue="(q) => onOptionSearch(p.name, q)"
                    @select="(item) => onSelectMulti(p.name, item)"
                  />
                  <div class="flex flex-wrap gap-2 mt-2">
                    <span
                      v-for="it in values[p.name] || []"
                      :key="it.id"
                      class="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <span>{{ it.label }}</span>
                      <button
                        @click="removeMultiItem(p.name, it.id)"
                        class="ml-1 text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 justify-end mt-3">
                <button
                  @click="execute"
                  :disabled="executing"
                  class="px-4 py-2 bg-emerald-600 text-white rounded flex items-center gap-2 hover:bg-emerald-500 transition"
                >
                  <span>{{ executing ? ($t('labels.loading') || 'Loading...') : $t("admin.run") }}</span>
                </button>
                <button
                  @click="downloadCsv"
                  :disabled="!report || !hasExportableRows || !!exportingFormat"
                  class="px-4 py-2 bg-amber-500 text-white rounded flex items-center gap-2 hover:bg-amber-400 transition disabled:opacity-50"
                >
                  <span>{{ exportingFormat === 'csv' ? ($t('labels.loading') || 'Loading...') : ($t('reports.downloadCsv') || 'Download CSV') }}</span>
                </button>
                <button
                  @click="downloadXlsx"
                  :disabled="!report || !hasExportableRows || !!exportingFormat"
                  class="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-500 transition disabled:opacity-50"
                >
                  <span>{{ exportingFormat === 'xlsx' ? ($t('labels.loading') || 'Loading...') : ($t('reports.downloadExcel') || 'Download Excel') }}</span>
                </button>
                <button
                  @click="downloadPdf"
                  :disabled="!report || !hasExportableRows || !!exportingFormat"
                  class="px-4 py-2 bg-rose-600 text-white rounded flex items-center gap-2 hover:bg-rose-500 transition disabled:opacity-50"
                >
                  <span>{{ exportingFormat === 'pdf' ? ($t('labels.loading') || 'Loading...') : ($t('reports.downloadPdf') || 'Download PDF') }}</span>
                </button>
              </div>
              <p v-if="exportError" class="text-sm text-red-600">{{ exportError }}</p>
            </div>

            <div v-if="result">
              <div class="mt-4 flex items-center justify-between">
                <h5 class="font-semibold">{{ $t("labels.results") }}</h5>
              </div>
              <pre dir="ltr" class="text-xs bg-gray-100 p-2 rounded max-h-64 overflow-auto text-left" style="direction:ltr; unicode-bidi:embed;">{{ JSON.stringify(result, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getReportDef, executeReport, getReportParamOptions } from "@/api";
import SearchDropdown from "@/components/shared/SearchDropdown.vue";
import DateField from "@/components/shared/DateField.vue";
import { downloadBlobData, getFilenameFromHeaders } from "@/utils/downloadFile";

export default {
  components: { SearchDropdown, DateField },
  props: ["reportId"],
  setup(props) {
    const { locale, t } = useI18n();
    const report = ref(null);
    const loading = ref(false);
    const values = ref({});
    const result = ref(null);
    const executing = ref(false);
    const exportingFormat = ref("");
    const exportError = ref("");

    const paramOptions = ref({});
    const paramLoading = ref({});
    const selectedLabels = ref({});
    const hasExportableRows = computed(() => {
      if (Array.isArray(result.value)) return result.value.length > 0;
      if (result.value && Array.isArray(result.value.rows)) return result.value.rows.length > 0;
      if (result.value && Array.isArray(result.value.data)) return result.value.data.length > 0;
      return false;
    });

    const getParamByName = (paramName) => (report.value?.params || []).find((p) => p.name === paramName)

    const load = async () => {
      loading.value = true;
      try {
        const res = await getReportDef(props.reportId);
        report.value = res.data;
        (report.value.params || []).forEach((p) => {
          // initialize values
          if (p.type === "MULTISELECT") values.value[p.name] = p.default || [];
          else values.value[p.name] = p.default ?? null;
          // preload options for dropdown/multiselect
          if (p.type === "DROPDOWN" || p.type === "MULTISELECT") {
            loadOptions(p.name);
          }
        });
      } catch (err) {
        console.error("Failed to load report", err);
      } finally {
        loading.value = false;
      }
    };

    async function loadOptions(paramName, q = "") {
      paramLoading.value[paramName] = true;
      try {
        const params = {};
        (report.value?.params || []).forEach((p) => {
          params[p.name] = serializeParamValue(p);
        });
        if (q !== "") params.q = q;
        const res = await getReportParamOptions(props.reportId, paramName, params);
        // normalize items to have { id, label }
        const items = Array.isArray(res.data)
          ? res.data.map((it, idx) => {
              if (it && typeof it === "object") {
                const rawId = it.id ?? it.value ?? it.key ?? idx;
                const normalizedId = String(rawId ?? "").trim();
                const localizedLabel = localizeOptionLabel(paramName, rawId, it.label ?? it.name ?? String(it));
                return {
                  id: rawId,
                  label: localizedLabel,
                };
              }
              return { id: it, label: String(it) };
            })
          : [];
        paramOptions.value[paramName] = items;
      } catch (err) {
        console.error("Failed to load options for", paramName, err);
        paramOptions.value[paramName] = [];
      } finally {
        paramLoading.value[paramName] = false;
      }
    }

    function serializeParamValue(p) {
      const val = values.value[p.name];
      if (p.type === "DROPDOWN") {
        if (!val || typeof val !== "object") return null;
        return val.id ?? val.value ?? val;
      }
      if (p.type === "MULTISELECT") {
        if (!Array.isArray(val)) return [];
        return val.map((it) => it && (it.id ?? it.value ?? it));
      }
      if (p.type === "NUMBER")
        return val !== null && val !== undefined && val !== ""
          ? Number(val)
          : null;
      if (p.type === "BOOLEAN") return Boolean(val);
      return val === "" || val === null || val === undefined ? null : val;
    }

    function localizeOptionLabel(paramName, rawId, fallbackLabel) {
      const key = String(rawId ?? "").trim().toLowerCase();
      if (paramName === "module") {
        const moduleLabels = {
          supply: t("payments.modules.supply") || "Supply",
          transport: t("payments.modules.transport") || "Transport",
          rentals: t("payments.modules.rentals") || "Equipment Rental",
          extract: t("payments.modules.extract") || "Extract",
        };
        return moduleLabels[key] || fallbackLabel;
      }
      if (paramName === "accountType") {
        const accountTypeLabels = {
          supply: t("payments.accountTypes.supply") || "Supply",
          transport: t("payments.accountTypes.transport") || "Transport",
          rental: t("payments.accountTypes.rental") || "Rental",
          extract: t("payments.accountTypes.extract") || "Extract",
        };
        return accountTypeLabels[key] || fallbackLabel;
      }
      if (paramName === "paymentMethod") {
        const paymentMethodLabels = {
          cash: t("payments.methods.cash") || "Cash",
          bank: t("payments.methods.bank") || "Bank",
        };
        return paymentMethodLabels[key] || fallbackLabel;
      }
      return fallbackLabel;
    }

    const buildExecutePayload = () => {
      const params = {};
      (report.value?.params || []).forEach((p) => {
        params[p.name] = serializeParamValue(p);
      });
      return { params };
    };

    const execute = async () => {
      try {
        executing.value = true;
        exportError.value = "";
        const res = await executeReport(props.reportId, buildExecutePayload());
        result.value = res.data;
      } catch (err) {
        console.error("Execute failed", err);
        alert("Execute failed");
      } finally {
        executing.value = false;
      }
    };

    function onOptionSearch(paramName, q) {
      selectedLabels.value[paramName] = q;
      if (getParamByName(paramName)?.type === "DROPDOWN") {
        values.value[paramName] = null;
      }
      // fetch options for this query
      loadOptions(paramName, q);
    }

    const downloadReport = async (format) => {
      exportingFormat.value = format
      exportError.value = ""

      if (!hasExportableRows.value) {
        exportError.value = t("reports.noResults") || "No results"
        exportingFormat.value = ""
        return
      }

      try {
        const res = await executeReport(props.reportId, buildExecutePayload(), {
          format,
          lang: locale.value === "ar" ? "ar" : "en",
          responseType: "blob"
        })
        const fallbackName = `dynamic-report-${props.reportId}.${format}`
        const filename = getFilenameFromHeaders(res.headers, fallbackName) || fallbackName
        const mimeType = res.headers?.["content-type"] || res.headers?.["Content-Type"] || "application/octet-stream"
        downloadBlobData(res.data, filename, mimeType)
      } catch (err) {
        console.error(`Dynamic report ${format} export failed`, err)
        exportError.value = err?.response?.data?.message || t("reports.downloadError") || "Export failed"
      } finally {
        exportingFormat.value = ""
      }
    }

    const downloadCsv = () => downloadReport("csv")
    const downloadXlsx = () => downloadReport("xlsx")
    const downloadPdf = () => downloadReport("pdf")

    function onSelectOption(paramName, item) {
      // for dropdown: set single object
      values.value[paramName] = item;
      selectedLabels.value[paramName] = item?.label || "";
      if (paramName === "module" || paramName === "accountType") {
        values.value.contractorId = null;
        selectedLabels.value.contractorId = "";
        loadOptions("contractorId");
      }
    }

    function onSelectMulti(paramName, item) {
      if (!Array.isArray(values.value[paramName])) values.value[paramName] = [];
      const exists = values.value[paramName].some((x) => x.id === item.id);
      if (!exists) values.value[paramName].push(item);
      selectedLabels.value[paramName] = "";
    }

    function removeMultiItem(paramName, id) {
      if (!Array.isArray(values.value[paramName])) return;
      values.value[paramName] = values.value[paramName].filter(
        (x) => x.id !== id,
      );
    }

    watch(() => props.reportId, load, { immediate: true })
    return { report, loading, values, execute, executing, result, exportingFormat, exportError, paramOptions, paramLoading, selectedLabels, hasExportableRows, onOptionSearch, onSelectOption, onSelectMulti, removeMultiItem, locale, downloadCsv, downloadXlsx, downloadPdf }
  }
}
</script>
