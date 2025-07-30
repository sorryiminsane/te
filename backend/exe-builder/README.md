# Cross-Platform Executable Builder

## Overview
This module compiles PowerShell ransomware logic into standalone executables with the following constraints:

- **OS Interaction**: All system calls via inline ASM wrappers (no direct WinAPI)
- **Encryption**: Any WinAPI calls are encrypted at runtime
- **Size Target**: 150-200KB final executable
- **Dependencies**: Requires CRT to be present on target system
- **Cross-Platform**: Supports Windows x64/x86

## Architecture

### Core Components
1. `syscall_wrapper.h` - Assembly syscall interface
2. `crypto_engine.c` - AES encryption implementation
3. `file_ops.c` - File system operations via syscalls
4. `ransom_core.c` - Main ransomware logic
5. `builder.js` - Node.js compilation service

### Build Process
1. Template substitution (config injection)
2. Source compilation with MinGW/MSVC
3. Binary packing and optimization
4. Encrypted API resolution

## Security Features
- Direct syscall usage bypasses API hooking
- Runtime API decryption
- Anti-debugging techniques
- **Fully self-contained**: CRT is statically linked into the executable, requiring **no runtime dependencies** on target systems. Runs on fresh Windows installations without any additional libraries or redistributables.

## Usage
To use the EXE builder, follow these steps:

1. Prepare the ransomware logic in PowerShell
2. Configure the builder settings in `builder.js`
3. Run the builder service to compile the executable
4. The resulting executable will be generated in the output directory

## Configuration
The builder service can be configured to customize the build process. The following options are available:

- `template`: The template file for the executable
- `output`: The output directory for the generated executable
- `compiler`: The compiler to use (MinGW or MSVC)
- `optimization`: The level of optimization for the executable

## Troubleshooting
If you encounter any issues during the build process, check the following:

- Ensure that the CRT is present on the target system
- Verify that the builder settings are correct
- Check the system logs for any errors related to the build process

## Limitations
The EXE builder has the following limitations:

- The final executable size may vary depending on the complexity of the ransomware logic
- The builder service may not work correctly on systems with strict security policies
- The encrypted API resolution may not work correctly on systems with custom API hooks
