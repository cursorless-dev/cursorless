struct ExamplesStruct {
    static let constant = "hello world"
    public var publicVariable: UInt128 = 0
    var uninitializedVariable: String?
    internal static func exampleFunction(exampleLabel: String) -> String {
        if exampleLabel.isEmpty {
            return "goodbye world"
        } else if (publicVariable % 2 == 0) {
            return constant + ", " + exampleLabel + "!"
        } else if (publicVariable % 3 == 0){
            return constant + ", " + exampleLabel + "?!"
        } else {
            return constant + ", " + exampleLabel + "..."
        }
    }
    public mutating func secondExampleFunction(exampleLabel: String, times: any UnsignedInteger) {
        let cast: UInt128 = numericCast(times)
        publicVariable += cast
        let fizz = publicVariable % 3 == 0
        let buzz = publicVariable % 5 == 0
        if (fizz || buzz) {
            print((fizz ? "fizz" : "") + (buzz ? "buzz" : ""))
        }
        for _ in 0 ..< cast {
            print(ExamplesStruct.exampleFunction(exampleLabel: exampleLabel))
        }
    }
}

enum ExampleEnum {
    case exampleCaseOne
    case exampleCaseTwo
}
/*
    These Examples are Pissing me off...
        I'm the original
        Multiline     walker
*/

enum ExampleCompactEnum {
    case compactCaseOne, compactCaseTwo
}

protocol ExampleProtocol {
    var setGetMember: String? { set get }
    var getOnlyNumber: Double! {get} // using an explicit unwrap type like this is legal, but poor practice in real code
}