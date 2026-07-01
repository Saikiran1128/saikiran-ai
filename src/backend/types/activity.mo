module {
  /// A single entry in the per-session activity log. Captures any user
  /// action (chat message, tool use, search, document edit) with a summary
  /// and free-form details for later browsing.
  public type ActivityEntry = {
    id : Nat;
    timestamp : Int;
    activityType : Text;
    summary : Text;
    details : Text;
  };
};
