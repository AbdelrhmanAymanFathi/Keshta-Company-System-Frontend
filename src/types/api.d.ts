// New flat Export shape (server computes `total`)
export interface Export {
  id: string;
  contractorId: number;
  contractor?: { id: number; name?: string };
  vehicleId?: number | null;
  vehicle?: { id: number; name?: string };
  itemId?: number | null;
  companyCapacity?: number | null;
  crusherCapacity?: number | null;
  unitPrice?: number | null;
  discount?: number | null;
  total: number;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  locationId?: number | null;
  areaId?: number | null;
}

// New flat Transport shape
export interface Transport {
  id: string;
  contractorId: number;
  contractor?: { id: number; name?: string };
  vehicleId?: number | null;
  vehicle?: { id: number; name?: string };
  distanceKm: number;
  numTrips: number;
  discount?: number | null;
  firstKmPrice?: number | null;
  perKmPrice?: number | null;
  pricing?: { firstKm?: number; firstKmPrice?: number | null; perKmPrice?: number | null };
  total: number;
  vehicleCompanyCapacity?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

// Payment / wallet transaction shapes
export interface Payment {
  id?: string;
  amount: number;
  date: string; // ISO
  method?: string;
  notes?: string;
  exportId?: string | number;
  // New field after migration: supplyId (backwards-compatible with exportId)
  supplyId?: string | number;
  transportId?: string | number;
}

export type ContractorAccountType = 'EXPORT' | 'SUPPLY' | 'TRANSPORT' | 'GENERAL' | 'EXPENSE' | 'OTHER';

export interface ContractorAccount {
  id: string;
  contractorId: string;
  accountType: ContractorAccountType;
  balance: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Contractor {
  id: string;
  name: string;
  phone?: string;
  availableForExports?: boolean;
  // New flag indicating contractor can be used for supplies
  availableForSupplies?: boolean;
  availableForTransports?: boolean;
  accounts: ContractorAccount[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface ContractorAccountTransaction {
  id: string;
  accountId: string;
  contractorId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  transactionType?: string;
  description?: string | null;
  createdAt: string;
}

// Equipment Log
export interface EquipmentLog {
  id: number | string;
  date: string;
  equipmentId: number;
  equipment?: { id: number; name?: string } | string;
  hours?: number;
  hourlyRate?: number;
  total?: number;
  note?: string | null;
  notes?: string | null;
  isRental?: boolean;
  driverId?: number | null;
  driver?: { id: number; name?: string } | null;
  locationId?: number | null;
  areaId?: number | null;
  location?: { id: number; name?: string } | null;
  area?: { id: number; name?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Extract {
  id: number | string;
  date: string;
  contractorId?: number | null;
  contractor?: { id: number; name?: string } | null;
  locationId?: number | null;
  areaId?: number | null;
  location?: { id: number; name?: string } | null;
  area?: { id: number; name?: string } | null;
  total?: number;
  notes?: string | null;
  lines?: ExtractLine[];
  createdAt?: string;
  updatedAt?: string | null;
}

export interface ExtractLine {
  id?: number | string;
  extractId?: number | string;
  itemId: number;
  item?: { id: number; name?: string; unit?: { id: number | string; name?: string } | null } | null;
  quantity: number;
  price?: number | null;
  total?: number | null;
}

export interface PaginatedExtractsResponse {
  items: Extract[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Item shape used across the app
export interface Item {
  id: number | string;
  name: string;
  unitId?: number | null;
  unit?: { id: number | string; name?: string } | null;
  currentPrice?: number | null; // legacy field
  defaultSupplyPrice?: number | null;
  defaultTransportPrice?: number | null;
  defaultExtractPrice?: number | null; // new field
  availableForSupplies?: boolean;
  availableForTransports?: boolean;
  availableForExtracts?: boolean;
  availableForExports?: boolean;
  notes?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface ReportFieldMeta {
  name: string;
  label?: string;
  arName?: string;
  dataType?: string;
  type?: string;
  paramType?: string;
  suggestedParamType?: string;
  summarizable?: boolean;
  important?: boolean;
  position?: number;
}

export interface ReportDefinition {
  id?: number | string;
  key: string;
  title: string;
  arTitle?: string;
  module?: string;
  description?: string;
  queryText?: string;
  sourceTable?: string;
  tableName?: string;
  table?: string;
  active?: boolean;
  importantColumns?: string[];
  fields?: ReportFieldMeta[];
  params?: ReportFieldMeta[];
  reportParameter?: ReportFieldMeta[];
}

export interface DynamicReportTotalsRow {
  __rowType: 'TOTALS';
  __isTotalsRow: true;
  [key: string]: unknown;
}

export interface DynamicReportExecutionResult {
  rows?: Array<Record<string, unknown>>;
  totalsRow?: DynamicReportTotalsRow | null;
  importantColumns?: string[];
  related?: Record<string, unknown>;
  data?: Array<Record<string, unknown>>;
}

export interface ContractorStatementRow {
  date?: string;
  type: string;
  refId?: string | number | null;
  description?: string | null;
  debit?: number | null;
  credit?: number | null;
  balance?: number | null;
  earnings?: number | null;
  payments?: number | null;
  balanceOwed?: number | null;
}

export interface ContractorStatementTotalsRow extends ContractorStatementRow {
  type: 'TOTAL';
}
