#ifndef FILE_OPS_H
#define FILE_OPS_H

#include <stdint.h>

// File list structure
typedef struct file_list_t {
    char *path;
    struct file_list_t *next;
} file_list_t;

// Directory list structure
typedef struct directory_list_t {
    char *path;
    struct directory_list_t *next;
} directory_list_t;

// Function declarations
file_list_t *enumerate_files_recursive(const char *path);
void free_file_list(file_list_t *list);
void free_directory_list(directory_list_t *list);
int file_delete(const char *path);
int file_exists(const char *path);
uint64_t file_get_size(const char *path);
int file_is_directory(const char *path);
int file_is_regular_file(const char *path);
char *file_get_extension(const char *path);
int file_rename(const char *old_path, const char *new_path);

#endif
