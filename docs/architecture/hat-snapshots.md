# Hat snapshots

In order to allow long chained command phrases, we take a snapshot of the hat token map at the start of a phrase and continue to use this map during the course of the entire phrase. This way you can be sure that any commands issued during the course of a single phrase that refer to a decorated token will continue to refer to the same logical token no matter what happens in the document during phrase execution. Note that the ranges of tokens will be kept current as the document changes so that they refer to the same logical range, but the same logical token will keep the same key in the hat token map over the course of a phrase.

To make this work, first the voice engine touches a file within the signals subdirectory of the command server communication directory after the phrase has been parsed but right before execution begins. Then cursorless will check the version of the signal file via the command server signal API. If the signal has been emitted since the last time cursorless took a snapshot of the hat token map, it will take a new snapshot and continue to use that snapshot of the hats until the next time the signal is emitted. Note that the signal transmission is asynchronous so cursorless just needs to make sure to check the version of the signal before it either updates or reads the map.

![flow diagram](hat-token-map-snapshots.png)
