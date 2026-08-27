<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Db_config extends MY_Controller {

    protected $protected = true; // Hanya dapat diakses oleh user yang login

    public function __construct() {
        parent::__construct();
    }

    // ================= GET CONFIGURATION =================
    public function get_config() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        // Baca file database.php
        $db_file = APPPATH . 'config/database.php';
        if (!file_exists($db_file)) {
            return $this->response(500, 'error', 'File konfigurasi database tidak ditemukan.');
        }

        // Include file untuk memuat variabel database
        include($db_file);

        // Baca file system_settings.json
        $settings_file = APPPATH . 'config/system_settings.json';
        $site_name = 'NewKotainter';
        $site_description = 'v2.0 REST API & Workspace Terpadu';
        if (file_exists($settings_file)) {
            $settings = json_decode(file_get_contents($settings_file), true);
            if (isset($settings['site_name'])) $site_name = $settings['site_name'];
            if (isset($settings['site_description'])) $site_description = $settings['site_description'];
        }

        $data = array(
            'site_name'             => $site_name,
            'site_description'      => $site_description,
            
            // 1. Oracle
            'oracle_tns'            => isset($tnsname_oracle) ? $tnsname_oracle : '',
            'oracle_username'       => isset($db['oracle']['username']) ? $db['oracle']['username'] : '',
            'oracle_password'       => isset($db['oracle']['password']) ? $db['oracle']['password'] : '',
            
            // 2. Postgres
            'postgres_host'         => isset($db['postgres_ap2t']['hostname']) ? $db['postgres_ap2t']['hostname'] : (isset($db['postgres']['hostname']) ? $db['postgres']['hostname'] : ''),
            'postgres_port'         => isset($db['postgres_ap2t']['port']) ? $db['postgres_ap2t']['port'] : (isset($db['postgres']['port']) ? $db['postgres']['port'] : 5488),
            'postgres_database'     => isset($db['postgres_ap2t']['database']) ? $db['postgres_ap2t']['database'] : (isset($db['postgres']['database']) ? $db['postgres']['database'] : ''),
            'postgres_username'     => isset($db['postgres_ap2t']['username']) ? $db['postgres_ap2t']['username'] : (isset($db['postgres']['username']) ? $db['postgres']['username'] : ''),
            'postgres_password'     => isset($db['postgres_ap2t']['password']) ? $db['postgres_ap2t']['password'] : (isset($db['postgres']['password']) ? $db['postgres']['password'] : ''),
            
            'postgres_host_ap2t'    => isset($db['postgres_ap2t']['hostname']) ? $db['postgres_ap2t']['hostname'] : '10.99.20.11',
            'postgres_port_ap2t'    => isset($db['postgres_ap2t']['port']) ? $db['postgres_ap2t']['port'] : 5488,
            'postgres_database_ap2t'=> isset($db['postgres_ap2t']['database']) ? $db['postgres_ap2t']['database'] : 'ap2t_db',

            'postgres_host_jateng'  => isset($db['postgres_jateng']['hostname']) ? $db['postgres_jateng']['hostname'] : '10.99.20.12',
            'postgres_port_jateng'  => isset($db['postgres_jateng']['port']) ? $db['postgres_jateng']['port'] : 5488,
            'postgres_database_jateng'=> isset($db['postgres_jateng']['database']) ? $db['postgres_jateng']['database'] : 'ap2t_db_jateng',

            'postgres_host_jatim'   => isset($db['postgres_jatim']['hostname']) ? $db['postgres_jatim']['hostname'] : '10.99.20.13',
            'postgres_port_jatim'   => isset($db['postgres_jatim']['port']) ? $db['postgres_jatim']['port'] : 5488,
            'postgres_database_jatim'=> isset($db['postgres_jatim']['database']) ? $db['postgres_jatim']['database'] : 'ap2t_db_jatim',

            'postgres_host_jakban'  => isset($db['postgres_jakban']['hostname']) ? $db['postgres_jakban']['hostname'] : '10.99.20.13',
            'postgres_port_jakban'  => isset($db['postgres_jakban']['port']) ? $db['postgres_jakban']['port'] : 5488,
            'postgres_database_jakban'=> isset($db['postgres_jakban']['database']) ? $db['postgres_jakban']['database'] : 'ap2t_db_jakban',

            'postgres_host_jabar'   => isset($db['postgres_jabar']['hostname']) ? $db['postgres_jabar']['hostname'] : '10.99.20.14',
            'postgres_port_jabar'   => isset($db['postgres_jabar']['port']) ? $db['postgres_jabar']['port'] : 5488,
            'postgres_database_jabar'=> isset($db['postgres_jabar']['database']) ? $db['postgres_jabar']['database'] : 'ap2t_db_jabar',
            
            // 3. FSO Oracle
            'fso_oracle_tns'        => isset($tnsname_fso_oracle) ? $tnsname_fso_oracle : '',
            'fso_oracle_username'   => isset($db['fso_oracle']['username']) ? $db['fso_oracle']['username'] : '',
            'fso_oracle_password'   => isset($db['fso_oracle']['password']) ? $db['fso_oracle']['password'] : '',
            
            // 4. FSO Postgres
            'fso_postgres_host'     => isset($db['fso_postgres']['hostname']) ? $db['fso_postgres']['hostname'] : '',
            'fso_postgres_port'     => isset($db['fso_postgres']['port']) ? $db['fso_postgres']['port'] : 5488,
            'fso_postgres_username' => isset($db['fso_postgres']['username']) ? $db['fso_postgres']['username'] : '',
            'fso_postgres_password' => isset($db['fso_postgres']['password']) ? $db['fso_postgres']['password'] : '',
            'fso_postgres_database' => isset($db['fso_postgres']['database']) ? $db['fso_postgres']['database'] : '',
            
            // 5. CRM Postgres
            'postgres_crm_host'     => isset($db['postgres_crm']['hostname']) ? $db['postgres_crm']['hostname'] : '',
            'postgres_crm_port'     => isset($db['postgres_crm']['port']) ? $db['postgres_crm']['port'] : 5432,
            'postgres_crm_username' => isset($db['postgres_crm']['username']) ? $db['postgres_crm']['username'] : '',
            'postgres_crm_password' => isset($db['postgres_crm']['password']) ? $db['postgres_crm']['password'] : '',
            'postgres_crm_database' => isset($db['postgres_crm']['database']) ? $db['postgres_crm']['database'] : ''
        );

        return $this->response(200, 'success', 'Berhasil memuat konfigurasi database dan sistem.', $data);
    }

    // ================= SAVE CONFIGURATION =================
    public function save_config() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        // Membaca payload input
        $json_data = json_decode($this->input->raw_input_stream, true);

        // 1. Simpan setelan umum website
        $site_name        = isset($json_data['site_name']) ? trim($json_data['site_name']) : '';
        $site_description = isset($json_data['site_description']) ? trim($json_data['site_description']) : '';

        if (!empty($site_name)) {
            $settings_file = APPPATH . 'config/system_settings.json';
            $settings_data = array(
                'site_name'        => $site_name,
                'site_description' => $site_description
            );
            @file_put_contents($settings_file, json_encode($settings_data, JSON_PRETTY_PRINT));
        }

        // 2. Ambil parameter 4 database
        // Oracle
        $oracle_tns        = isset($json_data['oracle_tns']) ? trim($json_data['oracle_tns']) : '';
        $oracle_username   = isset($json_data['oracle_username']) ? trim($json_data['oracle_username']) : '';
        $oracle_password   = isset($json_data['oracle_password']) ? trim($json_data['oracle_password']) : '';
        
        // Postgres
        $postgres_username = isset($json_data['postgres_username']) ? trim($json_data['postgres_username']) : '';
        $postgres_password = isset($json_data['postgres_password']) ? trim($json_data['postgres_password']) : '';
        
        $postgres_host_ap2t      = isset($json_data['postgres_host_ap2t']) ? trim($json_data['postgres_host_ap2t']) : '10.99.20.11';
        $postgres_port_ap2t      = isset($json_data['postgres_port_ap2t']) ? (int)$json_data['postgres_port_ap2t'] : 5488;
        $postgres_database_ap2t  = isset($json_data['postgres_database_ap2t']) ? trim($json_data['postgres_database_ap2t']) : 'ap2t_db';

        $postgres_host_jateng    = isset($json_data['postgres_host_jateng']) ? trim($json_data['postgres_host_jateng']) : '10.99.20.12';
        $postgres_port_jateng    = isset($json_data['postgres_port_jateng']) ? (int)$json_data['postgres_port_jateng'] : 5488;
        $postgres_database_jateng= isset($json_data['postgres_database_jateng']) ? trim($json_data['postgres_database_jateng']) : 'ap2t_db_jateng';

        $postgres_host_jatim     = isset($json_data['postgres_host_jatim']) ? trim($json_data['postgres_host_jatim']) : '10.99.20.13';
        $postgres_port_jatim     = isset($json_data['postgres_port_jatim']) ? (int)$json_data['postgres_port_jatim'] : 5488;
        $postgres_database_jatim = isset($json_data['postgres_database_jatim']) ? trim($json_data['postgres_database_jatim']) : 'ap2t_db_jatim';

        $postgres_host_jakban    = isset($json_data['postgres_host_jakban']) ? trim($json_data['postgres_host_jakban']) : '10.99.20.13';
        $postgres_port_jakban    = isset($json_data['postgres_port_jakban']) ? (int)$json_data['postgres_port_jakban'] : 5488;
        $postgres_database_jakban= isset($json_data['postgres_database_jakban']) ? trim($json_data['postgres_database_jakban']) : 'ap2t_db_jakban';

        $postgres_host_jabar     = isset($json_data['postgres_host_jabar']) ? trim($json_data['postgres_host_jabar']) : '10.99.20.14';
        $postgres_port_jabar     = isset($json_data['postgres_port_jabar']) ? (int)$json_data['postgres_port_jabar'] : 5488;
        $postgres_database_jabar = isset($json_data['postgres_database_jabar']) ? trim($json_data['postgres_database_jabar']) : 'ap2t_db_jabar';

        // FSO Oracle
        $fso_oracle_tns      = isset($json_data['fso_oracle_tns']) ? trim($json_data['fso_oracle_tns']) : '';
        $fso_oracle_username = isset($json_data['fso_oracle_username']) ? trim($json_data['fso_oracle_username']) : '';
        $fso_oracle_password = isset($json_data['fso_oracle_password']) ? trim($json_data['fso_oracle_password']) : '';

        // FSO Postgres
        $fso_postgres_host     = isset($json_data['fso_postgres_host']) ? trim($json_data['fso_postgres_host']) : '';
        $fso_postgres_port     = isset($json_data['fso_postgres_port']) ? (int)$json_data['fso_postgres_port'] : 5488;
        $fso_postgres_username = isset($json_data['fso_postgres_username']) ? trim($json_data['fso_postgres_username']) : '';
        $fso_postgres_password = isset($json_data['fso_postgres_password']) ? trim($json_data['fso_postgres_password']) : '';
        $fso_postgres_database = isset($json_data['fso_postgres_database']) ? trim($json_data['fso_postgres_database']) : '';

        // CRM Postgres
        $postgres_crm_host     = isset($json_data['postgres_crm_host']) ? trim($json_data['postgres_crm_host']) : '';
        $postgres_crm_port     = isset($json_data['postgres_crm_port']) ? (int)$json_data['postgres_crm_port'] : 5432;
        $postgres_crm_username = isset($json_data['postgres_crm_username']) ? trim($json_data['postgres_crm_username']) : '';
        $postgres_crm_password = isset($json_data['postgres_crm_password']) ? trim($json_data['postgres_crm_password']) : '';
        $postgres_crm_database = isset($json_data['postgres_crm_database']) ? trim($json_data['postgres_crm_database']) : '';

        // Validasi input minimal
        if (empty($oracle_tns) || empty($oracle_username) || empty($postgres_host_ap2t) || empty($postgres_database_ap2t)) {
            return $this->response(400, 'error', 'Kolom TNS Oracle, Username Oracle, Host Postgres (AP2T), dan DB Name Postgres (AP2T) wajib diisi!');
        }

        $db_file = APPPATH . 'config/database.php';
        if (!is_writable($db_file)) {
            return $this->response(500, 'error', 'File konfigurasi database.php tidak dapat ditulis (Permission Denied).');
        }

        // Susun isi template database.php secara dinamis untuk 4 koneksi
        $template = "<?php
