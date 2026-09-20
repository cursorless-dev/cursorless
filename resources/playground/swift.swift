protocol ExampleProtocol: ParentProtocol {
    var foo: Type {set get}
}

struct ExampleStruct: ParentStruct {
    var foo: Type
}

enum ExampleEnumeration: ParentEnumeration {

}

struct MultiInheritanceStruct: ParentStruct, ParentProtocol, OtherParentProtocol {

}
