const std = @import("std");

const bob: *const [6]u8 = "bobert";
const b = "bobert";
fn printNumber(num: u8, numTwo: u8, numThree: u8) void {
    std.debug.print("%n", .{ num, numTwo, numThree });
}
fn main() !void {
    printNumber(3, 4, 20);
}
