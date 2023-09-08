
# the argument value "True" that is part of "b=True"
# is "value" scope
def func(b=True):
    # the returned value "1" that is part of "return 1"
    # is "value" scope
    if b is True:
        return 1
    else:
        return 0

# the argument value "False" that is part of "b=False"
# is "value" scope
func(b=False)
# but here, there is no "value" scope for "False" since no argument
func(False)

# both "1.5" and "25" are "value" scope
val = 1.5
val /= 25

# values of a Python "dictionary" are "value" scope
d1 = {"a": 1, "b": 2, "c": 3}
_ = {value: key for (key, value) in d1.items()}

# complex ones
_ = {{"a": 1, "b": 2, "c": 3}: 1, d1: 2}
_ = {{1, 2, 3}: 1, {2, 3, 4}: 2}

# we don't want the access to a a Python "dictionary" 
# value to be of "value" scope so we have it here
# to be sure we ignore it
d1["a"]