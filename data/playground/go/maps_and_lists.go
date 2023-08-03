package p

type S struct {
	one, a int
}

type (
	A  [2]any
	AA [3]A
	AS [2]S
	M  map[any]int
)

const one = 1

func mapsAndLists() {
	_ = A{}
	_ = A{1}
	_ = A{1, 2}
	_ = A{1: 1}
	_ = S{a: 1}
	_ = M{"a": 1}
	_ = M{"a": 1, 1: 1}
	_ = AS{{}}
	_ = AA{{1}}
	_ = AS{{a: 1}}
	_ = AA{{1}, {one: 1}}
	_ = AA{{1}, {}, {one: 1}}
	_ = &A{}
	_ = &A{1}
	_ = &A{one: 1}
	_ = &A{1: 1}
}
