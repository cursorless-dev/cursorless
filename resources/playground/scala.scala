case class Point(x: Int, y: Int)

trait Greeter {
  def greet(name: String): Unit
}

class TypesAhoy {
  def ++[B >: A](suffix: IterableOnce[B]): ArrayBuffer[B] = ???
  val foo: String = "foo"
  val bar: List[String] = List("123")
  bar.map((c: Char) => c.toDigit)
}

class ExampleClass() {
  def realFunction() {
    // Lists
    val foo: Seq[Int] = List(1,2,3)
    val fancyList = 1 :: (2 :: (3 :: Nil))
    foo == fancyList

    // Maps
    var foo: Map[String, String] = Map("red" -> "#FF0000", "azure" -> "#F0FFFF")
    foo + = ('I' -> 1)
    foo + = ('J' -> 5)
    foo + = ('K' -> 10)
    foo + = ('L' -> 100)

    // lambdas
    foo.map(a => a + 1)
    foo.map((a: Int) => a + 1)
    foo.map(a => {
      // so many lines!
      a + 1
    })

    // partial functions (are they lambdas?)
    foo.map(_ + 1)
    foo.map({case x => x + 1})

    // calls with partial functions
    foo.map(_ + 1) // works
    foo.map {_ + 1}
    foo map(_ + 1)
    foo map {_ + 1}
    foo.size
  }

  val xml = <p>Hello</p>

  realFunction(1,2,3)
}
