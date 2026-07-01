import Types "../types/search";

module {
  public type SearchRecord = Types.SearchRecord;

  /// Create a new search-history record.
  public func newSearch(id : Nat, timestamp : Int, queryText : Text, resultCount : Nat) : SearchRecord {
    { id; timestamp; queryText; resultCount };
  };
};
