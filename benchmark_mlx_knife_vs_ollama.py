#!/usr/bin/env python3
"""
Benchmark script to compare performance between Ollama and MLX-Knife for running large language models.

This script measures:
- Model loading time
- Inference speed (tokens per second)
- Memory usage
- Response quality (qualitative)

MLX-Knife provides an ollama-like CLI for MLX models on Apple Silicon.
"""

import time
import psutil
import subprocess
import json
import sys
import os
from typing import Dict, Any, Optional
import argparse

def get_memory_usage() -> float:
    """Get current memory usage in MB."""
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / 1024 / 1024

def benchmark_ollama(model_name: str, prompt: str) -> Dict[str, Any]:
    """Benchmark Ollama model performance."""
    print(f"🦙 Benchmarking Ollama with model: {model_name}")
    
    # Check if model is available
    try:
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True, check=True)
        if model_name not in result.stdout:
            print(f"Model {model_name} not found. Pulling...")
            subprocess.run(['ollama', 'pull', model_name], check=True)
    except subprocess.CalledProcessError as e:
        return {"error": f"Failed to access Ollama: {e}"}
    except FileNotFoundError:
        return {"error": "Ollama not found. Please install Ollama first."}
    
    # Measure memory before
    memory_before = get_memory_usage()
    
    # Start timing
    start_time = time.time()
    
    try:
        # Run inference
        cmd = ['ollama', 'run', model_name, prompt]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=300)
        
        end_time = time.time()
        memory_after = get_memory_usage()
        
        # Parse response
        response = result.stdout.strip()
        total_time = end_time - start_time
        
        # Estimate token count (rough approximation)
        estimated_tokens = len(response.split())
        tokens_per_second = estimated_tokens / total_time if total_time > 0 else 0
        
        return {
            "success": True,
            "response": response,
            "total_time": total_time,
            "estimated_tokens": estimated_tokens,
            "tokens_per_second": tokens_per_second,
            "memory_before": memory_before,
            "memory_after": memory_after,
            "memory_delta": memory_after - memory_before
        }
        
    except subprocess.TimeoutExpired:
        return {"error": "Ollama inference timed out after 5 minutes"}
    except subprocess.CalledProcessError as e:
        return {"error": f"Ollama inference failed: {e}"}

