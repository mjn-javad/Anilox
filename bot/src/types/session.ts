export type RegistrationStep = "idle" | "name" | "age" | "email";

export interface RegistrationSession {
  step: RegistrationStep;

  name?: string;
  age?: number;
  email?: string;
}

export interface SessionData {
  registration: RegistrationSession;
}
