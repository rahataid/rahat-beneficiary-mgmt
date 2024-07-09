export type KoboImportInput = {
  name: string;
};

export interface FilterStatsDto {
  location?: string;
  ward_no?: string;
}

export interface UserAgreement {
  userId: string;
  agreedTOS: boolean;
}
