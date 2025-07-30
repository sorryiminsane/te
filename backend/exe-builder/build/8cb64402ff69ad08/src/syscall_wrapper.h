#ifndef SYSCALL_WRAPPER_H
#define SYSCALL_WRAPPER_H

#include <stdint.h>
#include <windows.h>

// NTSTATUS type
typedef LONG NTSTATUS;

// NTSTATUS success check
#define NT_SUCCESS(Status) (((NTSTATUS)(Status)) >= 0)

// Syscall numbers for Windows 10/11 x64
#define SYSCALL_NT_CREATE_FILE          0x0055
#define SYSCALL_NT_READ_FILE            0x0006
#define SYSCALL_NT_WRITE_FILE           0x0008
#define SYSCALL_NT_CLOSE                0x000F
#define SYSCALL_NT_QUERY_DIRECTORY_FILE 0x0037
#define SYSCALL_NT_DELETE_FILE          0x0044
#define SYSCALL_NT_SET_INFORMATION_FILE 0x0027
#define SYSCALL_NT_ALLOCATE_VIRTUAL_MEMORY 0x0018
#define SYSCALL_NT_FREE_VIRTUAL_MEMORY  0x001E

// Structure definitions
typedef struct _UNICODE_STRING {
    USHORT Length;
    USHORT MaximumLength;
    PWSTR  Buffer;
} UNICODE_STRING, *PUNICODE_STRING;

typedef struct _OBJECT_ATTRIBUTES {
    ULONG Length;
    HANDLE RootDirectory;
    PUNICODE_STRING ObjectName;
    ULONG Attributes;
    PVOID SecurityDescriptor;
    PVOID SecurityQualityOfService;
} OBJECT_ATTRIBUTES, *POBJECT_ATTRIBUTES;

typedef struct _IO_STATUS_BLOCK {
    union {
        NTSTATUS Status;
        PVOID Pointer;
    };
    ULONG_PTR Information;
} IO_STATUS_BLOCK, *PIO_STATUS_BLOCK;

// Assembly syscall wrapper - bypasses API hooking
static inline NTSTATUS syscall_invoke(DWORD syscall_number, ...) {
    NTSTATUS result;
    
    __asm__ volatile (
        "movq %1, %%rax\n\t"           // Move syscall number to RAX
        "movq %%rcx, %%r10\n\t"        // Move first arg to R10 (Windows calling convention)
        "syscall\n\t"                  // Direct syscall
        "movq %%rax, %0\n\t"           // Store result
        : "=m" (result)
        : "r" ((uint64_t)syscall_number)
        : "rax", "r10", "r11", "memory"
    );
    
    return result;
}

// Syscall wrappers for file operations
NTSTATUS sys_create_file(
    PHANDLE FileHandle,
    ACCESS_MASK DesiredAccess,
    POBJECT_ATTRIBUTES ObjectAttributes,
    PIO_STATUS_BLOCK IoStatusBlock,
    PLARGE_INTEGER AllocationSize,
    ULONG FileAttributes,
    ULONG ShareAccess,
    ULONG CreateDisposition,
    ULONG CreateOptions,
    PVOID EaBuffer,
    ULONG EaLength
);

NTSTATUS sys_read_file(
    HANDLE FileHandle,
    HANDLE Event,
    PVOID ApcRoutine,
    PVOID ApcContext,
    PIO_STATUS_BLOCK IoStatusBlock,
    PVOID Buffer,
    ULONG Length,
    PLARGE_INTEGER ByteOffset,
    PULONG Key
);

NTSTATUS sys_write_file(
    HANDLE FileHandle,
    HANDLE Event,
    PVOID ApcRoutine,
    PVOID ApcContext,
    PIO_STATUS_BLOCK IoStatusBlock,
    PVOID Buffer,
    ULONG Length,
    PLARGE_INTEGER ByteOffset,
    PULONG Key
);

NTSTATUS sys_close_handle(HANDLE Handle);

NTSTATUS sys_query_directory_file(
    HANDLE FileHandle,
    HANDLE Event,
    PVOID ApcRoutine,
    PVOID ApcContext,
    PIO_STATUS_BLOCK IoStatusBlock,
    PVOID FileInformation,
    ULONG Length,
    ULONG FileInformationClass,
    BOOLEAN ReturnSingleEntry,
    PUNICODE_STRING FileName,
    BOOLEAN RestartScan
);

// Memory allocation via syscalls
NTSTATUS sys_allocate_virtual_memory(
    HANDLE ProcessHandle,
    PVOID *BaseAddress,
    ULONG_PTR ZeroBits,
    PSIZE_T RegionSize,
    ULONG AllocationType,
    ULONG Protect
);

NTSTATUS sys_free_virtual_memory(
    HANDLE ProcessHandle,
    PVOID *BaseAddress,
    PSIZE_T RegionSize,
    ULONG FreeType
);

// Utility functions
void init_unicode_string(PUNICODE_STRING dest, PCWSTR source);
void init_object_attributes(POBJECT_ATTRIBUTES oa, PUNICODE_STRING name, ULONG attributes);

#endif // SYSCALL_WRAPPER_H
