# MLX-Knife Investigation

This document covers the investigation into using MLX-Knife as an alternative to Ollama for running large language models in the Morpheum project.

## Overview

MLX-Knife is a lightweight, ollama-like CLI for managing and running MLX models on Apple Silicon. It provides a command-line interface similar to Ollama but leverages Apple's MLX framework for optimized performance on Mac hardware.

## Installation

### Platform Requirements

**Important**: MLX-Knife requires Apple Silicon (ARM64) hardware and is designed specifically for macOS with M1/M2/M3 processors. It will not work on Intel processors or Linux/Windows platforms.

### Via Nix (Recommended)

The project's `flake.nix` has been updated to include MLX-Knife support with automatic platform detection:

```nix
# Development shell includes:
python3
python3Packages.pip
python3Packages.psutil

# With shellHook to install MLX-Knife on Apple Silicon only:
# Automatically detects ARM64 platform and installs accordingly
```

To enter the development environment:

```bash
nix develop
```

The setup will automatically:
- Detect if you're on Apple Silicon (ARM64) 
- Install MLX-Knife only on compatible platforms
- Show a warning on unsupported platforms (x86_64, etc.)

### Manual Installation

If not using Nix, install MLX-Knife manually on Apple Silicon Macs:

```bash
# Create virtual environment (recommended)
python3 -m venv .venv
source .venv/bin/activate

# Install MLX framework dependencies
pip install mlx mlx-lm

# Install MLX-Knife
pip install mlx-knife

# Verify installation
mlxk --help
```

**Note**: MLX-Knife is optimized for Apple Silicon and requires macOS with Apple Silicon (M1/M2/M3). Installation will fail or MLX libraries won't load on other platforms.

## Troubleshooting

### Common Issues

1. **"mlxk command not found"**
   - Ensure you're in the virtual environment: `source .venv/bin/activate`
   - Check if mlx-knife is installed: `pip list | grep mlx-knife`
   - Try reinstalling: `pip install --upgrade mlx-knife`

2. **"Failed to list models" error**
   - Make sure MLX framework is installed: `pip install mlx mlx-lm`
   - Verify MLX works: `python3 -c "import mlx; print('MLX OK')"`
   - Check platform compatibility: `uname -m` should show `arm64`

3. **Virtual environment issues in Nix**
   - The setup creates `.venv/` automatically on Apple Silicon
   - If issues persist, delete `.venv/` and re-run `nix develop`
   - Use the diagnostic script: `python3 test_mlx_knife.py`

### Diagnostic Tool

A diagnostic script is provided to help troubleshoot installation issues:

```bash
python3 test_mlx_knife.py
```

This script will:
- Check platform compatibility
- Verify Python imports (mlx, mlx-lm, mlx-knife)
- Test command-line tools
- Provide specific error messages and suggestions

## Benchmark Script

A comprehensive benchmark script `benchmark_mlx_knife_vs_ollama.py` has been created to compare performance between Ollama and MLX-Knife.

### Usage

Basic usage:
```bash
python3 benchmark_mlx_knife_vs_ollama.py
```

With custom model:
```bash
python3 benchmark_mlx_knife_vs_ollama.py --model qwen2.5-coder:1.5b
```

With custom prompt:
```bash
python3 benchmark_mlx_knife_vs_ollama.py --prompt "Explain quantum computing in simple terms"
```

Full options:
```bash
python3 benchmark_mlx_knife_vs_ollama.py \
  --model qwen2.5-coder:1.5b \
  --mlx-model Phi-3-mini-4k-instruct-4bit \
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

🔪 MLX-KNIFE RESULTS:
  ✅ Success: True
  ⏱️  Total Time: 8.45s
  🚀 Tokens/sec: 11.8
  💾 Memory Delta: 156.3 MB
  📝 Response Length: 97 tokens

🆚 COMPARISON:
  🏃 Speed: MLX-Knife is 1.39x faster than Ollama
  ⏰ Time: MLX-Knife is 1.46x faster than Ollama  
  💾 Memory: MLX-Knife uses -89.3 MB less than Ollama
  🏆 Winner: MLX-Knife (speed)
```

