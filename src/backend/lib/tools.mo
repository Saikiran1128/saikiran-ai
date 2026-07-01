import Types "../types/tools";

module {
  public type ToolUsage = Types.ToolUsage;

  /// Create a new tool-usage record.
  public func newUsage(id : Nat, timestamp : Int, toolName : Text, inputSummary : Text, outputSummary : Text) : ToolUsage {
    { id; timestamp; toolName; inputSummary; outputSummary };
  };
};
