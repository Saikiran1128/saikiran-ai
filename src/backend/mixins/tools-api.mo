import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/tools";
import Common "../types/common";
import ToolsLib "../lib/tools";

mixin (
  toolUsage : Map.Map<Common.SessionId, [Types.ToolUsage]>,
  nextToolUsageId : { var next : Nat },
) {
  /// Record a single tool invocation against the given session.
  public shared ({ caller }) func logToolUsage(sessionId : Common.SessionId, toolName : Text, inputSummary : Text, outputSummary : Text) : async Types.ToolUsage {
    ignore caller;
    let id = nextToolUsageId.next;
    nextToolUsageId.next := id + 1;
    let usage = ToolsLib.newUsage(id, Time.now(), toolName, inputSummary, outputSummary);
    let existing = switch (toolUsage.get(sessionId)) { case (?u) u; case null [] };
    toolUsage.add(sessionId, existing.concat([usage]));
    usage;
  };

  /// List all tool-usage records for the given session.
  public shared ({ caller }) func listToolUsage(sessionId : Common.SessionId) : async [Types.ToolUsage] {
    ignore caller;
    switch (toolUsage.get(sessionId)) { case (?u) u; case null [] };
  };
};
