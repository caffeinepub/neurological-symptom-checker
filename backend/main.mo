import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {
  type Frequency = {
    #daily;
    #twiceDaily;
    #weekly;
    #custom : Nat;
  };

  type Medication = {
    id : Text;
    name : Text;
    dosage : Text;
    frequency : Frequency;
    scheduledTimes : [Time.Time];
    startDate : Time.Time;
    endDate : ?Time.Time;
    notes : Text;
  };

  module Medication {
    public func compare(m1 : Medication, m2 : Medication) : Order.Order {
      Text.compare(m1.id, m2.id);
    };
  };

  type DoseStatus = {
    #taken;
    #skipped;
    #missed;
  };

  type DoseLog = {
    medicationId : Text;
    timestamp : Time.Time;
    scheduledTime : Time.Time;
    status : DoseStatus;
  };

  module DoseLog {
    public func compareByTimestamp(log1 : DoseLog, log2 : DoseLog) : Order.Order {
      Int.compare(log1.timestamp, log2.timestamp);
    };
  };

  let medications = Map.empty<Text, Medication>();
  let doseLogs = Map.empty<Text, [DoseLog]>();

  public shared ({ caller }) func addMedication(
    id : Text,
    name : Text,
    dosage : Text,
    frequency : Frequency,
    scheduledTimes : [Time.Time],
    startDate : Time.Time,
    endDate : ?Time.Time,
    notes : Text,
  ) : async () {
    if (medications.containsKey(id)) {
      Runtime.trap("Medication with this ID already exists");
    };
    let newMed : Medication = {
      id;
      name;
      dosage;
      frequency;
      scheduledTimes;
      startDate;
      endDate;
      notes;
    };
    medications.add(id, newMed);
  };

  public shared ({ caller }) func updateMedication(
    id : Text,
    name : Text,
    dosage : Text,
    frequency : Frequency,
    scheduledTimes : [Time.Time],
    startDate : Time.Time,
    endDate : ?Time.Time,
    notes : Text,
  ) : async () {
    switch (medications.get(id)) {
      case (null) {
        Runtime.trap("Medication not found");
      };
      case (?_) {
        let updatedMed : Medication = {
          id;
          name;
          dosage;
          frequency;
          scheduledTimes;
          startDate;
          endDate;
          notes;
        };
        medications.add(id, updatedMed);
      };
    };
  };

  public shared ({ caller }) func deleteMedication(id : Text) : async () {
    switch (medications.get(id)) {
      case (null) {
        Runtime.trap("Medication not found");
      };
      case (?_) {
        medications.remove(id);
        doseLogs.remove(id);
      };
    };
  };

  public query ({ caller }) func listAllMedications() : async [Medication] {
    medications.values().toArray().sort();
  };

  public shared ({ caller }) func logDose(
    medicationId : Text,
    scheduledTime : Time.Time,
    status : DoseStatus,
  ) : async () {
    switch (medications.get(medicationId)) {
      case (null) {
        Runtime.trap("Medication not found");
      };
      case (?_) {
        let newLog : DoseLog = {
          medicationId;
          timestamp = Time.now();
          scheduledTime;
          status;
        };

        let existingLogs = switch (doseLogs.get(medicationId)) {
          case (null) { [] };
          case (?logs) { logs };
        };

        doseLogs.add(medicationId, existingLogs.concat([newLog]));
      };
    };
  };

  public query ({ caller }) func getDoseHistory(medicationId : Text) : async [DoseLog] {
    switch (doseLogs.get(medicationId)) {
      case (null) { [] };
      case (?logs) {
        logs.sort(DoseLog.compareByTimestamp);
      };
    };
  };

  public query ({ caller }) func getMedication(medicationId : Text) : async Medication {
    switch (medications.get(medicationId)) {
      case (null) {
        Runtime.trap("Medication not found");
      };
      case (?med) { med };
    };
  };
};