Results are also saved to `benchmark_results.json` for further analysis.

## Model Compatibility

### Ollama Models
- Uses standard Ollama model format
- Compatible with existing `.ollama` model files in the repository
- Supports models like `qwen2.5-coder:1.5b`, `deepseek-coder`, etc.

### MLX-Knife Models
- Uses MLX model format from HuggingFace
- Automatically downloads models from MLX Community on HuggingFace
- Model name expansion: Short names like `Phi-3-mini-4k-instruct-4bit` automatically expand to `mlx-community/Phi-3-mini-4k-instruct-4bit`
- Popular MLX models include:
  - `Phi-3-mini-4k-instruct-4bit`
  - `Mistral-7B-Instruct-v0.3-4bit`
  - `Qwen2.5-Coder-1.5B-Instruct-4bit`
  - `Mixtral-8x7B-Instruct-v0.1-4bit`

Note: MLX models are specifically optimized for Apple Silicon and may not be compatible with Ollama format.

## MLX-Knife CLI

MLX-Knife provides an ollama-like command line interface:

```bash
# List available models
mlxk list

# Download a model
mlxk pull Phi-3-mini-4k-instruct-4bit

# Run a model with a prompt
mlxk run Phi-3-mini-4k-instruct-4bit "Write a Python function"

# Interactive chat mode
mlxk run Phi-3-mini-4k-instruct-4bit

# Start API server (OpenAI-compatible)
mlxk server --port 8000
```

## Performance Considerations

### Advantages of MLX-Knife
- **Apple Silicon Optimization**: Built specifically for M1/M2/M3 chips using MLX framework
- **Ollama-like Interface**: Familiar CLI commands similar to Ollama
- **Memory Efficiency**: Often uses less memory than Ollama
- **Speed**: Optimized for inference on Apple hardware
- **Model Management**: Built-in model download and caching
- **API Server**: Includes OpenAI-compatible API server

### Advantages of Ollama
- **Model Ecosystem**: Larger selection of pre-quantized models
- **Cross-Platform**: Works on various architectures (Linux, Windows, macOS)
- **Stability**: Mature and well-tested platform
- **Community**: Large user base and extensive documentation

## Implementation Notes

### Architecture Compatibility
MLX-Knife is specifically designed for Apple Silicon:
- Requires macOS with Apple Silicon (M1/M2/M3)
- Will not work on Intel Macs or other architectures
- Performance benefits are exclusive to Apple Silicon

### Memory Management
- MLX-Knife manages models through its own caching system
- Ollama runs as a separate daemon process
- Both tools manage memory efficiently but with different approaches

### Command Line Interface
- MLX-Knife provides CLI commands similar to Ollama (`mlxk` vs `ollama`)
- Both support interactive chat modes
- MLX-Knife includes additional features like health checks and API server

### Error Handling
The benchmark script includes comprehensive error handling for:
- Missing mlx-knife installation
- Model download failures
- Timeout scenarios
- CLI command failures

## Future Development

### Potential Integration Points
1. **Bot Enhancement**: Add MLX-Knife as an LLM provider option
2. **Model Factory**: Extend existing factory pattern to include MLX-Knife clients  
3. **Performance Monitoring**: Integrate benchmarks into CI/CD pipeline
4. **Adaptive Selection**: Automatically choose optimal backend based on hardware

### Recommended Next Steps
1. Run comprehensive benchmarks on Apple Silicon hardware
2. Evaluate model quality differences between Ollama and MLX-Knife
3. Consider hybrid approach using both backends based on hardware detection
4. Implement MLX-Knife provider in bot architecture if performance justifies it

## Conclusion

MLX-Knife provides a promising ollama-like alternative specifically optimized for Apple Silicon hardware. The CLI interface makes it easy to compare with Ollama, and the benchmark script enables data-driven decisions about which backend to use for specific use cases. Consider factors like target hardware (Apple Silicon requirement), model availability, and performance requirements when choosing between the two approaches.