module {
  /// A record of a single tool invocation within a session: which tool was
  /// used, a short summary of its inputs, and a short summary of its output.
  public type ToolUsage = {
    id : Nat;
    timestamp : Int;
    toolName : Text;
    inputSummary : Text;
    outputSummary : Text;
  };
};
