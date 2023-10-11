export interface SpokenFormSuccess {
  type: "success";
  preferred: string;
  alternatives: string[];
}

export interface SpokenFormError {
  type: "error";
  reason: string;
  requiresTalonUpdate: boolean;
  isSecret: boolean;
}

export type SpokenForm = SpokenFormSuccess | SpokenFormError;
