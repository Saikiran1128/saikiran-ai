import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/search";
import Common "../types/common";
import SearchLib "../lib/search";

mixin (
  searchHistory : Map.Map<Common.SessionId, [Types.SearchRecord]>,
  nextSearchId : { var next : Nat },
) {
  /// Record a single internet-search query against the given session.
  public shared ({ caller }) func logSearch(sessionId : Common.SessionId, queryText : Text, resultCount : Nat) : async Types.SearchRecord {
    ignore caller;
    let id = nextSearchId.next;
    nextSearchId.next := id + 1;
    let record = SearchLib.newSearch(id, Time.now(), queryText, resultCount);
    let existing = switch (searchHistory.get(sessionId)) { case (?s) s; case null [] };
    searchHistory.add(sessionId, existing.concat([record]));
    record;
  };

  /// List all search-history records for the given session.
  public shared ({ caller }) func listSearchHistory(sessionId : Common.SessionId) : async [Types.SearchRecord] {
    ignore caller;
    switch (searchHistory.get(sessionId)) { case (?s) s; case null [] };
  };
};
