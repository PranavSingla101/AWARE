#!/bin/bash
# Launcher script to run synthetic sensors and live graph

echo "=========================================="
echo "AWARE Live Monitoring Launcher"
echo "=========================================="
echo ""
echo "This script will:"
echo "  1. Start the synthetic sensors (in background)"
echo "  2. Start the live graph visualization"
echo ""
echo "Press Ctrl+C to stop both processes"
echo ""

# Start synthetic sensors in background
echo "Starting synthetic sensors..."
cd "$(dirname "$0")"
python3 synthetic_sensors.py <<EOF &
on
EOF

# Wait a moment for sensor to initialize
sleep 3

# Start live graph
echo "Starting live graph..."
python3 run_live_graph.py

# Cleanup on exit
echo "Stopping synthetic sensors..."
pkill -f "synthetic_sensors.py"
echo "Done!"

