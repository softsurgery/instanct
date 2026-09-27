#!/usr/bin/env python3
"""Interactive menu for the Instanct Compose stacks.

    python3 scripts/compose.py
"""

from __future__ import annotations

import curses
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

STACKS: dict[str, dict[str, object]] = {
    "prod": {
        "file": "docker-compose.yml",
        "up": ["up", "--build"],
        "detach": ["up", "--build", "-d"],
    },
    "dev": {
        "file": "docker-compose.dev.yml",
        "up": ["up", "--build"],
        "detach": ["up", "--build", "-d"],
    },
    "nginx": {
        "file": "infra/nginx/docker-compose.yml",
        "up": ["up", "-d"],
        "detach": ["up", "-d"],
    },
}

ACTIONS: dict[str, list[str]] = {
    "down": ["down"],
    "stop": ["stop"],
    "restart": ["restart"],
    "logs": ["logs", "-f", "--tail", "100"],
    "ps": ["ps"],
    "build": ["build"],
}

# Headers are labels. Items are (stack or None, action, label).
MENU: list[tuple[str, object]] = [
    ("header", "Production"),
    ("item", ("prod", "up", "Start and build")),
    ("item", ("prod", "detach", "Start and build, detached")),
    ("item", ("prod", "down", "Stop and remove")),
    ("item", ("prod", "logs", "Follow logs")),
    ("header", "Development"),
    ("item", ("dev", "up", "Start and build")),
    ("item", ("dev", "detach", "Start and build, detached")),
    ("item", ("dev", "down", "Stop and remove")),
    ("item", ("dev", "logs", "Follow logs")),
    ("header", "Nginx"),
    ("item", ("nginx", "up", "Start")),
    ("item", ("nginx", "down", "Stop and remove")),
    ("item", ("nginx", "logs", "Follow logs")),
    ("header", "All stacks"),
    ("item", (None, "status", "Show status")),
    ("header", "Cleanup"),
    ("item", (None, "delete-dev", "Delete dev images")),
    ("item", (None, "delete-prod", "Delete prod images")),
    ("item", (None, "clear-cache", "Clear Docker build cache")),
]

IMAGE_TAGS = {
    "dev": ["instanct-api:dev", "instanct-web:dev", "instanct-landing:dev"],
    "prod": ["instanct-api:prod", "instanct-web:prod", "instanct-landing:prod"],
}


def compose_command(stack: str, action: str) -> list[str]:
    spec = STACKS[stack]
    compose_file = ROOT / str(spec["file"])
    if not compose_file.is_file():
        raise SystemExit(f"Compose file not found: {compose_file}")

    if action in {"up", "detach"}:
        compose_args = list(spec[action])  # type: ignore[arg-type]
    else:
        compose_args = list(ACTIONS[action])

    return ["docker", "compose", "-f", str(compose_file), *compose_args]


def run_command(command: list[str]) -> int:
    print(f"\n$ {' '.join(command)}\n")
    try:
        completed = subprocess.run(command, cwd=ROOT)
    except KeyboardInterrupt:
        print()
        return 130
    return completed.returncode


def confirm(message: str) -> bool:
    print(f"\n{message}")
    try:
        answer = input("Type yes to continue: ").strip().lower()
    except EOFError:
        print()
        return False
    if answer != "yes":
        print("Cancelled.")
        return False
    return True


