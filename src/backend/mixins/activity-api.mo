import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/activity";
import Common "../types/common";
import ActivityLib "../lib/activity";

mixin (
  activity : Map.Map<Common.SessionId, [Types.ActivityEntry]>,
  nextActivityId : { var next : Nat },
) {
  /// Append an activity entry to the given session's log.
  public shared ({ caller }) func logActivity(sessionId : Common.SessionId, activityType : Text, summary : Text, details : Text) : async Types.ActivityEntry {
    ignore caller;
    let id = nextActivityId.next;
    nextActivityId.next := id + 1;
    let entry = ActivityLib.newEntry(id, Time.now(), activityType, summary, details);
    let existing = switch (activity.get(sessionId)) { case (?e) e; case null [] };
    activity.add(sessionId, existing.concat([entry]));
    entry;
  };

  /// List all activity entries for the given session (newest last).
  public shared ({ caller }) func listActivity(sessionId : Common.SessionId) : async [Types.ActivityEntry] {
    ignore caller;
    switch (activity.get(sessionId)) { case (?e) e; case null [] };
  };

  /// Wipe all activity entries for the given session.
  public shared ({ caller }) func clearActivity(sessionId : Common.SessionId) : async Bool {
    ignore caller;
    let existed = activity.get(sessionId) != null;
    if (existed) {
      activity.remove(sessionId);
    };
    existed;
  };
};
