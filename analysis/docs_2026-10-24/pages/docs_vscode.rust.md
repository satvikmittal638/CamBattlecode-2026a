<!-- source: https://2026a.battlecode.co.uk/game/docs/vscode (language: rust) -->

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
cambc new my-bot --lang rust
```

1.  In VS Code, choose File > Open Folder.
2.  Select `bots/my-bot` inside your CAMBC workspace. Open the whole bot folder, not just `src` or an individual file.
3.  Open `src/main.rs` in the Explorer.

You can instead open the generated starter at `bots/starter-rust`. Replace `my-bot` in the commands below with your bot's name. Keep the bot inside the CAMBC workspace: its editor settings refer to the SDK two directories above it.

Or open it from the workspace terminal

```
code bots/my-bot
```

**If the code command is unavailable**

File > Open Folder works without it. On macOS, the Command Palette command Shell Command: Install 'code' command in PATH enables the terminal shortcut.

## [3\. Set up Rust editing#](/game/docs/vscode#language)

Install rust-analyzer (`rust-lang.rust-analyzer`). It uses the `Cargo.toml` in your bot folder to find the CAMBC SDK dependency.

[Install rust-analyzer →](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

Install Rust through rustup for your editor, then restart VS Code so it sees `cargo` and `rustc` on PATH. The CLI manages a separate Rust toolchain for match builds; that private installation is not automatically available to rust-analyzer.

[Install Rust with rustup →](https://www.rust-lang.org/tools/install)

Run these commands in the bot folder. The generated `rust-toolchain.toml` selects the project's compiler version; `rust-src` lets the editor navigate the standard library.

Prepare the editor toolchain

```
rustup show
rustup component add rust-src
rustup target add wasm32-wasip1
```

*   Keep `Cargo.toml`, `rust-toolchain.toml` and `.cargo/config.toml`. They select the SDK, compiler and WebAssembly target.
*   Open `src/main.rs` and wait for rust-analyzer to finish loading. Hover over a `bc` method to check that the SDK is resolved.
*   If rust-analyzer cannot load the workspace, check that `cargo --version` works in this folder and `../../sdk/rust` exists. Reload the VS Code window after fixing the toolchain.

[Rust setup in VS Code →](https://code.visualstudio.com/docs/languages/rust)

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
cambc run my-bot starter-rust -o replays --view
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
