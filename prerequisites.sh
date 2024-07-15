#!/bin/bash

# Exit on any error
set -e

echo "Starting Raspberry Pi 4 Provisioning AP WiFi Setup"

# Update and upgrade system
echo "Updating and upgrading system..."
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
sudo apt-get install -y python3 curl git build-essential tmux nano hostapd dnsmasq

# Stop and disable services
echo "Stopping and disabling services..."
sudo systemctl stop dnsmasq.service
sudo systemctl disable dnsmasq.service 
sudo systemctl stop hostapd
sudo systemctl unmask hostapd
sudo systemctl disable hostapd

# Install NVM and Node.js
echo "Installing NVM and Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install v20

# Create symlinks for node and npm
echo "Creating symlinks for node and npm..."
sudo ln -sf "$(which node)" /usr/bin/node
sudo ln -sf "$(which node)" /usr/lib/node
sudo ln -sf "$(which npm)"  /usr/bin/npm

# Set up WiFi country code
echo "Setting up WiFi country code..."
# Note: This is an interactive step and might need manual intervention
# You may want to use a non-interactive method if possible
sudo raspi-config nonint do_wifi_country AT

# Run the SoftAP setup script
echo "Running SoftAP setup..."
cd SoftAP
sudo ./setup.sh

echo "Setup complete! Please reboot your Raspberry Pi."
echo "After reboot, you can start the AP manually with:"
echo "sudo /usr/bin/autohotspot.sh"
echo "or"
echo "cd bin && sudo ./check_connect_then_start_soft_ap"
