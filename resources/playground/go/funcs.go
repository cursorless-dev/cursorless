package p

func plainOldFunction() {
	go func() {
		// anonymous function
	}()
	_ = func() string {
		return "x"
	}
}

func genericFunction[T int | int64](x T) T {
	if x == 0 {
		panic("zero")
	}
	return x
}

func (a A) method() {
	defer func() {
		recover()
	}()
	[]func(){
		func() { panic(0) },
		func() { panic(1) },
	}[a[0].(int)]()
}

func stub() string
