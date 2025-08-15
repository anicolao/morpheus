# Define a variable for the Ollama manifests directory
OLLAMA_MANI_DIR := $(HOME)/.ollama/models/manifests/registry.ollama.ai/library

# 1. Find all source files ending in .ollama
SOURCES := $(wildcard *.ollama)

# 2. Generate the model names from the source file names (e.g., "morpheum-local.ollama" -> "morpheum-local")
MODELS := $(patsubst %.ollama,%,$(SOURCES))

# 3. Generate the full paths to the target manifest files for each model
TARGETS := $(patsubst %,$(OLLAMA_MANI_DIR)/%/latest,$(MODELS))

# The default command when you just run "make". Builds all models.
.PHONY: all
all: $(TARGETS)

# 4. Generic Pattern Rule:
# This single rule tells 'make' how to build ANY model manifest
# from its corresponding .ollama file.
$(OLLAMA_MANI_DIR)/%/latest: %.ollama
	@echo "Building model '$*' from $<..."
	ollama create $* -f $<

# A generic clean rule to remove all managed models
.PHONY: clean
clean:
	@echo "Removing managed models: $(MODELS)"
	ollama rm $(MODELS) || true
