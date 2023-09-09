import sys


def statements():
    print(sys.path[0])  # comment 1
    print("hello")  # comment 2

    # the below statement has additional spaces after it
    val = 1 == 2
    if val is True:
        return

    # also the below has non-empty indentation

    c = range(10)
    c.append(100)
    x = 1
    x /= 2
    for i in range(10):
        if i == 0:
            continue
        print(i)
        break

    age = 120
    if age > 90:
        print("You are too old to party, granny.")
    elif age < 0:
        print("You're yet to be born")
    elif age >= 18:
        print("You are allowed to party")
    else:
        print("You're too young to party")


statements()
