#!/bin/bash

echo "🔧 Fixing 'too many open files' error..."
echo ""

# Increase file descriptor limits
echo "Setting file descriptor limits..."
ulimit -n 65536
ulimit -u 2048

echo "✅ Limits increased!"
echo ""
echo "Current limits:"
ulimit -n
echo ""
echo "Now restart the frontend:"
echo "  ./start-frontend.sh"
