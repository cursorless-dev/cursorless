const root = document.getElementById("root");

const header = document.createElement("h2");
header.textContent = "Cursorless extension is now running!";

const description = document.createElement("p");
description.innerHTML =
  "<a href='https://www.cursorless.org/docs/user/installation'>Click here to learn how to install Cursorless</a>";

const div = document.createElement("div");

root.append(header, description, div);

const keyboardUserMessage =
  "<p><i>If you're using Cursorless by keyboard you can ignore this message.</i></p>";

window.addEventListener("message", (event) => {
  const { data } = event;
  const children = [];

  if (!data.talon) {
    const a = link("https://talonvoice.com", "talonvoice.com");
    children.push(
      getChild(
        "Talon not installed",
        `Cursorless requires Talon to function by voice.</br>You can download Talon from ${a}.${keyboardUserMessage}`,
      ),
    );
  } else if (!data.cursorlessTalon) {
    const a = link(
      "https://github.com/cursorless-dev/cursorless-talon",
      "github.com/cursorless-dev/cursorless-talon",
    );
    children.push(
      getChild(
        "Cursorless Talon scripts missing",
        `Cursorless requires Talon user scripts to function by voice.</br>The scripts are available at ${a}.`,
      ),
    );
  }

  if (!data.commandServer) {
    const a = link(
      "https://marketplace.visualstudio.com/items?itemName=pokey.command-server",
      "vscode marketplace",
    );
    children.push(
      getChild(
        "Command server extension not installed",
        `Cursorless requires the command server extension to function by voice.</br>The extension is available at the ${a}.${keyboardUserMessage}`,
      ),
    );
  }

  if (children.length === 0) {
    children.push(getChild("All dependencies are installed!"));
  }

  div.replaceChildren(...children);
});

function link(href, text) {
  return `<a href="${href}">${text}</a>`;
}

function getChild(title, body) {
  const child = document.createElement("div");
  const titleElement = document.createElement("h4");
  titleElement.textContent = title;
  child.append(titleElement);
  if (body != null) {
    const bodyElement = document.createElement("p");
    bodyElement.innerHTML = body;
    child.append(bodyElement);
  }
  return child;
}
