import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type Frequency = {
    __kind__: "custom";
    custom: bigint;
} | {
    __kind__: "twiceDaily";
    twiceDaily: null;
} | {
    __kind__: "daily";
    daily: null;
} | {
    __kind__: "weekly";
    weekly: null;
};
export interface Medication {
    id: string;
    endDate?: Time;
    dosage: string;
    name: string;
    notes: string;
    scheduledTimes: Array<Time>;
    frequency: Frequency;
    startDate: Time;
}
export interface DoseLog {
    status: DoseStatus;
    scheduledTime: Time;
    medicationId: string;
    timestamp: Time;
}
export enum DoseStatus {
    taken = "taken",
    skipped = "skipped",
    missed = "missed"
}
export interface backendInterface {
    addMedication(id: string, name: string, dosage: string, frequency: Frequency, scheduledTimes: Array<Time>, startDate: Time, endDate: Time | null, notes: string): Promise<void>;
    deleteMedication(id: string): Promise<void>;
    getDoseHistory(medicationId: string): Promise<Array<DoseLog>>;
    getMedication(medicationId: string): Promise<Medication>;
    listAllMedications(): Promise<Array<Medication>>;
    logDose(medicationId: string, scheduledTime: Time, status: DoseStatus): Promise<void>;
    updateMedication(id: string, name: string, dosage: string, frequency: Frequency, scheduledTimes: Array<Time>, startDate: Time, endDate: Time | null, notes: string): Promise<void>;
}
