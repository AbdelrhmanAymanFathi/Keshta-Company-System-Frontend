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
