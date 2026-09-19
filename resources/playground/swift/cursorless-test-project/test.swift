protocol ExampleProtocol: ParentProtocol {

}

struct ExampleStruct: ParentStruct {

}

enum ExampleEnumeration: ParentEnumeration {

}

struct MultiInheritanceStruct: ParentStruct, ParentProtocol, OtherParentProtocol {

}