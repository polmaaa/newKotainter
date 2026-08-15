<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Mlogs extends CI_Model {

    private $db_oracle = null;
    private $db_postgres = null;
    private $db_fso_oracle = null;
    private $db_fso_postgres = null;

    public function __construct() {
        parent::__construct();
        $this->load->library('session');
        $this->init_databases();
    }

    /**
     * Helper to ping a host and port with a short timeout to prevent PHP blocks on offline databases
     */
    private function _ping_host($host, $port, $timeout = 1) {
        if (empty($host) || empty($port)) return false;
        
        // Handle TNS string description
        if (strpos($host, '(DESCRIPTION') !== false) {
            preg_match_all('/HOST\s*=\s*([a-zA-Z0-9\.-]+)/i', $host, $matches);
            if (!empty($matches[1])) {
                foreach ($matches[1] as $ip) {
                    $fp = @fsockopen($ip, $port, $errno, $errstr, $timeout);
                    if ($fp) {
                        fclose($fp);
                        return true;
                    }
                }
                return false;
            }
        }
        
        $fp = @fsockopen($host, $port, $errno, $errstr, $timeout);
        if ($fp) {
            fclose($fp);
            return true;
        }
        return false;
    }

    /**
     * Menginisialisasi koneksi database Oracle dan PostgreSQL secara aman.
     * Jika salah satu koneksi gagal, sistem tidak akan crash.
     */
    private function init_databases() {
        // Load database configuration
        $db_file = APPPATH . 'config/database.php';
        $oracle_host = '';
        $fso_oracle_host = '';
        $pg_host = '';
        $pg_port = 5432;
        $fso_pg_host = '';
        $fso_pg_port = 5488;
        
        if (file_exists($db_file)) {
            include($db_file);
            $oracle_host = isset($tnsname_oracle) ? $tnsname_oracle : '';
            $fso_oracle_host = isset($tnsname_fso_oracle) ? $tnsname_fso_oracle : '';
            $pg_host = isset($db['postgres']['hostname']) ? $db['postgres']['hostname'] : '';
            $pg_port = isset($db['postgres']['port']) ? $db['postgres']['port'] : 5432;
            $fso_pg_host = isset($db['fso_postgres']['hostname']) ? $db['fso_postgres']['hostname'] : '';
            $fso_pg_port = isset($db['fso_postgres']['port']) ? $db['fso_postgres']['port'] : 5488;
        }

        // 1. Inisialisasi Database Oracle (oci8)
        if ($this->_ping_host($oracle_host, 1521, 1)) {
            try {
                $this->db_oracle = @$this->load->database('oracle', TRUE);
                if (!$this->db_oracle || !$this->db_oracle->conn_id) {
                    $this->db_oracle = null;
                }
            } catch (Exception $e) {
                $this->db_oracle = null;
            }
        } else {
            $this->db_oracle = null;
        }

        // 2. Inisialisasi Database PostgreSQL (postgre)
        if ($this->_ping_host($pg_host, $pg_port, 1)) {
            try {
                $this->db_postgres = @$this->load->database('postgres', TRUE);
                if (!$this->db_postgres || !$this->db_postgres->conn_id) {
                    $this->db_postgres = null;
                }
            } catch (Exception $e) {
                $this->db_postgres = null;
            }
        } else {
            $this->db_postgres = null;
        }

        // 3. Inisialisasi Database FSO Oracle (oci8)
        if ($this->_ping_host($fso_oracle_host, 1521, 1)) {
            try {
                $this->db_fso_oracle = @$this->load->database('fso_oracle', TRUE);
                if (!$this->db_fso_oracle || !$this->db_fso_oracle->conn_id) {
                    $this->db_fso_oracle = null;
                }
            } catch (Exception $e) {
                $this->db_fso_oracle = null;
            }
        } else {
            $this->db_fso_oracle = null;
        }

        // 4. Inisialisasi Database FSO PostgreSQL (postgre)
        if ($this->_ping_host($fso_pg_host, $fso_pg_port, 1)) {
            try {
                $this->db_fso_postgres = @$this->load->database('fso_postgres', TRUE);
                if (!$this->db_fso_postgres || !$this->db_fso_postgres->conn_id) {
                    $this->db_fso_postgres = null;
                }
            } catch (Exception $e) {
                $this->db_fso_postgres = null;
            }
        } else {
            $this->db_fso_postgres = null;
        }
    }

    /**
     * Memeriksa status koneksi database
     */
    public function get_db_status() {
        return array(
            'oracle'       => $this->db_oracle !== null,
            'postgresql'   => $this->db_postgres !== null,
            'fso_oracle'   => $this->db_fso_oracle !== null,
            'fso_postgres' => $this->db_fso_postgres !== null
        );
    }

    /**
     * Mengambil data log dari database Oracle & PostgreSQL.
     * Jika database tidak terhubung, akan menggunakan data simulasi.
     */
    public function get_all_logs() {
        $logs = array();

        // 1. Ambil data dari Oracle jika terhubung
        if ($this->db_oracle) {
            try {
                // Jalankan query pada tabel OPHAR_LOG_PROSES
                $sql = "SELECT NOTIKET as no_tiket, 
                               JENIS_TRANSAKSI as jenis_transaksi, 
                               NO_PELANGGAN as no_pelanggan, 
                               TGLPROSES as tanggal_proses, 
                               'ORACLE' as database, 
                               STATUS as status, 
                               PETUGAS as petugas, 
                               KETERANGAN as query 
                        FROM OPHARAPP.OPHAR_LOG_PROSES 
                        ORDER BY TGLPROSES DESC";
                $query = $this->db_oracle->query($sql);
                if ($query) {
                    $logs = $query->result_array();
                }
            } catch (Exception $e) {
                // Log error atau abaikan
            }
        }

        // 2. Jika Oracle tidak terhubung atau datanya kosong, gunakan data simulasi
        if (empty($logs)) {
            $logs = $this->get_simulated_logs();
        }

        // 3. Gabungkan dengan log kustom yang dibuat user pada sesi aktif saat ini
        $custom_logs = $this->session->userdata('custom_logs');
        if (is_array($custom_logs)) {
            $logs = array_merge($custom_logs, $logs);
        }

        return $logs;
    }

    /**
     * Menyimpan data tiket log baru
     */
    public function save_log($data) {
        $custom_logs = $this->session->userdata('custom_logs');
        if (!is_array($custom_logs)) {
            $custom_logs = array();
        }

        // Bentuk data log baru untuk dimasukkan ke frontend
        $new_log = array(
            'no_tiket'        => htmlspecialchars($data['no_tiket']),
            'jenis_transaksi' => htmlspecialchars($data['jenis_transaksi']),
            'no_pelanggan'    => htmlspecialchars($data['no_pelanggan']),
            'tanggal_proses'  => date('d-M-y'), // Format standar tanggal Oracle
            'database'        => $data['database'],
            'status'          => $data['status'],
            'petugas'         => $this->session->userdata('nama_user') ? $this->session->userdata('nama_user') : 'ADMIN',
            'query'           => $data['query']
        );

        // 1. Simpan ke database Oracle jika targetnya Oracle dan terhubung
        if ($this->db_oracle && $data['database'] === 'ORACLE') {
            try {
                $sql = "INSERT INTO OPHARAPP.OPHAR_LOG_PROSES 
                        (NOTIKET, JENIS_TRANSAKSI, NO_PELANGGAN, TGLPROSES, STATUS, PETUGAS, KETERANGAN) 
                        VALUES (?, ?, ?, SYSDATE, ?, ?, ?)";
                $this->db_oracle->query($sql, array(
                    $new_log['no_tiket'],
                    $new_log['jenis_transaksi'],
                    $new_log['no_pelanggan'],
                    $new_log['status'],
                    $new_log['petugas'],
                    $new_log['query']
                ));
            } catch (Exception $e) {
                // Abaikan jika ada kegagalan insert
            }
        }

        // 2. Simpan ke database PostgreSQL jika targetnya PostgreSQL dan terhubung
        if ($this->db_postgres && $data['database'] === 'POSTGRESQL') {
            try {
                // Jalankan query pada database PGSQL
                $sql = "INSERT INTO log_posting_pdl (id_pelanggan, action, posted_at) VALUES (?, ?, NOW())";
                $this->db_postgres->query($sql, array(
                    $new_log['no_pelanggan'],
                    $new_log['jenis_transaksi']
                ));
            } catch (Exception $e) {
                // Abaikan jika ada kegagalan insert
            }
        }

        // 3. Simpan ke sesi aktif (untuk data caching instan pada frontend)
        array_unshift($custom_logs, $new_log);
        $this->session->set_userdata('custom_logs', $custom_logs);

        return $new_log;
    }

    /**
     * Data simulasi cadangan jika database tidak terhubung
     */
    private function get_simulated_logs() {
        return array(
            array(
                'no_tiket' => '14082026', 
                'jenis_transaksi' => 'UPDATE CRM WORKING UNIT', 
                'no_pelanggan' => 'usersso.travel5@pln.co.id', 
                'tanggal_proses' => '14-AUG-26', 
                'database' => 'ORACLE', 
                'status' => 'SUCCESS', 
                'petugas' => 'PS.51.TITISANDREH', 
                'query' => "UPDATE CRM_USER_UNIT SET WORKING_UNIT = 'UP3_BDG' WHERE EMAIL = 'usersso.travel5@pln.co.id'"
            ),
            array(
                'no_tiket' => '14082026', 
                'jenis_transaksi' => 'UPDATE CRM WORKING UNIT', 
                'no_pelanggan' => 'usersso.travel5@pln.co.id', 
                'tanggal_proses' => '14-AUG-26', 
                'database' => 'ORACLE', 
                'status' => 'SUCCESS', 
                'petugas' => 'PS.51.TITISANDREH', 
                'query' => "UPDATE CRM_USER_UNIT SET LAST_LOGIN = SYSDATE WHERE EMAIL = 'usersso.travel5@pln.co.id'"
            ),
            array(
                'no_tiket' => '4094798', 
                'jenis_transaksi' => 'POSTING PDL', 
                'no_pelanggan' => '546300561305282081', 
                'tanggal_proses' => '14-AUG-26', 
                'database' => 'POSTGRESQL', 
                'status' => 'SUCCESS', 
                'petugas' => 'PS.PUSAT.MARDIYANA2', 
                'query' => "INSERT INTO log_posting_pdl (id_pelanggan, action, posted_at) VALUES ('546300561305282081', 'POST', NOW())"
            ),
            array(
                'no_tiket' => '4094492', 
                'jenis_transaksi' => 'Update Trans 106', 
                'no_pelanggan' => '516750512607240766', 
                'tanggal_proses' => '14-AUG-26', 
                'database' => 'POSTGRESQL', 
                'status' => 'ERROR', 
                'petugas' => 'UCU SURYA', 
                'query' => "UPDATE trans_106 SET status_pembayaran = 'LUNAS' WHERE no_pelanggan = '516750512607240766';\n-- ERROR: relation \"trans_106\" does not exist"
            ),
            array(
                'no_tiket' => '4094492', 
                'jenis_transaksi' => 'Update Trans 106', 
                'no_pelanggan' => '516750512607240772', 
                'tanggal_proses' => '14-AUG-26', 
                'database' => 'ORACLE', 
                'status' => 'WARNING', 
                'petugas' => 'UCU SURYA', 
                'query' => "UPDATE TRANS_DATA SET STATUS = 'ACTIVE' WHERE CUST_ID = '516750512607240772';\n-- WARNING: ORA-01006: bind variable does not exist"
            ),
            array(
                'no_tiket' => '4094492', 
                'jenis_transaksi' => 'Update Trans 106', 
                'no_pelanggan' => '516750512607240771', 
                'tanggal_proses' => '14-AUG-26', 
                'database' => 'POSTGRESQL', 
                'status' => 'SUCCESS', 
                'petugas' => 'UCU SURYA', 
                'query' => "UPDATE customer_transaction SET status = 1 WHERE cust_no = '516750512607240771'"
            ),
            array(
                'no_tiket' => '4094492', 
                'jenis_transaksi' => 'Update Trans 106', 
                'no_pelanggan' => '516750512607240770', 
                'tanggal_proses' => '14-AUG-26', 
                'database' => 'POSTGRESQL', 
                'status' => 'SUCCESS', 
                'petugas' => 'UCU SURYA', 
                'query' => "UPDATE customer_transaction SET status = 1 WHERE cust_no = '516750512607240770'"
            ),
            array(
                'no_tiket' => '4094492', 
                'jenis_transaksi' => 'Update Trans 106', 
                'no_pelanggan' => '516750512607240769', 
                'tanggal_proses' => '14-AUG-26', 
                'database' => 'ORACLE', 
                'status' => 'SUCCESS', 
                'petugas' => 'UCU SURYA', 
                'query' => "UPDATE CUST_INFO SET LEVEL_ID = 2 WHERE ID_PELANGGAN = '516750512607240769'"
            ),
            array(
                'no_tiket' => '4094492', 
                'jenis_transaksi' => 'Update Trans 106', 
                'no_pelanggan' => '516750512607240768', 
                'tanggal_proses' => '14-AUG-26', 
                'database' => 'ORACLE', 
                'status' => 'SUCCESS', 
                'petugas' => 'UCU SURYA', 
                'query' => "UPDATE CUST_INFO SET LEVEL_ID = 2 WHERE ID_PELANGGAN = '516750512607240768'"
            )
        );
    }
}
