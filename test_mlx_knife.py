#!/usr/bin/env python3
"""
Test script to diagnose MLX-Knife installation and setup issues.
This script helps identify what's wrong when MLX-Knife is not working.
"""

import subprocess
import sys
import os
import platform

def run_command(cmd, description):
    """Run a command and return the result with error handling."""
    print(f"\n🧪 Testing: {description}")
    print(f"   Command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        print(f"   Exit Code: {result.returncode}")
        if result.stdout:
            print(f"   STDOUT: {result.stdout.strip()}")
        if result.stderr:
            print(f"   STDERR: {result.stderr.strip()}")
        return result.returncode == 0, result
    except subprocess.TimeoutExpired:
        print("   ❌ Command timed out")
        return False, None
    except FileNotFoundError:
        print("   ❌ Command not found")
        return False, None
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False, None

def main():
    print("🔍 MLX-Knife Diagnostic Tool")
    print("=" * 50)
    
    # Check platform
    machine = platform.machine()
    print(f"\n🖥️  Platform: {machine}")
    if machine not in ['arm64', 'aarch64']:
        print("⚠️  WARNING: MLX-Knife requires Apple Silicon (ARM64)")
        print("   Current platform is not supported by MLX framework")
    else:
        print("✅ Platform is compatible with MLX")
    
    # Check Python version
    python_version = sys.version
    print(f"\n🐍 Python: {python_version}")
    
    # Check if in virtual environment
    venv_active = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    print(f"🌐 Virtual Environment Active: {venv_active}")
    if venv_active:
        print(f"   Python Executable: {sys.executable}")
    
    # Check if .venv directory exists
    venv_dir = os.path.join(os.getcwd(), '.venv')
    print(f"📁 .venv directory exists: {os.path.exists(venv_dir)}")
    
    # Test Python imports
    print("\n🧪 Testing Python Imports:")
    imports_to_test = [
        ("psutil", "Process monitoring library"),
        ("mlx", "Apple MLX framework"),
        ("mlx_lm", "MLX language models"),
        ("mlx_knife", "MLX-Knife package")
    ]
    
    for module, description in imports_to_test:
        try:
            exec(f"import {module}")
            print(f"   ✅ {module}: OK ({description})")
        except ImportError as e:
            print(f"   ❌ {module}: FAILED - {e}")
        except Exception as e:
            print(f"   ⚠️  {module}: ERROR - {e}")
    
    # Test command line tools
    print("\n🧪 Testing Command Line Tools:")
    commands_to_test = [
        (["python3", "--version"], "Python 3 version"),
        (["pip", "--version"], "pip package manager"),
        (["mlxk", "--version"], "MLX-Knife version"),
        (["mlxk", "--help"], "MLX-Knife help"),
        (["mlxk", "list"], "MLX-Knife model list")
    ]
    
    for cmd, description in commands_to_test:
        success, result = run_command(cmd, description)
        if not success and cmd[0] == "mlxk":
            # Try with explicit python path if mlxk fails
            venv_mlxk = os.path.join('.venv', 'bin', 'mlxk')
            if os.path.exists(venv_mlxk):
                print(f"   🔄 Trying with venv path: {venv_mlxk}")
                alt_cmd = [venv_mlxk] + cmd[1:]
                run_command(alt_cmd, f"{description} (via .venv)")
    
    print("\n📋 SUMMARY:")
    print("If you see errors above:")
    print("1. Make sure you're on Apple Silicon (ARM64)")
    print("2. Activate the virtual environment: source .venv/bin/activate")
    print("3. Install missing packages: pip install mlx mlx-lm mlx-knife")
    print("4. Verify with: mlxk --help")

if __name__ == "__main__":
    main()