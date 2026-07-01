import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/document";
import Common "../types/common";
import DocumentLib "../lib/document";

mixin (
  documents : Map.Map<Common.SessionId, [Types.DocumentRecord]>,
  nextDocumentId : { var next : Nat },
) {
  /// Create a new document for the given session.
  public shared ({ caller }) func createDocument(sessionId : Common.SessionId, title : Text, content : Text) : async Types.DocumentRecord {
    ignore caller;
    let id = nextDocumentId.next;
    nextDocumentId.next := id + 1;
    let doc = DocumentLib.newDocument(id, title, content, "text", Time.now());
    let existing = switch (documents.get(sessionId)) { case (?d) d; case null [] };
    documents.add(sessionId, existing.concat([doc]));
    doc;
  };

  /// Update an existing document's title and content.
  public shared ({ caller }) func updateDocument(sessionId : Common.SessionId, docId : Nat, title : Text, content : Text) : async ?Types.DocumentRecord {
    ignore caller;
    let list = switch (documents.get(sessionId)) { case (?d) d; case null [] };
    let found = list.find(func(d) { d.id == docId });
    switch (found) {
      case null null;
      case (?doc) {
        let updated = DocumentLib.updateDocument(doc, title, content, Time.now());
        let newList = list.map(
          func(d) { if (d.id == docId) updated else d }
        );
        documents.add(sessionId, newList);
        ?updated;
      };
    };
  };

  /// Delete a document by id (must belong to the given session).
  public shared ({ caller }) func deleteDocument(sessionId : Common.SessionId, docId : Nat) : async Bool {
    ignore caller;
    let list = switch (documents.get(sessionId)) { case (?d) d; case null [] };
    let existed = list.find(func(d) { d.id == docId }) != null;
    if (existed) {
      let newList = list.filter(func(d) { d.id != docId });
      documents.add(sessionId, newList);
    };
    existed;
  };

  /// List all documents belonging to the given session.
  public shared ({ caller }) func listDocuments(sessionId : Common.SessionId) : async [Types.DocumentRecord] {
    ignore caller;
    switch (documents.get(sessionId)) { case (?d) d; case null [] };
  };

  /// Get a single document by id (must belong to the given session).
  public shared ({ caller }) func getDocument(sessionId : Common.SessionId, docId : Nat) : async ?Types.DocumentRecord {
    ignore caller;
    let list = switch (documents.get(sessionId)) { case (?d) d; case null [] };
    list.find(func(d) { d.id == docId });
  };
};
