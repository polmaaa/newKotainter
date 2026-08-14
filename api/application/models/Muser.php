<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Muser extends CI_Model {

    private $db_postgres = null;

    public function __construct() {
        parent::__construct();
        $this->load->library('session');
        $this->init_db();
    }

    /**
     * Menginisialisasi koneksi database PostgreSQL secara aman
     */
    private function init_db() {
        $db_debug_default = $this->db->db_debug;
        $this->db->db_debug = FALSE;
        try {
            $this->db_postgres = @$this->load->database('postgres', TRUE);
            if (!$this->db_postgres || !$this->db_postgres->conn_id) {
                $this->db_postgres = null;
            }
        } catch (Exception $e) {
            $this->db_postgres = null;
        }
        $this->db->db_debug = $db_debug_default;
    }

    /**
     * Memeriksa kredensial login user terhadap database PostgreSQL secara mutlak
     */
    public function login($username, $password) {
        // 1. Validasi koneksi database PostgreSQL
        if (!$this->db_postgres) {
            return array(
                'status'  => 'error',
                'message' => 'Gagal terhubung ke database PostgreSQL (Koneksi Offline).'
            );
        }

        $password_md5 = md5($password);

        try {
            // Kueri case-insensitive untuk ID_USER
            $sql = "SELECT ID_USER, NAMA_USER, LEVEL_USER, DISABLE_USER 
                    FROM DTKS_USERTAB 
                    WHERE UPPER(ID_USER) = UPPER(?) AND PASSWD = ?";
            $query = $this->db_postgres->query($sql, array($username, $password_md5));
            
            if ($query && $query->num_rows() > 0) {
                $row = $query->row_array();
                
                // Normalisasi nama kolom menjadi huruf kecil demi kemudahan
                $normalized_user = array();
                foreach ($row as $key => $val) {
                    $normalized_user[strtolower($key)] = $val;
                }
                
                if (strtoupper($normalized_user['disable_user']) === 'Y') {
                    return array(
                        'status'  => 'error',
                        'message' => 'Akun pengguna dinonaktifkan (DISABLE_USER = Y).'
                    );
                }
                
                return array(
                    'status' => 'success',
                    'data'   => array(
                        'id_user'    => $normalized_user['id_user'],
                        'nama_user'  => $normalized_user['nama_user'],
                        'level_user' => $normalized_user['level_user']
                    )
                );
            } else {
                return array(
                    'status'  => 'error',
                    'message' => 'Username atau Password salah!'
                );
            }
        } catch (Exception $e) {
            return array(
                'status'  => 'error',
                'message' => 'Gagal memproses data otentikasi di database: ' . $e->getMessage()
            );
        }
    }
}
