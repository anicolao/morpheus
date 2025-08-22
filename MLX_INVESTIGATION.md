# MLX Investigation

This document covers the investigation into using MLX (Machine Learning eXtensions) as an alternative to Ollama for running large language models in the Morpheum project.

## Overview

MLX is Apple's machine learning framework designed to run efficiently on Apple silicon. It provides an alternative to Ollama for running large language models, potentially offering better performance on Mac hardware.

## Installation

### Via Nix (Recommended)

The project's `flake.nix` has been updated to include MLX support:

```nix
# Development shell includes:
python3
python3Packages.pip
python3Packages.numpy
python3Packages.transformers
python3Packages.torch
python3Packages.psutil

# With shellHook to install MLX packages:
pip install --user mlx mlx-lm
```

To enter the development environment:

```bash
nix develop
```

### Manual Installation

If not using Nix, install MLX manually:

```bash
pip install mlx mlx-lm
```

Note: MLX is optimized for Apple Silicon and may not work optimally on other architectures.

## Benchmark Script

A comprehensive benchmark script `benchmark_mlx_vs_ollama.py` has been created to compare performance between Ollama and MLX.

### Usage

Basic usage:
```bash
python3 benchmark_mlx_vs_ollama.py
```

With custom model:
```bash
python3 benchmark_mlx_vs_ollama.py --model qwen2.5-coder:7b
```

With custom prompt:
```bash
python3 benchmark_mlx_vs_ollama.py --prompt "Explain quantum computing in simple terms"
```

Full options:
```bash
python3 benchmark_mlx_vs_ollama.py \
  --model qwen2.5-coder:1.5b \
  --mlx-model microsoft/DialoGPT-medium \
  --prompt "Write a Python function to sort a list"
```

### Measured Metrics

The benchmark script measures:

- **Model Loading Time**: Time to load the model into memory
- **Inference Time**: Time to generate the response
- **Total Time**: Combined loading and inference time
- **Tokens per Second**: Throughput measurement
- **Memory Usage**: Memory delta during inference
- **Response Quality**: Length and content of responses

### Output Format

The script provides a detailed comparison:

```
🏆 BENCHMARK RESULTS
================================================================================

📊 OLLAMA RESULTS:
  ✅ Success: True
  ⏱️  Total Time: 12.34s
  🚀 Tokens/sec: 8.5
  💾 Memory Delta: 245.6 MB
  📝 Response Length: 105 tokens

🔥 MLX RESULTS:
  ✅ Success: True
  📥 Model Load Time: 3.21s
  ⚡ Inference Time: 7.89s
  ⏱️  Total Time: 11.10s
  🚀 Tokens/sec: 12.3
  💾 Memory Delta: 189.2 MB
  📝 Response Length: 97 tokens

🆚 COMPARISON:
  🏃 Speed: MLX is 1.45x faster than Ollama
  ⏰ Time: MLX is 1.11x faster than Ollama  
  💾 Memory: MLX uses -56.4 MB less than Ollama
  🏆 Winner: MLX (speed)
```

Results are also saved to `benchmark_results.json` for further analysis.

## Model Compatibility

### Ollama Models
- Uses standard Ollama model format
- Compatible with existing `.ollama` model files in the repository
- Supports models like `qwen2.5-coder:1.5b`, `deepseek-coder`, etc.

### MLX Models
- Uses HuggingFace model format
- Automatically downloads models from HuggingFace Hub
- Some popular options:
  - `microsoft/DialoGPT-medium`
  - `facebook/opt-125m`
  - `gpt2`

Note: Model compatibility varies, and not all Ollama models have direct MLX equivalents.

## Performance Considerations

### Advantages of MLX
- **Apple Silicon Optimization**: Designed specifically for M1/M2/M3 chips
- **Memory Efficiency**: Often uses less memory than Ollama
- **Speed**: Can be faster for inference on Apple hardware
- **Integration**: Direct Python integration without external daemon

### Advantages of Ollama
- **Model Ecosystem**: Larger selection of pre-quantized models
- **Ease of Use**: Simple installation and model management
- **Cross-Platform**: Works on various architectures
- **Stability**: Mature and well-tested

## Implementation Notes

### Architecture Compatibility
MLX is primarily designed for Apple Silicon. On other architectures:
- May fall back to CPU computation
- Performance benefits may be reduced
- Some models may not load correctly

### Memory Management
- MLX loads models directly into the Python process
- Ollama runs as a separate daemon process
- Memory usage patterns differ significantly

### Error Handling
The benchmark script includes comprehensive error handling for:
- Missing dependencies
- Model loading failures
- Timeout scenarios
- Architecture incompatibilities

## Future Development

### Potential Integration Points
1. **Bot Enhancement**: Add MLX as an LLM provider option
2. **Model Factory**: Extend existing factory pattern to include MLX clients
3. **Performance Monitoring**: Integrate benchmarks into CI/CD pipeline
4. **Adaptive Selection**: Automatically choose optimal backend based on hardware

### Recommended Next Steps
1. Run comprehensive benchmarks on target hardware
2. Evaluate model quality differences
3. Consider hybrid approach using both backends
4. Implement MLX provider in bot architecture if performance justifies it

## Conclusion

MLX provides a promising alternative to Ollama, especially for Apple Silicon hardware. The benchmark script enables data-driven decisions about which backend to use for specific use cases. Consider factors like target hardware, model availability, and performance requirements when choosing between the two approaches.