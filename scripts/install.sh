#!/bin/bash

if command -v devbox >/dev/null 2>&1; then
    if [ "$TODO_DEVBOX_SHELL" != "1" ]; then
        echo "Starting devbox shell..."
        devbox shell
    else
        echo "Already in the project devbox shell."
    fi
else
    echo "Devbox is not installed."
    read -p "Do you want to install Devbox? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Installing Devbox via curl..."
        curl -fsSL https://get.jetpack.io/devbox | bash
        if [ "$TODO_DEVBOX_SHELL" != "1" ]; then
            echo "Starting devbox shell..."
            devbox shell
        fi
    else
        echo "Error: Devbox is not installed. Devbox is required to manage dependencies."
    fi
fi