def benchmark_mlx(model_name: str, prompt: str) -> Dict[str, Any]:
    """Benchmark MLX-Knife model performance."""
    print(f"🔪 Benchmarking MLX-Knife with model: {model_name}")
    
    # Check if running on Apple Silicon
    import platform
    machine = platform.machine()
    if machine not in ['arm64', 'aarch64']:
        return {
            "error": f"MLX-Knife requires Apple Silicon (ARM64). Current platform: {machine}",
            "platform_warning": "MLX is designed specifically for Apple Silicon Macs"
        }
    
    # Check if mlx-knife is available
    try:
        result = subprocess.run(['mlxk', '--help'], capture_output=True, text=True, check=True)
    except subprocess.CalledProcessError as e:
        return {
            "error": f"mlx-knife command failed: {e}",
            "stderr": e.stderr if hasattr(e, 'stderr') else '',
            "debug_info": "mlxk command exists but returned error code"
        }
    except FileNotFoundError:
        # Check if we're in a virtual environment and suggest activation
        venv_path = os.path.join(os.getcwd(), '.venv', 'bin', 'mlxk')
        if os.path.exists(venv_path):
            return {
                "error": "mlx-knife not found in PATH. Virtual environment may not be activated.",
                "suggestion": "Try: source .venv/bin/activate && python3 benchmark_mlx_knife_vs_ollama.py"
            }
        else:
            return {
                "error": "mlx-knife not found. Please install with: pip install mlx-knife",
                "note": "MLX-Knife requires Apple Silicon and MLX framework"
            }
    
    # Check MLX framework availability
    try:
        result = subprocess.run(['python3', '-c', 'import mlx; import mlx_lm; print("MLX OK")'], 
                               capture_output=True, text=True, check=True)
        if "MLX OK" not in result.stdout:
            return {
                "error": "MLX framework not properly installed",
                "suggestion": "Install with: pip install mlx mlx-lm"
            }
    except subprocess.CalledProcessError as e:
        return {
            "error": "MLX framework missing or broken",
            "detail": e.stderr if e.stderr else str(e),
            "suggestion": "Install MLX framework first: pip install mlx mlx-lm"
        }
    
    # Check if model is available, if not try to pull it
    try:
        result = subprocess.run(['mlxk', 'list'], capture_output=True, text=True, check=True)
        if model_name not in result.stdout:
            print(f"Model {model_name} not found in MLX cache. Attempting to pull...")
            # Try to pull the model - mlx-knife auto-expands short names to mlx-community/ prefix
            pull_result = subprocess.run(['mlxk', 'pull', model_name], 
                                       capture_output=True, text=True, timeout=600)
            if pull_result.returncode != 0:
                return {
                    "error": f"Failed to pull model {model_name}",
                    "stderr": pull_result.stderr,
                    "stdout": pull_result.stdout,
                    "suggestion": "Check if model name is correct or network connection"
                }
    except subprocess.CalledProcessError as e:
        return {
            "error": f"Failed to list models: {e}",
            "stderr": e.stderr if hasattr(e, 'stderr') else '',
            "stdout": e.stdout if hasattr(e, 'stdout') else '',
            "debug_cmd": "mlxk list",
            "suggestion": "Check if mlx-knife is properly installed and MLX framework is available"
        }
    except subprocess.TimeoutExpired:
        return {"error": "Model pull timed out after 10 minutes"}
    
    # Measure memory before
    memory_before = get_memory_usage()
    
    # Start timing
    start_time = time.time()
    
    try:
        # Run inference using mlx-knife CLI
        cmd = ['mlxk', 'run', model_name, prompt, '--no-stream']
        result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=300)
        
        end_time = time.time()
        memory_after = get_memory_usage()
        
        # Parse response
        response = result.stdout.strip()
        total_time = end_time - start_time
        
        # Estimate token count (rough approximation)
        estimated_tokens = len(response.split())
        tokens_per_second = estimated_tokens / total_time if total_time > 0 else 0
        
        return {
            "success": True,
            "response": response,
            "total_time": total_time,
            "estimated_tokens": estimated_tokens,
            "tokens_per_second": tokens_per_second,
            "memory_before": memory_before,
            "memory_after": memory_after,
            "memory_delta": memory_after - memory_before
        }
        
    except subprocess.TimeoutExpired:
        return {"error": "MLX-Knife inference timed out after 5 minutes"}
    except subprocess.CalledProcessError as e:
        return {"error": f"MLX-Knife inference failed: {e.stderr if e.stderr else str(e)}"}

