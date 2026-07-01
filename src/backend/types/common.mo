module {
  /// Anonymous session identifier passed from the frontend (a stable
  /// browser-generated Text key persisted in localStorage). All per-session
  /// storage domains are keyed by this instead of a Principal, since the app
  /// has no login.
  public type SessionId = Text;
};
