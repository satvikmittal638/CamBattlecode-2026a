"""Start a supervised interactive Claude continuation; no scheduling or auto-approval."""
import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
config = json.loads((HERE / "request.json").read_text())
args = [
    config["claude"], "--resume", config["session_id"],
    "--safe-mode", "--tools", "Bash,Read,Edit,Write,Glob,Grep",
    "--permission-mode", "manual", "--strict-mcp-config",
    "--mcp-config", '{"mcpServers":{}}', "--disable-slash-commands",
    "--no-chrome", "--settings", '{"disableAllHooks":true}',
    "--model", "claude-opus-5-5", "--effort", "xhigh",
]
if "--prepare-only" not in sys.argv:
    args.append(config["prompt"])
env = os.environ.copy()
env["DISABLE_AUTOUPDATER"] = "1"
os.chdir(config["cwd"])
os.execve(config["claude"], args, env)
