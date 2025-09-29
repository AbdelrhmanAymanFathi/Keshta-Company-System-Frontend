<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6">
    <div class="bg-white rounded-xl shadow-md p-6">
      <div class="flex items-start justify-between gap-4">
        <h2 class="text-2xl font-semibold">{{ $t('dashboard.newSupply') }}</h2>

        <!-- site/area summary on desktop -->
        <div v-if="step2" class="hidden sm:flex flex-col items-end text-sm text-gray-600">
          <div><span class="font-medium">{{ $t('labels.site') }}:</span> {{ site ? site.name : '' }}</div>
          <div><span class="font-medium">{{ $t('labels.area') }}:</span> {{ area ? area.name : '' }}</div>
        </div>
      </div>

      <!-- Step 1: select site & area -->
      <div v-if="!step2" class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block mb-1 font-medium">{{ $t('labels.site') }}</label>
          <div class="flex gap-2">
            <select v-model="site" class="w-full border rounded-md px-3 py-2">
              <option :value="null">{{ $t('labels.site') }} —</option>
              <option v-for="s in sites" :key="s.id" :value="s">{{ s.name }}</option>
            </select>
            <button @click="showAddSite = true" class="bg-green-500 text-white px-2 py-1 rounded" title="Add Site">+</button>
            <button v-if="site" @click="editSiteDialog(site)" class="bg-yellow-400 text-white px-2 py-1 rounded" title="Edit Site">✎</button>
          </div>
        </div>

        <div>
          <label class="block mb-1 font-medium">{{ $t('labels.area') }}</label>
          <div class="flex gap-2">
            <select v-model="area" class="w-full border rounded-md px-3 py-2">
              <option :value="null">{{ $t('labels.area') }} —</option>
              <option v-for="a in areas" :key="a.id" :value="a">{{ a.name }}</option>
            </select>
            <button v-if="site" @click="showAddArea = true" class="bg-green-500 text-white px-2 py-1 rounded" title="Add Area">+</button>
            <button v-if="area" @click="editAreaDialog(area)" class="bg-yellow-400 text-white px-2 py-1 rounded" title="Edit Area">✎</button>
          </div>
        </div>

        <div class="sm:col-span-2 flex items-center gap-3 mt-2">
          <button :disabled="!site || !area"
                  @click="goToTable"
                  class="ml-auto sm:ml-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50">
            {{ $t('labels.next') }}
          </button>
          <button v-if="site || area" @click="clearSiteArea" class="px-4 py-2 border rounded text-sm">
            {{ $t('labels.cancel') }}
          </button>
        </div>
      </div>

      <!-- Step 2: table / excel-like -->
      <div v-else class="mt-6">
        <!-- mobile site/area row -->
        <div class="sm:hidden mb-4 text-sm text-gray-700">
          <div><span class="font-medium">{{ $t('labels.site') }}:</span> {{ site ? site.name : '' }}</div>
          <div><span class="font-medium">{{ $t('labels.area') }}:</span> {{ area ? area.name : '' }}</div>
        </div>

        <!-- responsive table -->
        <div class="overflow-x-auto">
          <!-- desktop table -->
          <table class="min-w-full divide-y divide-gray-200 border">
            <thead class="bg-indigo-50">
              <tr>
                <th class="px-3 py-2 w-10">#</th>
                <th class="px-3 py-2">{{ $t('labels.date') }}</th>
                <th class="px-3 py-2">{{ $t('labels.contractor') }}</th>
                <th class="px-3 py-2">{{ $t('labels.crusher') }}</th>
                <th class="px-3 py-2">{{ $t('labels.vehicle') }}</th>
                <th class="px-3 py-2">{{ $t('labels.crusherBon') }}</th>
                <th class="px-3 py-2">{{ $t('labels.companyBon') }}</th>
                <th class="px-3 py-2">{{ $t('labels.discount') }}</th>
                <th class="px-3 py-2">{{ $t('labels.price') }}</th>
                <th class="px-3 py-2">{{ $t('labels.cubic') }}</th>
                <th class="px-3 py-2">{{ $t('labels.total') }}</th>
                <th class="px-3 py-2">{{ $t('labels.actions') }}</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">
              <tr v-for="(row, index) in rows" :key="row.id" class="bg-white">
                <td class="px-3 py-2 align-top text-sm">{{ index + 1 }}</td>

                <td class="px-3 py-2">
                  <input type="date" v-model="row.date" class="w-full border rounded-md px-2 py-1" />
                </td>

                <td class="px-3 py-2">
                  <select v-model="row.contractor" class="w-full border rounded-md px-2 py-1">
                    <option :value="null">{{ $t('labels.contractor') }} —</option>
                    <option v-for="c in contractors" :key="c.id" :value="c">{{ c.name }}</option>
                  </select>
                </td>

                <td class="px-3 py-2">
                  <select v-model="row.crusher" @change="updateVehicles(row)" class="w-full border rounded-md px-2 py-1">
                    <option :value="null">{{ $t('labels.crusher') }} —</option>
                    <option v-for="c in crushers" :key="c.id" :value="c">{{ c.name }}</option>
                  </select>
                </td>

                <td class="px-3 py-2">
                  <select v-model="row.vehicle" @change="onVehicleSelect(row)" class="w-full border rounded-md px-2 py-1">
                    <option :value="null">{{ $t('labels.vehicle') }} —</option>
                    <option v-for="v in row.availableVehicles" :key="v.id" :value="v">{{ v.name }}</option>
                  </select>
                </td>

                <td class="px-3 py-2">
                  <input type="text" v-model="row.crusherBon" class="w-full border rounded-md px-2 py-1" />
                </td>

                <td class="px-3 py-2">
                  <input type="text" v-model="row.companyBon" class="w-full border rounded-md px-2 py-1" />
                </td>

                <td class="px-3 py-2">
                  <input
                    type="number"
                    inputmode="numeric"
                    v-model.number="row.discount"
                    class="w-full border rounded-md px-2 py-1"
                    placeholder="0"
                  />
                </td>

                <!-- price and cubic: no spinner, keyboard entry only -->
                <td class="px-3 py-2">
                  <input
                    type="number"
                    step="any"
                    inputmode="decimal"
                    v-model.number="row.price"
                    class="w-full border rounded-md px-2 py-1 no-spinner"
                    placeholder="0"
                  />
                </td>

                <td class="px-3 py-2">
                  <input
                    type="number"
                    step="any"
                    inputmode="decimal"
                    v-model.number="row.cubic"
                    class="w-full border rounded-md px-2 py-1 no-spinner"
                    placeholder="0"
                  />
                </td>

                <td class="px-3 py-2 font-semibold">{{ formatNumber(totalPerRow(row)) }}</td>

                <td class="px-3 py-2">
                  <div class="flex gap-2">
                    <button @click="duplicateRow(index)" title="Duplicate" class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
                      ⤷
                    </button>
                    <button @click="removeRow(index)" class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile: show rows as cards for easier editing -->
        <div class="sm:hidden mt-4 space-y-3">
          <div v-for="(row, i) in rows" :key="row.id" class="bg-white p-3 rounded-md shadow">
            <div class="flex justify-between items-start mb-2">
              <div class="text-sm font-medium">{{ $t('labels.date') }}: <span class="font-normal">{{ row.date }}</span></div>
              <div class="text-sm font-medium">{{ i+1 }}</div>
            </div>

            <div class="grid grid-cols-1 gap-2">
              <label class="text-sm">
                {{ $t('labels.contractor') }}
                <select v-model="row.contractor" class="w-full border rounded-md px-2 py-1">
                  <option :value="null">{{ $t('labels.contractor') }} —</option>
                  <option v-for="c in contractors" :key="c.id" :value="c">{{ c.name }}</option>
                </select>
              </label>

              <label class="text-sm">
                {{ $t('labels.crusher') }}
                <select v-model="row.crusher" @change="updateVehicles(row)" class="w-full border rounded-md px-2 py-1">
                  <option :value="null">{{ $t('labels.crusher') }} —</option>
                  <option v-for="c in crushers" :key="c.id" :value="c">{{ c.name }}</option>
                </select>
              </label>

              <label class="text-sm">
                {{ $t('labels.vehicle') }}
                <select v-model="row.vehicle" @change="onVehicleSelect(row)" class="w-full border rounded-md px-2 py-1">
                  <option :value="null">{{ $t('labels.vehicle') }} —</option>
                  <option v-for="v in row.availableVehicles" :key="v.id" :value="v">{{ v.name }}</option>
                </select>
              </label>

              <label class="text-sm">
                {{ $t('labels.cubic') }}
                <input type="number" step="any" inputmode="decimal" v-model.number="row.cubic" class="w-full border rounded-md px-2 py-1 no-spinner" />
              </label>

              <label class="text-sm">
                {{ $t('labels.price') }}
                <input type="number" step="any" inputmode="decimal" v-model.number="row.price" class="w-full border rounded-md px-2 py-1 no-spinner" />
              </label>

              <div class="flex gap-2 mt-1">
                <button @click="duplicateRow(i)" class="flex-1 bg-gray-200 px-3 py-2 rounded">{{ $t('labels.addRow') }}</button>
                <button @click="removeRow(i)" class="flex-1 bg-red-500 text-white px-3 py-2 rounded">{{ $t('labels.delete') }}</button>
              </div>

              <div class="text-right font-semibold">{{ $t('labels.total') }}: {{ formatNumber(totalPerRow(row)) }}</div>
            </div>
          </div>
        </div>

        <!-- actions & summary -->
        <div class="mt-4 sm:flex sm:items-center sm:justify-between gap-4">
          <div class="flex gap-2">
            <button @click="addRow" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              {{ $t('labels.addRow') }}
            </button>
            <button @click="resetRows" class="px-4 py-2 border rounded">{{ $t('labels.cancel') }}</button>
          </div>

          <div class="mt-3 sm:mt-0 text-sm text-gray-700">
            <div><span class="font-medium">Subtotal:</span> {{ formatNumber(subtotal) }}</div>
            <div><span class="font-medium">Total Discount:</span> -{{ formatNumber(totalDiscount) }}</div>
            <div class="font-semibold mt-1">Grand Total: {{ formatNumber(grandTotal) }}</div>
            <div class="text-xs text-gray-500 mt-1">Values calculated automatically (Price × Cubic − Discount).</div>
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-3">
          <button @click="saveData" :disabled="saving" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            {{ saving ? ($t('labels.saving') || 'Saving...') : ($t('labels.saveSupply') || 'Save') }}
          </button>
        </div>
        <div v-if="saveError" class="mt-2 text-red-600 text-sm break-words">{{ saveError }}</div>
      </div>
    </div>

    <!-- Add Site Dialog -->
    <div v-if="showAddSite" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-80">
        <h3 class="text-lg font-bold mb-2">Add Site</h3>
        <input v-model="newSiteName" placeholder="Site name" class="w-full border rounded px-2 py-1 mb-2" />
        <div class="flex gap-2 justify-end">
          <button @click="showAddSite = false" class="px-3 py-1 border rounded">Cancel</button>
          <button @click="addSite" :disabled="!newSiteName" class="bg-green-600 text-white px-3 py-1 rounded">Add</button>
        </div>
      </div>
    </div>
    <!-- Add Area Dialog -->
    <div v-if="showAddArea" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-80">
        <h3 class="text-lg font-bold mb-2">Add Area</h3>
        <input v-model="newAreaName" placeholder="Area name" class="w-full border rounded px-2 py-1 mb-2" />
        <div class="flex gap-2 justify-end">
          <button @click="showAddArea = false" class="px-3 py-1 border rounded">Cancel</button>
          <button @click="addArea" :disabled="!newAreaName" class="bg-green-600 text-white px-3 py-1 rounded">Add</button>
        </div>
      </div>
    </div>
    <!-- Edit Site Dialog -->
    <div v-if="editSiteObj" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-80">
        <h3 class="text-lg font-bold mb-2">Edit Site</h3>
        <input v-model="editSiteName" class="w-full border rounded px-2 py-1 mb-2" />
        <div class="flex gap-2 justify-end">
          <button @click="editSiteObj = null" class="px-3 py-1 border rounded">Cancel</button>
          <button @click="updateSite" :disabled="!editSiteName" class="bg-yellow-500 text-white px-3 py-1 rounded">Save</button>
        </div>
      </div>
    </div>
    <!-- Edit Area Dialog -->
    <div v-if="editAreaObj" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-80">
        <h3 class="text-lg font-bold mb-2">Edit Area</h3>
        <input v-model="editAreaName" class="w-full border rounded px-2 py-1 mb-2" />
        <div class="flex gap-2 justify-end">
          <button @click="editAreaObj = null" class="px-3 py-1 border rounded">Cancel</button>
          <button @click="updateArea" :disabled="!editAreaName" class="bg-yellow-500 text-white px-3 py-1 rounded">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { createLocation, updateLocation, getLocations, getContractors, getCrushers, getVehicles, createDelivery } from '../../api'

