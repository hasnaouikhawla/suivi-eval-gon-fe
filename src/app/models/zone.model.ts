export interface Zone {
  id_zone: number;
  commune: string;
  province: string;
  perimetre?: string;
}

export interface CreateZoneRequest {
  commune: string;
  province: string;
  perimetre?: string;
}