#include "crypto_engine.h"
#include <string.h>
#include <time.h>

// AES S-box and inverse S-box
static const uint8_t sbox[256] = {
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
};

// Round constants for key expansion
static const uint32_t rcon[11] = {
    0x00000000, 0x01000000, 0x02000000, 0x04000000, 0x08000000,
    0x10000000, 0x20000000, 0x40000000, 0x80000000, 0x1b000000, 0x36000000
};

// Utility functions
static uint32_t sub_word(uint32_t word) {
    return (sbox[(word >> 24) & 0xff] << 24) |
           (sbox[(word >> 16) & 0xff] << 16) |
           (sbox[(word >> 8) & 0xff] << 8) |
           (sbox[word & 0xff]);
}

static uint32_t rot_word(uint32_t word) {
    return (word << 8) | (word >> 24);
}

// Key expansion for AES-256
static void key_expansion(const uint8_t* key, uint32_t* round_keys) {
    int i;
    
    // Copy the original key
    for (i = 0; i < 8; i++) {
        round_keys[i] = ((uint32_t)key[4*i] << 24) |
                       ((uint32_t)key[4*i+1] << 16) |
                       ((uint32_t)key[4*i+2] << 8) |
                       ((uint32_t)key[4*i+3]);
    }
    
    // Generate round keys
    for (i = 8; i < 60; i++) {
        uint32_t temp = round_keys[i-1];
        
        if (i % 8 == 0) {
            temp = sub_word(rot_word(temp)) ^ rcon[i/8];
        } else if (i % 8 == 4) {
            temp = sub_word(temp);
        }
        
        round_keys[i] = round_keys[i-8] ^ temp;
    }
}

// AES encryption round functions
static void sub_bytes(uint8_t* state) {
    for (int i = 0; i < 16; i++) {
        state[i] = sbox[state[i]];
    }
}

static void shift_rows(uint8_t* state) {
    uint8_t temp;
    
    // Row 1: shift left by 1
    temp = state[1];
    state[1] = state[5];
    state[5] = state[9];
    state[9] = state[13];
    state[13] = temp;
    
    // Row 2: shift left by 2
    temp = state[2];
    state[2] = state[10];
    state[10] = temp;
    temp = state[6];
    state[6] = state[14];
    state[14] = temp;
    
    // Row 3: shift left by 3
    temp = state[3];
    state[3] = state[15];
    state[15] = state[11];
    state[11] = state[7];
    state[7] = temp;
}

static uint8_t gf_multiply(uint8_t a, uint8_t b) {
    uint8_t result = 0;
    while (b) {
        if (b & 1) result ^= a;
        a = (a << 1) ^ (a & 0x80 ? 0x1b : 0);
        b >>= 1;
    }
    return result;
}

static void mix_columns(uint8_t* state) {
    for (int i = 0; i < 4; i++) {
        uint8_t s0 = state[i*4];
        uint8_t s1 = state[i*4+1];
        uint8_t s2 = state[i*4+2];
        uint8_t s3 = state[i*4+3];
        
        state[i*4] = gf_multiply(s0, 2) ^ gf_multiply(s1, 3) ^ s2 ^ s3;
        state[i*4+1] = s0 ^ gf_multiply(s1, 2) ^ gf_multiply(s2, 3) ^ s3;
        state[i*4+2] = s0 ^ s1 ^ gf_multiply(s2, 2) ^ gf_multiply(s3, 3);
        state[i*4+3] = gf_multiply(s0, 3) ^ s1 ^ s2 ^ gf_multiply(s3, 2);
    }
}

static void add_round_key(uint8_t* state, const uint32_t* round_key) {
    for (int i = 0; i < 4; i++) {
        uint32_t key = round_key[i];
        state[i*4] ^= (key >> 24) & 0xff;
        state[i*4+1] ^= (key >> 16) & 0xff;
        state[i*4+2] ^= (key >> 8) & 0xff;
        state[i*4+3] ^= key & 0xff;
    }
}

// Main AES functions
void aes_init(aes_context_t* ctx, const uint8_t* key, const uint8_t* iv) {
    memcpy(ctx->key, key, AES_KEY_SIZE);
    memcpy(ctx->iv, iv, AES_IV_SIZE);
    key_expansion(key, ctx->round_keys);
}

void aes_encrypt_block(aes_context_t* ctx, const uint8_t* input, uint8_t* output) {
    uint8_t state[16];
    memcpy(state, input, 16);
    
    // Initial round
    add_round_key(state, &ctx->round_keys[0]);
    
    // Main rounds
    for (int round = 1; round < 14; round++) {
        sub_bytes(state);
        shift_rows(state);
        mix_columns(state);
        add_round_key(state, &ctx->round_keys[round * 4]);
    }
    
    // Final round
    sub_bytes(state);
    shift_rows(state);
    add_round_key(state, &ctx->round_keys[56]);
    
    memcpy(output, state, 16);
}

// CBC mode encryption
int aes_encrypt_cbc(aes_context_t* ctx, const uint8_t* input, uint8_t* output, size_t length) {
    if (length % AES_BLOCK_SIZE != 0) return -1;
    
    uint8_t iv[AES_BLOCK_SIZE];
    memcpy(iv, ctx->iv, AES_BLOCK_SIZE);
    
    for (size_t i = 0; i < length; i += AES_BLOCK_SIZE) {
        // XOR with previous ciphertext (or IV for first block)
        for (int j = 0; j < AES_BLOCK_SIZE; j++) {
            output[i + j] = input[i + j] ^ iv[j];
        }
        
        // Encrypt block
        aes_encrypt_block(ctx, &output[i], &output[i]);
        
        // Update IV for next block
        memcpy(iv, &output[i], AES_BLOCK_SIZE);
    }
    
    return 0;
}

// PKCS7 padding
size_t pkcs7_pad(uint8_t* data, size_t length, size_t block_size) {
    size_t padding = block_size - (length % block_size);
    for (size_t i = 0; i < padding; i++) {
        data[length + i] = (uint8_t)padding;
    }
    return length + padding;
}

// Simple PRNG for key generation (using system time as seed)
static uint32_t rng_state = 0;

static uint32_t simple_rand() {
    if (rng_state == 0) {
        rng_state = (uint32_t)time(NULL);
    }
    rng_state = rng_state * 1103515245 + 12345;
    return rng_state;
}

void generate_random_bytes(uint8_t* buffer, size_t length) {
    for (size_t i = 0; i < length; i++) {
        buffer[i] = (uint8_t)(simple_rand() & 0xff);
    }
}

// API name encryption for obfuscation
void encrypt_api_name(const char* api_name, encrypted_api_t* encrypted) {
    size_t name_len = strlen(api_name);
    encrypted->name_length = name_len;
    
    // Generate simple XOR key
    generate_random_bytes(encrypted->key, 16);
    
    // XOR encrypt the API name
    for (size_t i = 0; i < name_len && i < 63; i++) {
        encrypted->encrypted_name[i] = api_name[i] ^ encrypted->key[i % 16];
    }
    encrypted->encrypted_name[name_len] = 0;
}

void decrypt_api_name(const encrypted_api_t* encrypted, char* decrypted) {
    for (size_t i = 0; i < encrypted->name_length; i++) {
        decrypted[i] = encrypted->encrypted_name[i] ^ encrypted->key[i % 16];
    }
    decrypted[encrypted->name_length] = 0;
}
