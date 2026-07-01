module {
  /// A single internet-search query recorded against a session, with the
  /// number of results returned.
  public type SearchRecord = {
    id : Nat;
    timestamp : Int;
    queryText : Text;
    resultCount : Nat;
  };
};