defined('BASEPATH') OR exit('No direct script access allowed');

\$active_group = \"oracle\";
\$query_builder = TRUE;

\$tnsname_oracle = '" . addcslashes($oracle_tns, "'\\") . "';
\$tnsname_fso_oracle = '" . addcslashes($fso_oracle_tns, "'\\") . "';

\$db['oracle'] = array(
	'dsn'      => '',
	'hostname' => \$tnsname_oracle,
	'username' => '" . addcslashes($oracle_username, "'\\") . "',
	'password' => '" . addcslashes($oracle_password, "'\\") . "',
	'database' => '',
	'dbdriver' => 'oci8',
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

\$db['postgres_ap2t'] = array(
	'dsn'      => '',
	'hostname' => '" . addcslashes($postgres_host_ap2t, "'\\") . "',
	'username' => '" . addcslashes($postgres_username, "'\\") . "',
	'password' => '" . addcslashes($postgres_password, "'\\") . "',
	'database' => '" . addcslashes($postgres_database_ap2t, "'\\") . "',
	'dbdriver' => 'postgre',
	'port'     => " . $postgres_port_ap2t . ",
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

\$db['postgres_jateng'] = array(
	'dsn'      => '',
	'hostname' => '" . addcslashes($postgres_host_jateng, "'\\") . "',
	'username' => '" . addcslashes($postgres_username, "'\\") . "',
	'password' => '" . addcslashes($postgres_password, "'\\") . "',
	'database' => '" . addcslashes($postgres_database_jateng, "'\\") . "',
	'dbdriver' => 'postgre',
	'port'     => " . $postgres_port_jateng . ",
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

\$db['postgres_jatim'] = array(
	'dsn'      => '',
	'hostname' => '" . addcslashes($postgres_host_jatim, "'\\") . "',
	'username' => '" . addcslashes($postgres_username, "'\\") . "',
	'password' => '" . addcslashes($postgres_password, "'\\") . "',
	'database' => '" . addcslashes($postgres_database_jatim, "'\\") . "',
	'dbdriver' => 'postgre',
	'port'     => " . $postgres_port_jatim . ",
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

\$db['postgres_jakban'] = array(
	'dsn'      => '',
	'hostname' => '" . addcslashes($postgres_host_jakban, "'\\") . "',
	'username' => '" . addcslashes($postgres_username, "'\\") . "',
	'password' => '" . addcslashes($postgres_password, "'\\") . "',
	'database' => '" . addcslashes($postgres_database_jakban, "'\\") . "',
	'dbdriver' => 'postgre',
	'port'     => " . $postgres_port_jakban . ",
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

\$db['postgres_jabar'] = array(
	'dsn'      => '',
	'hostname' => '" . addcslashes($postgres_host_jabar, "'\\") . "',
	'username' => '" . addcslashes($postgres_username, "'\\") . "',
	'password' => '" . addcslashes($postgres_password, "'\\") . "',
	'database' => '" . addcslashes($postgres_database_jabar, "'\\") . "',
	'dbdriver' => 'postgre',
	'port'     => " . $postgres_port_jabar . ",
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

\$db['fso_oracle'] = array(
	'dsn'      => '',
	'hostname' => \$tnsname_fso_oracle,
	'username' => '" . addcslashes($fso_oracle_username, "'\\") . "',
	'password' => '" . addcslashes($fso_oracle_password, "'\\") . "',
	'database' => '',
	'dbdriver' => 'oci8',
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

\$db['fso_postgres'] = array(
	'dsn'      => '',
	'hostname' => '" . addcslashes($fso_postgres_host, "'\\") . "',
	'username' => '" . addcslashes($fso_postgres_username, "'\\") . "',
	'password' => '" . addcslashes($fso_postgres_password, "'\\") . "',
	'database' => '" . addcslashes($fso_postgres_database, "'\\") . "',
	'dbdriver' => 'postgre',
	'port'     => " . $fso_postgres_port . ",
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

\$db['postgres_crm'] = array(
	'dsn'      => '',
	'hostname' => '" . addcslashes($postgres_crm_host, "'\\") . "',
	'username' => '" . addcslashes($postgres_crm_username, "'\\") . "',
	'password' => '" . addcslashes($postgres_crm_password, "'\\") . "',
	'database' => '" . addcslashes($postgres_crm_database, "'\\") . "',
	'dbdriver' => 'postgre',
	'port'     => " . $postgres_crm_port . ",
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

// Dynamic connection swap for group 'postgres' based on request header X-DB-Region
\$db_region = isset(\$_SERVER['HTTP_X_DB_REGION']) ? strtolower(\$_SERVER['HTTP_X_DB_REGION']) : 'ap2t';
if (\$db_region === 'jateng') {
	\$db['postgres'] = \$db['postgres_jateng'];
} else if (\$db_region === 'jatim') {
	\$db['postgres'] = \$db['postgres_jatim'];
} else if (\$db_region === 'jakban') {
	\$db['postgres'] = \$db['postgres_jakban'];
} else if (\$db_region === 'jabar') {
	\$db['postgres'] = \$db['postgres_jabar'];
} else {
	\$db['postgres'] = \$db['postgres_ap2t'];
}
";

        // Check if we should update Oracle presets in Setting.jsx source file
        $updated_presets = false;
        
        $oTnsLower = strtolower($oracle_tns);
        if (strpos($oTnsLower, '10.14.159.10') !== false) {
            if ($this->_replace_preset_in_setting('oracle', 'truno', $oracle_tns, $oracle_username, $oracle_password)) {
                $updated_presets = true;
            }
        } else if (strpos($oTnsLower, '10.14.158.10') !== false) {
            if ($this->_replace_preset_in_setting('oracle', 'gandul', $oracle_tns, $oracle_username, $oracle_password)) {
                $updated_presets = true;
            }
        }
        
        // Check if we should update FSO Oracle presets in Setting.jsx source file
        $fsoTnsLower = strtolower($fso_oracle_tns);
        if (strpos($fsoTnsLower, '10.14.212.11') !== false) {
            if ($this->_replace_preset_in_setting('fso_oracle', 'truno', $fso_oracle_tns, $fso_oracle_username, $fso_oracle_password)) {
                $updated_presets = true;
            }
        } else if (strpos($fsoTnsLower, '10.14.211.11') !== false) {
            if ($this->_replace_preset_in_setting('fso_oracle', 'gandul', $fso_oracle_tns, $fso_oracle_username, $fso_oracle_password)) {
                $updated_presets = true;
            }
        }

        if (file_put_contents($db_file, $template) !== false) {
            // Recompile React project bundle if preset templates were updated
            if ($updated_presets) {
                @shell_exec("cd " . escapeshellarg(FCPATH . '../frontend') . " && npm run build");
            }
            return $this->response(200, 'success', 'Konfigurasi database dan setelan website berhasil disimpan!');
        } else {
            return $this->response(500, 'error', 'Gagal menulis file konfigurasi database.php.');
        }
    }

    /**
     * Helper to parse and rewrite Setting.jsx preset blocks from backend on-the-fly
     */
    private function _replace_preset_in_setting($preset_type, $preset_name, $new_tns, $new_user, $new_pass) {
        $setting_file = FCPATH . '../frontend/src/components/Setting.jsx';
        if (!file_exists($setting_file) || !is_writable($setting_file)) {
            return false;
        }
        
        $content = file_get_contents($setting_file);
        
        $func_name = ($preset_type === 'oracle') ? 'handleOraclePresetChange' : 'handleFsoOraclePresetChange';
        $tns_var = ($preset_type === 'oracle') ? 'setOracleTns' : 'setFsoOracleTns';
        $user_var = ($preset_type === 'oracle') ? 'setOracleUsername' : 'setFsoOracleUsername';
        $pass_var = ($preset_type === 'oracle') ? 'setOraclePassword' : 'setFsoOraclePassword';
        
        $pattern = '/const\s+' . $func_name . '\s*=\s*\(preset\)\s*=>\s*\{(.*?)\n  \};/s';
        
        if (preg_match($pattern, $content, $func_matches)) {
            $func_body = $func_matches[1];
            
            $block_pattern = '/(if|else if)\s*\(\s*preset\s*===\s*\'' . $preset_name . '\'\s*\)\s*\{(.*?)\n\s*\}/s';
            
            if (preg_match($block_pattern, $func_body, $block_matches)) {
                $block_body = $block_matches[2];
                
                // 1. Replace TNS
                $new_block_body = preg_replace('/(' . $tns_var . '\(\`).*?(\`\);)/s', '$1' . addcslashes($new_tns, '$`\\') . '$2', $block_body);
                
                // 2. Replace Username
                $new_block_body = preg_replace('/(' . $user_var . '\(\').*?(\'\);)/s', '$1' . addcslashes($new_user, "'\\") . '$2', $new_block_body);
                
                // 3. Replace Password
                $new_block_body = preg_replace('/(' . $pass_var . '\(\').*?(\'\);)/s', '$1' . addcslashes($new_pass, "'\\") . '$2', $new_block_body);
                
                $new_block = $block_matches[1] . " (preset === '" . $preset_name . "') {" . $new_block_body . "\n    }";
                
                $new_func_body = str_replace($block_matches[0], $new_block, $func_body);
                $new_content = str_replace($func_matches[1], $new_func_body, $content);
                
                return file_put_contents($setting_file, $new_content) !== false;
            }
        }
        return false;
    }
}
