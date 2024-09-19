#!/bin/bash

# ANSI color codes
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
RESET="\033[0m"

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
    echo -e "${YELLOW}$1${RESET}"
}

log_success() {
    echo -e "${GREEN}$1${RESET}"
}

log_error() {
    echo -e "${RED}$1${RESET}"
}

# Set the working directory to the project root
log "Setting working directory to the project root."
cd "$SCRIPT_DIR/.." || { log_error "Failed to set the working directory."; exit 1; }

log "Running download script..."
if "$SCRIPT_DIR/download.sh"; then
    log_success "Download completed."
else
    log_error "Download failed."
    exit 1
fi

log "Running fix script..."
if "$SCRIPT_DIR/fix.sh"; then
    log_success "Fix script completed."
else
    log_error "Fix script failed."
    exit 1
fi

log "Populating database..."
if npm run populate-db; then
    log_success "Database population completed."
    
    if [ -f "./populate-db-report.json" ]; then
        log "Renaming populate-db-report.json to update-report.json..."
        mv "./populate-db-report.json" "./update-report.json"
        log_success "Report renamed to update-report.json."
    else
        log_error "populate-db-report.json not found."
    fi
else
    log_error "Database population failed."
    exit 1
fi

log_success "Update process completed."
exit 0
