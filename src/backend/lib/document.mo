import Types "../types/document";

module {
  public type DocumentRecord = Types.DocumentRecord;

  /// Create a new document record.
  public func newDocument(id : Nat, title : Text, content : Text, fileType : Text, now : Int) : DocumentRecord {
    {
      id;
      title;
      content;
      createdAt = now;
      updatedAt = now;
      fileType;
    };
  };

  /// Update a document's title and content, bumping updatedAt.
  public func updateDocument(doc : DocumentRecord, title : Text, content : Text, now : Int) : DocumentRecord {
    { doc with title; content; updatedAt = now };
  };
};
