export interface TableSchema {
  name: string;
  description: string;
  columns: {
    name: string;
    type: string;
    notes?: string;
    isKey?: boolean;
    isFk?: boolean;
    isConcurrency?: boolean;
  }[];
}

export interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requestBody?: string;
  response?: string;
}

export enum SimulationState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED'
}

export interface QueueUser {
  id: string;
  status: 'queue' | 'active' | 'purchased' | 'booted';
  entryTime: number;
}
