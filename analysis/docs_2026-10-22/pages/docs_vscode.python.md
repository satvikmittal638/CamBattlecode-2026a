<!-- source: https://2026a.battlecode.co.uk/game/docs/vscode (language: python) -->

[◇ Game handbook](/game/docs)[Patch notes ↗](/game/patch-notes)

GuidesVSCodeClose

Find a rule or champion

Code language

# VSCode

3 min read · Current game rules

On this page

## [1\. Install Visual Studio Code#](/game/docs/vscode#install)

Download the desktop app for your operating system. The language selector at the top of this guide changes the extension and setup instructions, and remembers your choice.

[Download Visual Studio Code →](https://code.visualstudio.com/download)

Open the Extensions view using the blocks icon in the left Activity Bar. You will install the extension listed below for your language. Open the Command Palette with Ctrl+Shift+P on Windows/Linux or Cmd+Shift+P on macOS when a step asks you to run an editor command.

## [2\. Open your bot folder#](/game/docs/vscode#folder)

Install the CAMBC CLI first if needed, then use `cambc init` to create a workspace. Select your language and include its starter bot. Enter the workspace directory printed by the CLI.

[Download the CAMBC CLI →](/game/download)

Create a bot from the workspace directory

```
cambc new my-bot --lang python
```

1.  In VS Code, choose File > Open Folder.
2.  Select `bots/my-bot` inside your CAMBC workspace. Open the whole bot folder, not just `src` or an individual file.
3.  Open `src/main.py` in the Explorer.

You can instead open the generated starter at `bots/starter-python`. Replace `my-bot` in the commands below with your bot's name. Keep the bot inside the CAMBC workspace: its editor settings refer to the SDK two directories above it.

Or open it from the workspace terminal

```
code bots/my-bot
```

**If the code command is unavailable**

File > Open Folder works without it. On macOS, the Command Palette command Shell Command: Install 'code' command in PATH enables the terminal shortcut.

## [3\. Set up Python editing#](/game/docs/vscode#language)

Install Microsoft's Python extension (`ms-python.python`) and Pylance (`ms-python.vscode-pylance`). Pylance supplies completion and type information.

[Install Python →](https://marketplace.visualstudio.com/items?itemName=ms-python.python)

[Install Pylance →](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance)

For the editor, install a desktop Python interpreter if you do not already have one. Open the Command Palette and run `Python: Select Interpreter` to select it.

[Download Python →](https://www.python.org/downloads/)

Keep the generated `pyrightconfig.json` in your bot folder. Its `extraPaths` entry points to `../../sdk/python`, where the CLI installs the CAMBC Python package and type stubs. This is how Pylance finds `cambc`; do not install a different package to silence an import warning.

*   Open `src/main.py`, then hover over a `bc` method or type `bc.` to check completion.
*   If the import is unresolved, open the folder containing `pyrightconfig.json` and check that `sdk/python` still exists in the CAMBC workspace.
*   Use the CLI to run matches. VS Code's Run Python File button uses desktop Python, which does not supply the game's native API.

[Python setup in VS Code →](https://code.visualstudio.com/docs/languages/python)

## [4\. Build and test in the terminal#](/game/docs/vscode#run)

Choose Terminal > New Terminal. With the bot folder open, the terminal starts in `bots/my-bot`; the CLI finds the enclosing CAMBC workspace automatically. Save your edits before building.

Build the bot

```
cambc build my-bot
```

To keep replays together in the workspace, go up two directories before running a match:

Run against the generated starter

```
cd ../..
cambc run my-bot starter-python -o replays --view
```

The CLI builds changed source and opens the replay after the match. A map must be available in `maps/`; refresh the platform's published pool with `cambc maps pull`. Use this workflow instead of the editor's generic Run or Debug button: the bot needs the CAMBC match runner.

[

Getting Started ↗

Create, test and submit a C++ bot with the CAMBC CLI.

](/game/docs/first-bot)

[

Bot API reference ↗

Public C++ SDK functions, methods and camp-group state types.

](/game/api)
