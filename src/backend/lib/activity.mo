import Types "../types/activity";

module {
  public type ActivityEntry = Types.ActivityEntry;

  /// Create a new activity log entry.
  public func newEntry(id : Nat, timestamp : Int, activityType : Text, summary : Text, details : Text) : ActivityEntry {
    { id; timestamp; activityType; summary; details };
  };
};
