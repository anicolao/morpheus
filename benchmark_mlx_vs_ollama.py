#!/usr/bin/env python3
"""
Benchmark script to compare performance between Ollama and MLX for running large language models.

This script measures:
- Model loading time
- Inference speed (tokens per second)
- Memory usage
- Response quality (qualitative)
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
    """Benchmark MLX model performance."""
    print(f"🔥 Benchmarking MLX with model: {model_name}")
    
    try:
        # Try to import MLX
        import mlx.core as mx
        import mlx_lm
        
        # Measure memory before
        memory_before = get_memory_usage()
        
        # Start timing for model loading
        load_start = time.time()
        
        # Load model using MLX
        try:
            model, tokenizer = mlx_lm.load(model_name)
            load_end = time.time()
            model_load_time = load_end - load_start
            
            # Start timing for inference
            start_time = time.time()
            
            # Generate response
            response = mlx_lm.generate(
                model, 
                tokenizer, 
                prompt=prompt, 
                max_tokens=100,
                verbose=False
            )
            
            end_time = time.time()
            memory_after = get_memory_usage()
            
            # Calculate metrics
            total_time = end_time - start_time
            estimated_tokens = len(response.split())
            tokens_per_second = estimated_tokens / total_time if total_time > 0 else 0
            
            return {
                "success": True,
                "response": response,
                "model_load_time": model_load_time,
                "inference_time": total_time,
                "total_time": model_load_time + total_time,
                "estimated_tokens": estimated_tokens,
                "tokens_per_second": tokens_per_second,
                "memory_before": memory_before,
                "memory_after": memory_after,
                "memory_delta": memory_after - memory_before
            }
            
        except Exception as e:
            return {"error": f"MLX model loading/inference failed: {e}"}
            
    except ImportError as e:
        return {"error": f"MLX not available: {e}. Install with: pip install mlx mlx-lm"}

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
    
    print("\n🔥 MLX RESULTS:")
    if mlx_result.get("success"):
        print(f"  ✅ Success: {mlx_result['success']}")
        if 'model_load_time' in mlx_result:
            print(f"  📥 Model Load Time: {mlx_result['model_load_time']:.2f}s")
            print(f"  ⚡ Inference Time: {mlx_result['inference_time']:.2f}s")
        print(f"  ⏱️  Total Time: {mlx_result['total_time']:.2f}s")
        print(f"  🚀 Tokens/sec: {mlx_result['tokens_per_second']:.2f}")
        print(f"  💾 Memory Delta: {mlx_result['memory_delta']:.2f} MB")
        print(f"  📝 Response Length: {mlx_result['estimated_tokens']} tokens")
    else:
        print(f"  ❌ Error: {mlx_result.get('error', 'Unknown error')}")
    
    # Compare if both succeeded
    if ollama_result.get("success") and mlx_result.get("success"):
        print("\n🆚 COMPARISON:")
        speed_ratio = mlx_result['tokens_per_second'] / ollama_result['tokens_per_second'] if ollama_result['tokens_per_second'] > 0 else 0
        time_ratio = ollama_result['total_time'] / mlx_result['total_time'] if mlx_result['total_time'] > 0 else 0
        memory_diff = mlx_result['memory_delta'] - ollama_result['memory_delta']
        
        print(f"  🏃 Speed: MLX is {speed_ratio:.2f}x {'faster' if speed_ratio > 1 else 'slower'} than Ollama")
        print(f"  ⏰ Time: MLX is {time_ratio:.2f}x {'faster' if time_ratio > 1 else 'slower'} than Ollama")
        print(f"  💾 Memory: MLX uses {memory_diff:+.2f} MB {'more' if memory_diff > 0 else 'less'} than Ollama")
        
        if speed_ratio > 1:
            print(f"  🏆 Winner: MLX (speed)")
        elif time_ratio > 1:
            print(f"  🏆 Winner: MLX (total time)")
        else:
            print(f"  🏆 Winner: Ollama")

def main():
    parser = argparse.ArgumentParser(description="Benchmark MLX vs Ollama performance")
    parser.add_argument("--model", default="qwen2.5-coder:1.5b", 
                       help="Model name to benchmark (default: qwen2.5-coder:1.5b)")
    parser.add_argument("--prompt", default="Write a Python function to calculate the fibonacci sequence.",
                       help="Prompt to use for benchmarking")
    parser.add_argument("--mlx-model", default=None,
                       help="MLX model name (if different from --model)")
    
    args = parser.parse_args()
    
    prompt = args.prompt
    ollama_model = args.model
    mlx_model = args.mlx_model or args.model
    
    print("🚀 Starting benchmark comparison between Ollama and MLX")
    print(f"📝 Prompt: {prompt}")
    print(f"🦙 Ollama Model: {ollama_model}")
    print(f"🔥 MLX Model: {mlx_model}")
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