def image_exists(name: str) -> bool:
    completed = subprocess.run(
        ["docker", "image", "inspect", name],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return completed.returncode == 0


def delete_images(kind: str) -> int:
    images = IMAGE_TAGS[kind]
    listed = "\n".join(f"  {image}" for image in images)
    if not confirm(
        f"Stop the {kind} stack and delete these images?\n{listed}",
    ):
        return 0

    compose_file = ROOT / str(STACKS[kind]["file"])
    exit_code = run_command(["docker", "compose", "-f", str(compose_file), "down"])
    for image in images:
        if not image_exists(image):
            print(f"\n{image} is not present.")
            continue
        exit_code = exit_code or run_command(["docker", "image", "rm", image])
    return exit_code


def clear_build_cache() -> int:
    if not confirm(
        "Delete the Docker build cache?\nTagged images that are still in use are kept.",
    ):
        return 0
    return run_command(["docker", "builder", "prune", "-af"])


def run_selection(stack: str | None, action: str) -> int:
    if action == "status":
        exit_code = 0
        for name in STACKS:
            exit_code = exit_code or run_command(compose_command(name, "ps"))
        return exit_code
    if action == "delete-dev":
        return delete_images("dev")
    if action == "delete-prod":
        return delete_images("prod")
    if action == "clear-cache":
        return clear_build_cache()
    if stack is None:
        raise SystemExit("Choose a stack for this action.")
    return run_command(compose_command(stack, action))


def selectable_indexes() -> list[int]:
    return [index for index, (kind, _payload) in enumerate(MENU) if kind == "item"]


def draw_menu(stdscr: curses.window) -> tuple[str | None, str] | None:
    curses.curs_set(0)
    stdscr.keypad(True)
    if curses.has_colors():
        curses.start_color()
        curses.use_default_colors()
        curses.init_pair(1, curses.COLOR_BLACK, curses.COLOR_CYAN)
        curses.init_pair(2, curses.COLOR_CYAN, -1)

    choices = selectable_indexes()
    position = 0

    while True:
        stdscr.erase()
        height, width = stdscr.getmaxyx()
        if height < 8 or width < 20:
            stdscr.addstr(0, 0, "Terminal is too small.")
            stdscr.refresh()
            key = stdscr.getch()
            if key in (ord("q"), 27):
                return None
            continue

        stdscr.addnstr(0, 0, "Instanct", width, curses.A_BOLD)
        hint = "↑↓ move    Enter run    q quit"
        stdscr.addnstr(1, 0, hint, width, curses.A_DIM)

        selected_index = choices[position]
        visible = max(1, height - 4)
        offset = selected_index - (visible // 2)
        offset = max(0, min(offset, max(0, len(MENU) - visible)))

        line = 3
        for index, (kind, payload) in enumerate(MENU):
            if index < offset:
                continue
            if line >= height - 1:
                break
            if kind == "header":
                attr = curses.A_BOLD
                if curses.has_colors():
                    attr |= curses.color_pair(2)
                stdscr.addnstr(line, 0, str(payload), width, attr)
            else:
                _stack, _action, label = payload  # type: ignore[misc]
                selected = choices[position] == index
                text = f"{'›' if selected else ' '} {label}"
                attr = curses.color_pair(1) if selected and curses.has_colors() else curses.A_NORMAL
                if selected and not curses.has_colors():
                    attr = curses.A_REVERSE
                stdscr.addnstr(line, 2, text, max(0, width - 2), attr)
            line += 1

        stdscr.refresh()
        key = stdscr.getch()
        if key in (curses.KEY_UP, ord("k")):
            position = (position - 1) % len(choices)
        elif key in (curses.KEY_DOWN, ord("j")):
            position = (position + 1) % len(choices)
        elif key in (curses.KEY_ENTER, 10, 13):
            _kind, payload = MENU[choices[position]]
            stack, action, _label = payload  # type: ignore[misc]
            return stack, action
        elif key in (ord("q"), ord("Q"), 27):
            return None


def pause() -> None:
    try:
        input("\nPress Enter to return to the menu...")
    except EOFError:
        print()


def interactive() -> int:
    if not sys.stdin.isatty() or not sys.stdout.isatty():
        raise SystemExit("Open a terminal and run: python3 scripts/compose.py")

    exit_code = 0
    while True:
        selected = curses.wrapper(draw_menu)
        if selected is None:
            return exit_code
        exit_code = run_selection(*selected)
        pause()


def main() -> int:
    if shutil.which("docker") is None:
        raise SystemExit("docker was not found on PATH.")
    return interactive()


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print()
        sys.exit(130)
