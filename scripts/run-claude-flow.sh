#!/bin/bash

# Claude Flow Launcher Script
# Ensures claude-flow is accessible with proper PATH

export PATH="$HOME/bin:$PATH"
claude-flow "$@"