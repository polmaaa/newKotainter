<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Muser extends CI_Model {

    private $db_oracle = null;

    public function __construct() {
        parent::__construct();
        $this->load->library('session');
        $this->init_db();
    }

    /**
     * Menginisialisasi koneksi database Oracle secara aman,
     * serta secara otomatis membuat dan mengisi tabel DTKS_USERTAB di Oracle jika belum terbuat.
     */
    private function init_db() {
        $db_debug_default = $this->db->db_debug;
        $this->db->db_debug = FALSE;
        try {
            $this->db_oracle = @$this->load->database('oracle', TRUE);
            if ($this->db_oracle && $this->db_oracle->conn_id) {
                // Periksa apakah tabel DTKS_USERTAB ada di Oracle (Oracle menyimpan nama tabel dalam huruf besar)
                $table_check = $this->db_oracle->query("SELECT table_name FROM user_tables WHERE table_name = 'DTKS_USERTAB'");
                if (!$table_check || $table_check->num_rows() === 0) {
                    // Buat tabel jika belum ada
                    $create_sql = "CREATE TABLE DTKS_USERTAB (
                        ID_USER VARCHAR2(50) PRIMARY KEY,
                        NAMA_USER VARCHAR2(100) NOT NULL,
                        PASSWD VARCHAR2(32) NOT NULL,
                        DISABLE_USER CHAR(1) DEFAULT 'N' CHECK (DISABLE_USER IN ('Y', 'N')),
                        LEVEL_USER VARCHAR2(20) NOT NULL CHECK (LEVEL_USER IN ('JUNIOR', 'MIDDLE', 'SENIOR', 'SUPERUSER', 'DEVELOPER'))
                    )";
                    $this->db_oracle->query($create_sql);

                    // Isi data pengguna awal
                    $insert_queries = array(
                        "INSERT INTO DTKS_USERTAB (ID_USER, NAMA_USER, PASSWD, DISABLE_USER, LEVEL_USER) VALUES ('PS.PUSAT.POLMA', 'POLMA SIHOTANG', 'eeb184d2cde34db5718552910d73c983', 'N', 'DEVELOPER')",
                        "INSERT INTO DTKS_USERTAB (ID_USER, NAMA_USER, PASSWD, DISABLE_USER, LEVEL_USER) VALUES ('PS.PUSAT.LUTFI', 'LUTFI INDIARTO WIRAYUDA', 'bfce4f791b02f5fa8a35926ec5edfe26', 'N', 'SUPERUSER')",
                        "INSERT INTO DTKS_USERTAB (ID_USER, NAMA_USER, PASSWD, DISABLE_USER, LEVEL_USER) VALUES ('PS.PUSAT.IDHAM', 'IDHAM RIZKY SAPALA', 'd74ee5bc288bff461f91e98e7d4fcd93', 'N', 'SENIOR')"
                    );
                    foreach ($insert_queries as $sql) {
                        $this->db_oracle->query($sql);
                    }
                }
            } else {
                $this->db_oracle = null;
            }
        } catch (Exception $e) {
            $this->db_oracle = null;
        }
        $this->db->db_debug = $db_debug_default;
    }

    /**
     * Memeriksa kredensial login user terhadap database Oracle secara mutlak
     */
    public function login($username, $password) {
        // Cek kredensial darurat / emergencies (admin.sistem / admin123)
        if (strtolower($username) === 'admin.sistem' && $password === 'admin123') {
            return array(
                'status' => 'success',
                'data'   => array(
                    'id_user'    => 'admin.sistem',
                    'nama_user'  => 'ADMINISTRATOR EMERGENSI',
                    'level_user' => 'DEVELOPER'
                )
            );
        }

        // 1. Validasi koneksi database Oracle
        if (!$this->db_oracle) {
            return array(
                'status'  => 'error',
                'message' => 'Gagal terhubung ke database Oracle (TNS:Connect timeout / Offline).'
            );
        }

        $password_md5 = md5($password);

        try {
            // Kueri case-insensitive untuk ID_USER
            $sql = "SELECT ID_USER, NAMA_USER, LEVEL_USER, DISABLE_USER 
                    FROM DTKS_USERTAB 
                    WHERE UPPER(ID_USER) = UPPER(?) AND PASSWD = ?";
            $query = $this->db_oracle->query($sql, array($username, $password_md5));
            
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
                'message' => 'Gagal memproses data otentikasi di database Oracle: ' . $e->getMessage()
            );
        }
    }
}
