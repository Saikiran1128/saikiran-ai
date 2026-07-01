module {
  /// A saved document (note or uploaded file metadata) belonging to a
  /// per-browser anonymous session.
  public type DocumentRecord = {
    id : Nat;
    title : Text;
    content : Text;
    createdAt : Int;
    updatedAt : Int;
    fileType : Text;
  };
};
