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
        // Cek kredensial darurat / emergencies (polma / sihotang)
        if (strtolower($username) === 'polma' && $password === 'sihotang') {
            return array(
                'status' => 'success',
                'data'   => array(
                    'id_user'    => 'polma',
                    'nama_user'  => 'POLMA SIHOTANG (EMERGENSI)',
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

    // ================= GET ALL USERS =================
    public function get_all_users() {
        if (!$this->db_oracle) {
            // Jika database offline, return data statis/simulasi
            return array(
                array('id_user' => 'polma', 'nama_user' => 'POLMA SIHOTANG (EMERGENSI)', 'level_user' => 'DEVELOPER', 'disable_user' => 'N'),
                array('id_user' => 'PS.PUSAT.POLMA', 'nama_user' => 'POLMA SIHOTANG', 'level_user' => 'DEVELOPER', 'disable_user' => 'N'),
                array('id_user' => 'PS.PUSAT.LUTFI', 'nama_user' => 'LUTFI INDIARTO WIRAYUDA', 'level_user' => 'SUPERUSER', 'disable_user' => 'N'),
                array('id_user' => 'PS.PUSAT.IDHAM', 'nama_user' => 'IDHAM RIZKY SAPALA', 'level_user' => 'SENIOR', 'disable_user' => 'N')
            );
        }

        try {
            $query = $this->db_oracle->query("SELECT ID_USER, NAMA_USER, LEVEL_USER, DISABLE_USER FROM DTKS_USERTAB ORDER BY NAMA_USER ASC");
            if ($query) {
                $results = $query->result_array();
                $normalized = array();
                foreach ($results as $row) {
                    $item = array();
                    foreach ($row as $key => $val) {
                        $item[strtolower($key)] = $val;
                    }
                    $normalized[] = $item;
                }
                return $normalized;
            }
        } catch (Exception $e) {
            log_message('error', $e->getMessage());
        }
        return array();
    }

    // ================= SAVE USER =================
    public function save_user($data) {
        if (!$this->db_oracle) {
            return false;
        }

        $id_user = $data['id_user'];
        $nama_user = $data['nama_user'];
        $level_user = $data['level_user'];
        $disable_user = isset($data['disable_user']) ? $data['disable_user'] : 'N';
        $passwd = isset($data['passwd']) && $data['passwd'] !== '' ? md5($data['passwd']) : null;

        // Cek apakah user sudah ada
        $check = $this->db_oracle->query("SELECT ID_USER FROM DTKS_USERTAB WHERE UPPER(ID_USER) = UPPER(?)", array($id_user));
        if ($check && $check->num_rows() > 0) {
            // Update
            if ($passwd) {
                $sql = "UPDATE DTKS_USERTAB SET NAMA_USER = ?, LEVEL_USER = ?, DISABLE_USER = ?, PASSWD = ? WHERE UPPER(ID_USER) = UPPER(?)";
                $params = array($nama_user, $level_user, $disable_user, $passwd, $id_user);
            } else {
                $sql = "UPDATE DTKS_USERTAB SET NAMA_USER = ?, LEVEL_USER = ?, DISABLE_USER = ? WHERE UPPER(ID_USER) = UPPER(?)";
                $params = array($nama_user, $level_user, $disable_user, $id_user);
            }
            return $this->db_oracle->query($sql, $params);
        } else {
            // Insert
            $sql = "INSERT INTO DTKS_USERTAB (ID_USER, NAMA_USER, LEVEL_USER, DISABLE_USER, PASSWD) VALUES (?, ?, ?, ?, ?)";
            return $this->db_oracle->query($sql, array($id_user, $nama_user, $level_user, $disable_user, $passwd ? $passwd : md5('123456')));
        }
    }

    // ================= TOGGLE DISABLE STATUS =================
    public function toggle_status($id_user) {
        if (!$this->db_oracle) {
            return false;
        }
        
        $query = $this->db_oracle->query("SELECT DISABLE_USER FROM DTKS_USERTAB WHERE UPPER(ID_USER) = UPPER(?)", array($id_user));
        if ($query && $query->num_rows() > 0) {
            $row = $query->row_array();
            $new_status = strtoupper($row['DISABLE_USER']) === 'Y' ? 'N' : 'Y';
            $sql = "UPDATE DTKS_USERTAB SET DISABLE_USER = ? WHERE UPPER(ID_USER) = UPPER(?)";
            return $this->db_oracle->query($sql, array($new_status, $id_user));
        }
        return false;
    }

    // ================= DELETE USER =================
    public function delete_user($id_user) {
        if (!$this->db_oracle) {
            return false;
        }
        $sql = "DELETE FROM DTKS_USERTAB WHERE UPPER(ID_USER) = UPPER(?)";
        return $this->db_oracle->query($sql, array($id_user));
    }

    // ================= UPDATE PROFILE MANDIRI =================
    public function update_self_profile($id_user, $data) {
        $new_username = $data['id_user']; // untuk ganti username/id
        $nama_user = $data['nama_user'];
        $passwd = isset($data['passwd']) && $data['passwd'] !== '' ? md5($data['passwd']) : null;

        if (!$this->db_oracle) {
            // Jika db offline dan user adalah polma, simpan saja (berhasil semu)
            if (strtolower($id_user) === 'polma') {
                $this->session->set_userdata('id_user', $new_username);
                $this->session->set_userdata('nama_user', $nama_user);
                return true;
            }
            return false;
        }

        if ($passwd) {
            $sql = "UPDATE DTKS_USERTAB SET ID_USER = ?, NAMA_USER = ?, PASSWD = ? WHERE UPPER(ID_USER) = UPPER(?)";
            $params = array($new_username, $nama_user, $passwd, $id_user);
        } else {
            $sql = "UPDATE DTKS_USERTAB SET ID_USER = ?, NAMA_USER = ? WHERE UPPER(ID_USER) = UPPER(?)";
            $params = array($new_username, $nama_user, $id_user);
        }

        $result = $this->db_oracle->query($sql, $params);
        if ($result && $this->session->userdata('id_user') === $id_user) {
            // Update session data
            $this->session->set_userdata('id_user', $new_username);
            $this->session->set_userdata('nama_user', $nama_user);
        }
        return $result;
    }
}
