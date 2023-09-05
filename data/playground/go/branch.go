package p

func switches(x any) {
	switch x {
	case 1:
		// bar
	case 2:
		x = nil
	case "s":
	case 4, "t":
		x = 7
	// qux
	case 5:
		// foo
		fallthrough
	default:
		panic("x")
	}
	switch x := x.(type) {
	case int:
		x++
	case string, struct{}:
		println(x)
	default:
		panic(x)
	}
	switch {
	case x == 1:
		panic("one")
	case false:
		// unreachable
	}
}

func ifElseChains(x int) {
	if y := 0; x == 1 {
		// foo
	} else if z:=0; x == 2 {
		x--
		x--
		x--
	} else if x == 3 {
		x++
	} else {
		x *= 2
	}

	if x == 4{
		x++
	}
}
