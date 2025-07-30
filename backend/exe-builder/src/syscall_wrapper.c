#include "syscall_wrapper.h"
#include <string.h>

// Direct syscall implementations using inline assembly

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
) {
    (void)FileHandle; (void)DesiredAccess; (void)ObjectAttributes; (void)IoStatusBlock;
    (void)AllocationSize; (void)FileAttributes; (void)ShareAccess; (void)CreateDisposition;
    (void)CreateOptions; (void)EaBuffer; (void)EaLength;
    NTSTATUS result;
    
    __asm__ volatile (
        "movq $0x55, %%rax\n\t"        // NtCreateFile syscall number
        "movq %%rcx, %%r10\n\t"        // First parameter
        "syscall\n\t"
        "movq %%rax, %0\n\t"
        : "=m" (result)
        :
        : "rax", "r10", "r11", "memory"
    );
    
    return result;
}

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
) {
    NTSTATUS result;
    
    __asm__ volatile (
        "movq $0x06, %%rax\n\t"        // NtReadFile syscall number
        "movq %%rcx, %%r10\n\t"
        "syscall\n\t"
        "movq %%rax, %0\n\t"
        : "=m" (result)
        :
        : "rax", "r10", "r11", "memory"
    );
    
    return result;
}

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
) {
    NTSTATUS result;
    
    __asm__ volatile (
        "movq $0x08, %%rax\n\t"        // NtWriteFile syscall number
        "movq %%rcx, %%r10\n\t"
        "syscall\n\t"
        "movq %%rax, %0\n\t"
        : "=m" (result)
        :
        : "rax", "r10", "r11", "memory"
    );
    
    return result;
}

NTSTATUS sys_close_handle(HANDLE Handle) {
    NTSTATUS result;
    
    __asm__ volatile (
        "movq $0x0F, %%rax\n\t"        // NtClose syscall number
        "movq %%rcx, %%r10\n\t"
        "syscall\n\t"
        "movq %%rax, %0\n\t"
        : "=m" (result)
        :
        : "rax", "r10", "r11", "memory"
    );
    
    return result;
}

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
) {
    NTSTATUS result;
    
    __asm__ volatile (
        "movq $0x37, %%rax\n\t"        // NtQueryDirectoryFile syscall number
        "movq %%rcx, %%r10\n\t"
        "syscall\n\t"
        "movq %%rax, %0\n\t"
        : "=m" (result)
        :
        : "rax", "r10", "r11", "memory"
    );
    
    return result;
}

NTSTATUS sys_allocate_virtual_memory(
    HANDLE ProcessHandle,
    PVOID *BaseAddress,
    ULONG_PTR ZeroBits,
    PSIZE_T RegionSize,
    ULONG AllocationType,
    ULONG Protect
) {
    NTSTATUS result;
    
    __asm__ volatile (
        "movq $0x18, %%rax\n\t"        // NtAllocateVirtualMemory syscall number
        "movq %%rcx, %%r10\n\t"
        "syscall\n\t"
        "movq %%rax, %0\n\t"
        : "=m" (result)
        :
        : "rax", "r10", "r11", "memory"
    );
    
    return result;
}

NTSTATUS sys_free_virtual_memory(
    HANDLE ProcessHandle,
    PVOID *BaseAddress,
    PSIZE_T RegionSize,
    ULONG FreeType
) {
    NTSTATUS result;
    
    __asm__ volatile (
        "movq $0x1E, %%rax\n\t"        // NtFreeVirtualMemory syscall number
        "movq %%rcx, %%r10\n\t"
        "syscall\n\t"
        "movq %%rax, %0\n\t"
        : "=m" (result)
        :
        : "rax", "r10", "r11", "memory"
    );
    
    return result;
}

// Utility functions
void init_unicode_string(PUNICODE_STRING dest, PCWSTR source) {
    if (source) {
        dest->Length = (USHORT)(wcslen(source) * sizeof(WCHAR));
        dest->MaximumLength = dest->Length + sizeof(WCHAR);
        dest->Buffer = (PWSTR)source;
    } else {
        dest->Length = 0;
        dest->MaximumLength = 0;
        dest->Buffer = NULL;
    }
}

void init_object_attributes(POBJECT_ATTRIBUTES oa, PUNICODE_STRING name, ULONG attributes) {
    oa->Length = sizeof(OBJECT_ATTRIBUTES);
    oa->RootDirectory = NULL;
    oa->ObjectName = name;
    oa->Attributes = attributes;
    oa->SecurityDescriptor = NULL;
    oa->SecurityQualityOfService = NULL;
}