export default {
  name: 'NewSupply',
  data() {
    return {
      step2: false,
      site: null,
      area: null,
      sites: [],
      areas: [],
      allLocations: [],
      rows: [
        {
          id: Date.now(),
          date: '',
          contractor: null,
          crusher: null,
          vehicle: null, // optional
          crusherBon: '',
          companyBon: '',
          discount: 0,
          price: 0,
          cubic: 0,
          availableVehicles: []
        }
      ],
      contractors: [],
      crushers: [],
      vehicles: [],
      saveError: '',
      locations: [],
      selectedLocation: null,
      deliveries: [],
      showAddSite: false,
      showAddArea: false,
      newSiteName: '',
      newAreaName: '',
      editSiteObj: null,
      editSiteName: '',
      editAreaObj: null,
      editAreaName: '',
      saving: false
    }
  },
  async mounted() {
    try {
      const locRes = await getLocations();
      this.allLocations = Array.isArray(locRes.data) ? locRes.data : [];
      this.sites = this.allLocations.filter(l => l.parentId == null);
      this.locations = locRes.data;
    } catch (e) { console.warn('getLocations failed', e) }

    try {
      const contRes = await getContractors();
      this.contractors = Array.isArray(contRes.data) ? contRes.data : [];
    } catch (e) { console.warn('getContractors failed', e) }

    try {
      const crushersRes = await getCrushers();
      this.crushers = Array.isArray(crushersRes.data) ? crushersRes.data : [];
    } catch (e) { console.warn('getCrushers failed', e) }

    try {
      const vehiclesRes = await getVehicles();
      this.vehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];
    } catch (e) { console.warn('getVehicles failed', e) }
  },
  watch: {
    site(newSiteObj) {
      if (newSiteObj && newSiteObj.id) {
        this.areas = this.allLocations.filter(l => l.parentId === newSiteObj.id);
      } else {
        this.areas = [];
      }
      this.area = null;
    }
  },
  computed: {
    isRTL() {
      return this.$i18n && this.$i18n.locale === 'ar'
    },
    subtotal() {
      return this.rows.reduce((sum, r) => sum + ((parseFloat(r.price || 0) * parseFloat(r.cubic || 0)) || 0), 0)
    },
    totalDiscount() {
      return this.rows.reduce((sum, r) => sum + (parseFloat(r.discount || 0) || 0), 0)
    },
    grandTotal() {
      const g = this.subtotal - this.totalDiscount
      return g > 0 ? g : 0
    }
  },
  methods: {
    goToTable() {
      if (!this.site || !this.area) return;
      this.step2 = true;
      if (this.rows && this.rows.length) {
        this.rows.forEach(r => {
          if (!r.date) r.date = new Date().toISOString().slice(0, 10);
        });
      }
    },
    clearSiteArea() {
      this.site = null
      this.area = null
    },
    addRow() {
      this.rows.push({
        id: Date.now() + Math.random(),
        date: '',
        contractor: null,
        crusher: null,
        vehicle: null,
        crusherBon: '',
        companyBon: '',
        discount: 0,
        price: 0,
        cubic: 0,
        availableVehicles: []
      })
      this.$nextTick(() => {
        const tbl = this.$el.querySelector('table')
        if (tbl) tbl.scrollLeft = tbl.scrollWidth
      })
    },
    duplicateRow(index) {
      const src = this.rows[index]
      const copy = JSON.parse(JSON.stringify(src))
      copy.id = Date.now() + Math.random()
      this.rows.splice(index + 1, 0, copy)
    },
    removeRow(index) {
      this.rows.splice(index, 1)
      if (this.rows.length === 0) this.addRow()
    },
    resetRows() {
      this.rows = [
        {
          id: Date.now(),
          date: '',
          contractor: null,
          crusher: null,
          vehicle: null,
          crusherBon: '',
          companyBon: '',
          discount: 0,
          price: 0,
          cubic: 0,
          availableVehicles: []
        }
      ]
    },
    updateVehicles(row) {
      const selectedCrusher = row.crusher
      row.availableVehicles = selectedCrusher ? selectedCrusher.vehicles : []
      row.vehicle = null
      row.cubic = 0
    },
    onVehicleSelect(row) {
      const v = row.vehicle
      if (v && v.cubic) {
        row.cubic = v.cubic
      }
    },
    totalPerRow(row) {
      const price = parseFloat(row.price || 0) || 0
      const cubic = parseFloat(row.cubic || 0) || 0
      const discount = parseFloat(row.discount || 0) || 0
      const total = (price * cubic) - discount
      return total > 0 ? total : 0
    },
    formatNumber(v) {
      return Number(v).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 })
    },
    async saveData() {
      this.saveError = '';
      this.saving = true;

      try {
        console.log('Saving rows:', JSON.parse(JSON.stringify(this.rows)));

        // rows that actually contain any data
        const rowsToSave = this.rows.filter(r => {
          const hasAny =
            (r.date && r.date.toString().trim() !== '') ||
            (r.contractor) ||
            (r.crusher) ||
            (r.price && Number(r.price) !== 0) ||
            (r.cubic && Number(r.cubic) !== 0) ||
            (r.discount && Number(r.discount) !== 0) ||
            (r.crusherBon && r.crusherBon.toString().trim() !== '') ||
            (r.companyBon && r.companyBon.toString().trim() !== '');
          return hasAny;
        });

        if (rowsToSave.length === 0) {
          this.saveError = 'No rows to save. يرجى إدخال بيانات على الأقل في صف واحد.';
          return;
        }

        // validate required fields for rows with data (vehicle is OPTIONAL)
        for (const [i, r] of rowsToSave.entries()) {
          const missing = [];
          if (!r.date || r.date.toString().trim() === '') missing.push('date');
          if (!r.contractor) missing.push('contractor');
          if (!r.crusher) missing.push('crusher');
          if (missing.length) {
            this.saveError = `Please fill required fields (${missing.join(', ')}) in row ${i + 1}. / من فضلك املأ: ${missing.join(', ')} في الصف ${i + 1}.`;
            console.warn('Row missing fields:', { rowIndex: i + 1, row: r, missing });
            return;
          }
        }

        // set Authorization header globally if token present
        const token = localStorage.getItem('accessToken');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // send each row
        for (const r of rowsToSave) {
          const payload = {
            crusherId: Number(r.crusher.id),
            contractorId: Number(r.contractor.id),
            locationId: this.area ? Number(this.area.id) : null,
            date: r.date,
            crusherTicket: r.crusherBon || null,
            companyTicket: r.companyBon || null,
            companyCapacity: r.cubic ? parseFloat(r.cubic) : 0,
            crusherCapacity: r.cubic ? parseFloat(r.cubic) : 0,
            unitPrice: r.price ? parseFloat(r.price) : 0,
            discount: r.discount ? parseFloat(r.discount) : 0,
            vehicleName: r.vehicle ? (r.vehicle.name || (typeof r.vehicle === 'string' ? r.vehicle : null)) : null,
            notes: r.notes || null
          };

          console.log('Posting payload:', payload);
          await createDelivery(payload);
        }

        alert(this.$t('labels.saveSupply') + ' — OK');
      } catch (e) {
        console.error('Error saving supply (full error):', e);
        const resp = e && e.response && e.response.data ? e.response.data : null;
        const status = e && e.response && e.response.status ? e.response.status : (e && e.status) || 'unknown';

        let userMsg = `Error saving supply (HTTP ${status}). / خطأ أثناء الحفظ (الكود ${status}).`;

        if (resp) {
          // include common server error shapes
          if (typeof resp === 'string') {
            userMsg += ` ${resp}`;
          } else if (resp.message) {
            userMsg += ` ${resp.message}`;
          }

          if (resp.errors) {
            try {
              userMsg += ` Details: ${JSON.stringify(resp.errors)}`;
            } catch (ex) { /* ignore */ }
          } else if (resp.validation) {
            try {
              userMsg += ` Details: ${JSON.stringify(resp.validation)}`;
            } catch (ex) { /* ignore */ }
          }

          console.log('Server response body:', resp);
        } else {
          if (e && e.message) userMsg += ` ${e.message}`;
        }

        this.saveError = userMsg;
      } finally {
        this.saving = false;
      }
    },
    async onLocationChange() {
      try {
        this.crushers = (await getCrushers()).data;
        this.contractors = (await getContractors()).data;
      } catch (e) { console.warn('onLocationChange error', e) }

      this.deliveries = [
        {
          crusherId: '',
          contractorId: '',
          date: new Date().toISOString().slice(0, 10),
          crusherTicket: '',
          companyTicket: '',
          companyCapacity: '',
          crusherCapacity: '',
          unitPrice: '',
          locationId: this.selectedLocation
        }
      ]
    },
    async submitDeliveries() {
      for (const row of this.deliveries) {
        await createDelivery(row)
      }
      alert(this.$t('labels.saved') || 'Saved!')
      this.deliveries = []
      this.selectedLocation = null
    },
    async addSite() {
      if (!this.newSiteName) return
      try {
        await createLocation({ name: this.newSiteName, parentId: null })
        this.showAddSite = false
        this.newSiteName = ''
        await this.refreshLocations()
      } catch (e) {
        alert('Failed to add site')
      }
    },
    async addArea() {
      if (!this.newAreaName || !this.site) return
      try {
        await createLocation({ name: this.newAreaName, parentId: this.site.id })
        this.showAddArea = false
        this.newAreaName = ''
        await this.refreshLocations()
      } catch (e) {
        alert('Failed to add area')
      }
    },
    editSiteDialog(site) {
      this.editSiteObj = site
      this.editSiteName = site.name
    },
    async updateSite() {
      if (!this.editSiteObj || !this.editSiteName) return
      try {
        await updateLocation(this.editSiteObj.id, { name: this.editSiteName })
        this.editSiteObj = null
        this.editSiteName = ''
        await this.refreshLocations()
      } catch (e) {
        alert('Failed to update site')
      }
    },
    editAreaDialog(area) {
      this.editAreaObj = area
      this.editAreaName = area.name
    },
    async updateArea() {
      if (!this.editAreaObj || !this.editAreaName) return
      try {
        await updateLocation(this.editAreaObj.id, { name: this.editAreaName })
        this.editAreaObj = null
        this.editAreaName = ''
        await this.refreshLocations()
      } catch (e) {
        alert('Failed to update area')
      }
    },
    async refreshLocations() {
      try {
        const locRes = await getLocations();
        this.allLocations = Array.isArray(locRes.data) ? locRes.data : [];
        this.sites = this.allLocations.filter(l => l.parentId == null);
        if (this.site && this.site.id) {
          this.areas = this.allLocations.filter(l => l.parentId === this.site.id);
        } else {
          this.areas = [];
        }
        this.locations = locRes.data
      } catch (e) {
        console.warn('refreshLocations failed', e)
      }
    },
  }
}
</script>

<style scoped>
/* remove number spinners for Chrome/Edge and Firefox so users type values only */
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinner {
  -moz-appearance: textfield;
}

/* RTL helpers */
.direction-rtl input,
.direction-rtl select,
.direction-rtl textarea {
  direction: rtl;
  text-align: right;
}

/* improve table readability on small screens */
@media (max-width: 639px) {
  table {
    display: none; /* hide big table on small screens (we show cards instead) */
  }
}
@media (min-width: 640px) {
  .sm\:hidden { display: none; }
}
</style>