def print_results(ollama_result: Dict[str, Any], mlx_result: Dict[str, Any]):
    """Print comparison results in a nice format."""
    print("\n" + "="*80)
    print("🏆 BENCHMARK RESULTS")
    print("="*80)
    
    print("\n📊 OLLAMA RESULTS:")
    if ollama_result.get("success"):
        print(f"  ✅ Success: {ollama_result['success']}")
        print(f"  ⏱️  Total Time: {ollama_result['total_time']:.2f}s")
        print(f"  🚀 Tokens/sec: {ollama_result['tokens_per_second']:.2f}")
        print(f"  💾 Memory Delta: {ollama_result['memory_delta']:.2f} MB")
        print(f"  📝 Response Length: {ollama_result['estimated_tokens']} tokens")
    else:
        print(f"  ❌ Error: {ollama_result.get('error', 'Unknown error')}")
    
    print("\n🔪 MLX-KNIFE RESULTS:")
    if mlx_result.get("success"):
        print(f"  ✅ Success: {mlx_result['success']}")
        print(f"  ⏱️  Total Time: {mlx_result['total_time']:.2f}s")
        print(f"  🚀 Tokens/sec: {mlx_result['tokens_per_second']:.2f}")
        print(f"  💾 Memory Delta: {mlx_result['memory_delta']:.2f} MB")
        print(f"  📝 Response Length: {mlx_result['estimated_tokens']} tokens")
    else:
        print(f"  ❌ Error: {mlx_result.get('error', 'Unknown error')}")
        if mlx_result.get("platform_warning"):
            print(f"  ⚠️  Note: {mlx_result['platform_warning']}")
        if mlx_result.get("suggestion"):
            print(f"  💡 Suggestion: {mlx_result['suggestion']}")
        if mlx_result.get("stderr"):
            print(f"  🐛 STDERR: {mlx_result['stderr']}")
        if mlx_result.get("stdout"):
            print(f"  📋 STDOUT: {mlx_result['stdout']}")
        if mlx_result.get("debug_cmd"):
            print(f"  🔍 Failed Command: {mlx_result['debug_cmd']}")
        if mlx_result.get("debug_info"):
            print(f"  🔧 Debug: {mlx_result['debug_info']}")
    
    # Compare if both succeeded
    if ollama_result.get("success") and mlx_result.get("success"):
        print("\n🆚 COMPARISON:")
        speed_ratio = mlx_result['tokens_per_second'] / ollama_result['tokens_per_second'] if ollama_result['tokens_per_second'] > 0 else 0
        time_ratio = ollama_result['total_time'] / mlx_result['total_time'] if mlx_result['total_time'] > 0 else 0
        memory_diff = mlx_result['memory_delta'] - ollama_result['memory_delta']
        
        print(f"  🏃 Speed: MLX-Knife is {speed_ratio:.2f}x {'faster' if speed_ratio > 1 else 'slower'} than Ollama")
        print(f"  ⏰ Time: MLX-Knife is {time_ratio:.2f}x {'faster' if time_ratio > 1 else 'slower'} than Ollama")
        print(f"  💾 Memory: MLX-Knife uses {memory_diff:+.2f} MB {'more' if memory_diff > 0 else 'less'} than Ollama")
        
        if speed_ratio > 1:
            print(f"  🏆 Winner: MLX-Knife (speed)")
        elif time_ratio > 1:
            print(f"  🏆 Winner: MLX-Knife (total time)")
        else:
            print(f"  🏆 Winner: Ollama")

def main():
    parser = argparse.ArgumentParser(description="Benchmark MLX-Knife vs Ollama performance")
    parser.add_argument("--model", default="qwen2.5-coder:1.5b", 
                       help="Model name to benchmark (default: qwen2.5-coder:1.5b)")
    parser.add_argument("--prompt", default="Write a Python function to calculate the fibonacci sequence.",
                       help="Prompt to use for benchmarking")
    parser.add_argument("--mlx-model", default=None,
                       help="MLX-Knife model name (if different from --model)")
    
    args = parser.parse_args()
    
    prompt = args.prompt
    ollama_model = args.model
    mlx_model = args.mlx_model or args.model
    
    print("🚀 Starting benchmark comparison between Ollama and MLX-Knife")
    print(f"📝 Prompt: {prompt}")
    print(f"🦙 Ollama Model: {ollama_model}")
    print(f"🔪 MLX-Knife Model: {mlx_model}")
    print("-" * 80)
    
    # Run benchmarks
    ollama_result = benchmark_ollama(ollama_model, prompt)
    mlx_result = benchmark_mlx(mlx_model, prompt)
    
    # Print results
    print_results(ollama_result, mlx_result)
    
    # Save results to JSON file
    results = {
        "benchmark_time": time.time(),
        "prompt": prompt,
        "ollama_model": ollama_model,
        "mlx_model": mlx_model,
        "ollama_result": ollama_result,
        "mlx_result": mlx_result
    }
    
    with open("benchmark_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to benchmark_results.json")

if __name__ == "__main__":
    main()