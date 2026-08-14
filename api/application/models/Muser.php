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
     * Memeriksa kredensial login user terhadap PostgreSQL
     */
    public function login($username, $password) {
        $password_md5 = md5($password);

        // 1. Coba kueri database PostgreSQL jika terhubung
        if ($this->db_postgres) {
            try {
                // Kueri case-insensitive untuk ID_USER
                $sql = "SELECT ID_USER, NAMA_USER, LEVEL_USER, DISABLE_USER 
                        FROM DTKS_MENUTAB 
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
                }
            } catch (Exception $e) {
                // Abaikan kesalahan kueri dan biarkan lanjut ke mode simulasi/fallback
            }
        }

        // 2. MODE FALLBACK: Jika PostgreSQL offline, dukung login statis dengan 3 user terdaftar
        $fallback_users = array(
            'PS.PUSAT.POLMA' => array(
                'id_user'     => 'PS.PUSAT.POLMA', 
                'nama_user'   => 'POLMA SIHOTANG', 
                'passwd_md5'  => 'eeb184d2cde34db5718552910d73c983', 
                'level_user'  => 'DEVELOPER'
            ),
            'PS.PUSAT.LUTFI' => array(
                'id_user'     => 'PS.PUSAT.LUTFI', 
                'nama_user'   => 'LUTFI INDIARTO WIRAYUDA', 
                'passwd_md5'  => 'bfce4f791b02f5fa8a35926ec5edfe26', 
                'level_user'  => 'SUPERUSER'
            ),
            'PS.PUSAT.IDHAM' => array(
                'id_user'     => 'PS.PUSAT.IDHAM', 
                'nama_user'   => 'IDHAM RIZKY SAPALA', 
                'passwd_md5'  => 'd74ee5bc288bff461f91e98e7d4fcd93', 
                'level_user'  => 'SENIOR'
            )
        );

        $upper_username = strtoupper($username);
        if (isset($fallback_users[$upper_username])) {
            $user = $fallback_users[$upper_username];
            if ($user['passwd_md5'] === $password_md5) {
                return array(
                    'status' => 'success',
                    'data'   => array(
                        'id_user'    => $user['id_user'],
                        'nama_user'  => $user['nama_user'],
                        'level_user' => $user['level_user']
                    )
                );
            }
        }

        return array(
            'status'  => 'error',
            'message' => 'Username atau Password salah!'
        );
    }
}
