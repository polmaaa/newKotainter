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

        // Baca file database.php secara langsung untuk mengambil variabel
        $db_file = APPPATH . 'config/database.php';
        if (!file_exists($db_file)) {
            return $this->response(500, 'error', 'File konfigurasi database tidak ditemukan.');
        }

        // Include file secara lokal untuk mengambil variabel $db dan $tnsname_oracle
        include($db_file);

        $data = array(
            'oracle_tns'        => isset($tnsname_oracle) ? $tnsname_oracle : '',
            'oracle_username'   => isset($db['oracle']['username']) ? $db['oracle']['username'] : '',
            'oracle_password'   => isset($db['oracle']['password']) ? $db['oracle']['password'] : '',
            'postgres_host'     => isset($db['postgres']['hostname']) ? $db['postgres']['hostname'] : '',
            'postgres_port'     => isset($db['postgres']['port']) ? $db['postgres']['port'] : 5432,
            'postgres_username' => isset($db['postgres']['username']) ? $db['postgres']['username'] : '',
            'postgres_password' => isset($db['postgres']['password']) ? $db['postgres']['password'] : '',
            'postgres_database' => isset($db['postgres']['database']) ? $db['postgres']['database'] : ''
        );

        return $this->response(200, 'success', 'Berhasil memuat konfigurasi database.', $data);
    }

    // ================= SAVE CONFIGURATION =================
    public function save_config() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        // Membaca payload input
        $stream_clean = $this->security->xss_clean($this->input->raw_input_stream);
        $json_data = json_decode($stream_clean, true);

        $oracle_tns        = isset($json_data['oracle_tns']) ? trim($json_data['oracle_tns']) : '';
        $oracle_username   = isset($json_data['oracle_username']) ? trim($json_data['oracle_username']) : '';
        $oracle_password   = isset($json_data['oracle_password']) ? trim($json_data['oracle_password']) : '';
        $postgres_host     = isset($json_data['postgres_host']) ? trim($json_data['postgres_host']) : '';
        $postgres_port     = isset($json_data['postgres_port']) ? (int)$json_data['postgres_port'] : 5432;
        $postgres_username = isset($json_data['postgres_username']) ? trim($json_data['postgres_username']) : '';
        $postgres_password = isset($json_data['postgres_password']) ? trim($json_data['postgres_password']) : '';
        $postgres_database = isset($json_data['postgres_database']) ? trim($json_data['postgres_database']) : '';

        if (empty($oracle_tns) || empty($oracle_username) || empty($postgres_host) || empty($postgres_database)) {
            return $this->response(400, 'error', 'Kolom TNS Oracle, Username Oracle, Host Postgres, dan DB Name Postgres wajib diisi!');
        }

        $db_file = APPPATH . 'config/database.php';
        if (!is_writable($db_file)) {
            return $this->response(500, 'error', 'File konfigurasi database.php tidak dapat ditulis (Permission Denied).');
        }

        // Susun isi template database.php secara dinamis
        $template = "<?php
defined('BASEPATH') OR exit('No direct script access allowed');

\$active_group = \"oracle\";
\$query_builder = TRUE;

\$tnsname_oracle = '" . addcslashes($oracle_tns, "'\\") . "';

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

\$db['postgres'] = array(
	'dsn'      => '',
	'hostname' => '" . addcslashes($postgres_host, "'\\") . "',
	'username' => '" . addcslashes($postgres_username, "'\\") . "',
	'password' => '" . addcslashes($postgres_password, "'\\") . "',
	'database' => '" . addcslashes($postgres_database, "'\\") . "',
	'dbdriver' => 'postgre',
	'port'     => " . $postgres_port . ",
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
";

        if (file_put_contents($db_file, $template) !== false) {
            return $this->response(200, 'success', 'Konfigurasi database berhasil disimpan!');
        } else {
            return $this->response(500, 'error', 'Gagal menulis file konfigurasi database.php.');
        }
    }
}
