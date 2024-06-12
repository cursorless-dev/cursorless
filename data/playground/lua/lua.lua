-- This is a single-line comment

--[[
   This is a multi-line comment.
   It spans multiple lines.
--]]

-- Variables
local a = 42
local b, c = "Hello", "World"

-- Data Types
local number = 3.14
local boolean = true
local string = "Lua is awesome!"
local table = { 1, 2, 3 }
local nilValue = nil

-- Conditional Constructs
local x = 10
local y = 20

-- if-then-else
if x < y then
  print("x is less than y")
elseif x > y then
  print("x is greater than y")
else
  print("x is equal to y")
end

-- ternary conditional (short if-then-else)
local max = x > y and x or y
print("The maximum value is: " .. max)

-- Functions
function add(x, b)
  return x + y
end

local sum = add(5, 7)
print("Sum:", sum)

-- Tables
local person = {
  name = "John",
  age = 30,
  hobbies = { "reading", "gaming", "programming" },
  address = {
    street = "123 Main St",
    city = "Example City",
  },
}

-- String manipulation
local concatString = "Hello " .. "World"

-- Metatables and metatable operations
local mt = {
  __add = function(a, b)
    return a + b
  end,
  __sub = function(a, b)
    return a - b
  end,
}

setmetatable(a, mt)

-- Closures
function makeCounter()
  local count = 0
  return function()
    count = count + 1
    return count
  end
end

local counter = makeCounter()

-- Coroutines
local co = coroutine.create(function()
  for i = 1, 3 do
    print("Coroutine", i)
    coroutine.yield()
  end
end)

-- Error handling
local success, result = pcall(function()
  error("This is an error")
end)

if not success then
  print("Error:", result)
end

-- Loop Constructs
-- while loop
local i = 1
i = 2
while i <= 5 do
  print("While loop iteration: " .. i)
  i = i + 1
end

-- repeat-until loop
i = 1
repeat
  print("Repeat-Until loop iteration: " .. i)
  i = i + 1
until i > 5

-- for loop
for j = 1, 5 do
  print("For loop iteration: " .. j)
end

-- numeric for loop with step
for k = 10, 1, -1 do
  print("Numeric for loop with step: " .. k)
end

-- for-in loop (iterating over a table)
local fruits = { "apple", "banana", "cherry" }
for key, value in pairs(fruits) do
  print("For-In loop: " .. key .. " = " .. value)
end

-- ternary
local max = x > y and x or y
