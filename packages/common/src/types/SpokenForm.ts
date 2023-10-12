export interface SpokenFormSuccess {
  type: "success";
  spokenForms: string[];
}

export interface SpokenFormError {
  type: "error";
  reason: string;
  requiresTalonUpdate: boolean;
  isPrivate: boolean;
}

export type SpokenForm = SpokenFormSuccess | SpokenFormError;
