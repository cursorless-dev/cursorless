export default [
  {
    "before": {
      "html": "<pre class=\"shiki css-variables\" style=\"background-color:var(--shiki-background);color:var(--shiki-foreground)\" tabindex=\"0\"><code><span class=\"line\"><span class=\"hat default selectionRight\"><span>a</span></span></span></code></pre>",
      "data": [
        [
          {
            "start": {
              "line": 0,
              "character": 0
            },
            "end": {
              "line": 0,
              "character": 1
            },
            "properties": {
              "class": "hat default selectionRight"
            },
            "alwaysWrap": true
          }
        ]
      ]
    },
    "during": {
      "html": "<pre class=\"shiki css-variables\" style=\"background-color:var(--shiki-background);color:var(--shiki-foreground)\" tabindex=\"0\"><code><span class=\"line\"><span class=\"hat default selectionRight\"><span>a</span></span></span></code></pre>",
      "data": [
        [
          {
            "start": {
              "line": 0,
              "character": 0
            },
            "end": {
              "line": 0,
              "character": 1
            },
            "properties": {
              "class": "hat default selectionRight"
            },
            "alwaysWrap": true
          }
        ]
      ]
    },
    "after": {
      "html": "<pre class=\"shiki css-variables\" style=\"background-color:var(--shiki-background);color:var(--shiki-foreground)\" tabindex=\"0\"><code><span class=\"line\"><span class=\"sourceMark\"><span>a</span></span><span class=\"thatMark selectionRight\"><span>a</span></span></span></code></pre>",
      "data": [
        [
          {
            "start": {
              "line": 0,
              "character": 0
            },
            "end": {
              "line": 0,
              "character": 1
            },
            "properties": {
              "class": "sourceMark"
            },
            "alwaysWrap": true
          },
          {
            "start": {
              "line": 0,
              "character": 1
            },
            "end": {
              "line": 0,
              "character": 2
            },
            "properties": {
              "class": "thatMark selectionRight"
            },
            "alwaysWrap": true
          }
        ]
      ]
    },
    "command": {
      "version": 6,
      "spokenForm": "bring air to end of air",
      "action": {
        "name": "replaceWithTarget",
        "source": {
          "type": "primitive",
          "mark": {
            "type": "decoratedSymbol",
            "symbolColor": "default",
            "character": "a"
          }
        },
        "destination": {
          "type": "primitive",
          "insertionMode": "to",
          "target": {
            "type": "primitive",
            "modifiers": [
              {
                "type": "endOf"
              }
            ],
            "mark": {
              "type": "decoratedSymbol",
              "symbolColor": "default",
              "character": "a"
            }
          }
        }
      },
      "usePrePhraseSnapshot": true
    },
    "filename": "bringAirToEndOfAir.yml",
    "language": "plaintext",
    "raw": {
      "languageId": "plaintext",
      "command": {
        "version": 6,
        "spokenForm": "bring air to end of air",
        "action": {
          "name": "replaceWithTarget",
          "source": {
            "type": "primitive",
            "mark": {
              "type": "decoratedSymbol",
              "symbolColor": "default",
              "character": "a"
            }
          },
          "destination": {
            "type": "primitive",
            "insertionMode": "to",
            "target": {
              "type": "primitive",
              "modifiers": [
                {
                  "type": "endOf"
                }
              ],
              "mark": {
                "type": "decoratedSymbol",
                "symbolColor": "default",
                "character": "a"
              }
            }
          }
        },
        "usePrePhraseSnapshot": true
      },
      "initialState": {
        "documentContents": "a",
        "selections": [
          {
            "anchor": {
              "line": 0,
              "character": 1
            },
            "active": {
              "line": 0,
              "character": 1
            }
          }
        ],
        "marks": {
          "default.a": {
            "start": {
              "line": 0,
              "character": 0
            },
            "end": {
              "line": 0,
              "character": 1
            }
          }
        }
      },
      "finalState": {
        "documentContents": "aa",
        "selections": [
          {
            "anchor": {
              "line": 0,
              "character": 2
            },
            "active": {
              "line": 0,
              "character": 2
            }
          }
        ],
        "thatMark": [
          {
            "type": "UntypedTarget",
            "contentRange": {
              "start": {
                "line": 0,
                "character": 1
              },
              "end": {
                "line": 0,
                "character": 2
              }
            },
            "isReversed": false,
            "hasExplicitRange": true
          }
        ],
        "sourceMark": [
          {
            "type": "UntypedTarget",
            "contentRange": {
              "start": {
                "line": 0,
                "character": 0
              },
              "end": {
                "line": 0,
                "character": 1
              }
            },
            "isReversed": false,
            "hasExplicitRange": true
          }
        ]
      },
      "filename": "bringAirToEndOfAir.yml"
    }
  }
];
