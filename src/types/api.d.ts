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
  rate?: number | null;
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
  transportId?: string | number;
}

export interface ContractorWallet {
  contractorId: number;
  balance: number;
}

export interface ContractorWalletTransaction {
  id: string;
  contractorId: number;
  type: string;
  amount: number; // raw amount (positive)
  signedAmount: number; // positive for deposits, negative for withdrawals
  description?: string | null;
  createdAt: string;
}
