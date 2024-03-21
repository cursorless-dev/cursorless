# TextEditor/TextDocument vs Window/Buffer

1. Each Cursorless "TextDocument" corresponds to a neovim "Buffer"
2. Each Cursorless "TextEditor" corresponds to a neovim "Window"
3. A "TextEditor" corresponds to a view to a "TextDocument". The same "TextDocument" can be opened in two different "TextEditor".
4. When a "Window" changes in neovim, we need to reflect its "TextEditor"
5. When a "Buffer" changes in neovim, we need to reflect its "TextDocument".
