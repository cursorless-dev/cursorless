package p

func returnZero() {
	return
}

func returnOne() string {
	return "lorem"
}

func returnOneWithCommentBefore() string {
	return /* comment */ "lorem"
}

func returnOneWithCommentAfter() string {
	return "lorem" /* comment */
}


func returnTwo() (string, string) {
	return "lorem", "ipsum"
}

func returnTwoWithCommentInside() (string, string) {
	return "lorem" /* comment */, "ipsum"
}

func returnTwoWithCommentBefore() (string, string) {
	return /* comment */ "lorem", "ipsum"
}

func returnTwoWithCommentAfter() (string, string) {
	return "lorem", "ipsum" /* comment */
}


func returnThree() (string, string, string) {
	return "lorem", "ipsum", "blah"
}

func returnThreeWithCommentInside() (string, string, string) {
	return "lorem" /* comment */, "ipsum", "blah"
}

func returnThreeWithCommentInside2() (string, string, string) {
	return "lorem", "ipsum" /* comment */, "blah"
}

func returnThreeWithCommentBefore() (string, string, string) {
	return /* comment */ "lorem", "ipsum", "blah"
}

func returnThreeWithCommentAfter() (string, string, string) {
	return "lorem", "ipsum", "blah" /* comment */
}
