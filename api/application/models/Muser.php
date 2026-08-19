<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Muser extends CI_Model {

    private $db_oracle = null;
    private $table_name = 'OPHARAPP.DTKS_USERTAB';

    public function __construct() {
        parent::__construct();
        $this->load->library('session');
        $this->init_db();
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
     * Menginisialisasi koneksi database Oracle secara aman,
     * serta secara otomatis membuat dan mengisi tabel DTKS_USERTAB di Oracle jika belum terbuat.
     */
    private function init_db() {
        $db_debug_default = $this->db->db_debug;
        $this->db->db_debug = FALSE;

        // Load database configuration to get Oracle host
        $db_file = APPPATH . 'config/database.php';
        $oracle_host = '';
        if (file_exists($db_file)) {
            include($db_file);
            $oracle_host = isset($tnsname_oracle) ? $tnsname_oracle : '';
        }

        // PING Oracle first (timeout 1s)
        if (!$this->_ping_host($oracle_host, 1521, 1)) {
            $this->db_oracle = null;
            $this->db->db_debug = $db_debug_default;
            return;
        }

        try {
            $this->db_oracle = @$this->load->database('oracle', TRUE);
            if ($this->db_oracle && $this->db_oracle->conn_id) {
                // 1. Cek apakah tabel OPHARAPP.DTKS_USERTAB dapat diakses
                $table_check = @$this->db_oracle->query("SELECT 1 FROM OPHARAPP.DTKS_USERTAB WHERE ROWNUM = 1");
                if ($table_check) {
                    $this->table_name = 'OPHARAPP.DTKS_USERTAB';
                } else {
                    // Coba buat tabel di skema OPHARAPP
                    $create_sql = "CREATE TABLE OPHARAPP.DTKS_USERTAB (
                        ID_USER VARCHAR2(50) PRIMARY KEY,
                        NAMA_USER VARCHAR2(100) NOT NULL,
                        PASSWD VARCHAR2(32) NOT NULL,
                        DISABLE_USER CHAR(1) DEFAULT 'N' CHECK (DISABLE_USER IN ('Y', 'N')),
                        LEVEL_USER VARCHAR2(20) NOT NULL CHECK (LEVEL_USER IN ('JUNIOR', 'MIDDLE', 'SENIOR', 'SUPERUSER', 'DEVELOPER'))
                    )";
                    try {
                        @$this->db_oracle->query($create_sql);
                        $this->table_name = 'OPHARAPP.DTKS_USERTAB';

                        // Isi data pengguna awal
                        $insert_queries = array(
                            "INSERT INTO OPHARAPP.DTKS_USERTAB (ID_USER, NAMA_USER, PASSWD, DISABLE_USER, LEVEL_USER) VALUES ('PS.PUSAT.POLMA', 'POLMA SIHOTANG', 'eeb184d2cde34db5718552910d73c983', 'N', 'DEVELOPER')",
                            "INSERT INTO OPHARAPP.DTKS_USERTAB (ID_USER, NAMA_USER, PASSWD, DISABLE_USER, LEVEL_USER) VALUES ('PS.PUSAT.LUTFI', 'LUTFI INDIARTO WIRAYUDA', 'bfce4f791b02f5fa8a35926ec5edfe26', 'N', 'SUPERUSER')",
                            "INSERT INTO OPHARAPP.DTKS_USERTAB (ID_USER, NAMA_USER, PASSWD, DISABLE_USER, LEVEL_USER) VALUES ('PS.PUSAT.IDHAM', 'IDHAM RIZKY SAPALA', 'd74ee5bc288bff461f91e98e7d4fcd93', 'N', 'SENIOR')"
                        );
                        foreach ($insert_queries as $sql) {
                            @$this->db_oracle->query($sql);
                        }
                    } catch (Exception $ex) {
                        // Jika gagal membuat di skema DTKS (misal tidak ada privilage DTKS), gunakan fallback skema sendiri (POLMASIHOTANG)
                        $table_own_check = @$this->db_oracle->query("SELECT 1 FROM DTKS_USERTAB WHERE ROWNUM = 1");
                        if ($table_own_check) {
                            $this->table_name = 'DTKS_USERTAB';
                        } else {
                            $create_sql_own = "CREATE TABLE DTKS_USERTAB (
                                ID_USER VARCHAR2(50) PRIMARY KEY,
                                NAMA_USER VARCHAR2(100) NOT NULL,
                                PASSWD VARCHAR2(32) NOT NULL,
                                DISABLE_USER CHAR(1) DEFAULT 'N' CHECK (DISABLE_USER IN ('Y', 'N')),
                                LEVEL_USER VARCHAR2(20) NOT NULL CHECK (LEVEL_USER IN ('JUNIOR', 'MIDDLE', 'SENIOR', 'SUPERUSER', 'DEVELOPER'))
                            )";
                            @$this->db_oracle->query($create_sql_own);
                            $this->table_name = 'DTKS_USERTAB';

                            $insert_queries_own = array(
                                "INSERT INTO DTKS_USERTAB (ID_USER, NAMA_USER, PASSWD, DISABLE_USER, LEVEL_USER) VALUES ('PS.PUSAT.POLMA', 'POLMA SIHOTANG', 'eeb184d2cde34db5718552910d73c983', 'N', 'DEVELOPER')",
                                "INSERT INTO DTKS_USERTAB (ID_USER, NAMA_USER, PASSWD, DISABLE_USER, LEVEL_USER) VALUES ('PS.PUSAT.LUTFI', 'LUTFI INDIARTO WIRAYUDA', 'bfce4f791b02f5fa8a35926ec5edfe26', 'N', 'SUPERUSER')",
                                "INSERT INTO DTKS_USERTAB (ID_USER, NAMA_USER, PASSWD, DISABLE_USER, LEVEL_USER) VALUES ('PS.PUSAT.IDHAM', 'IDHAM RIZKY SAPALA', 'd74ee5bc288bff461f91e98e7d4fcd93', 'N', 'SENIOR')"
                            );
                            foreach ($insert_queries_own as $sql) {
                                @$this->db_oracle->query($sql);
                            }
                        }
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
                    FROM " . $this->table_name . " 
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
            $query = $this->db_oracle->query("SELECT ID_USER, NAMA_USER, LEVEL_USER, DISABLE_USER FROM " . $this->table_name . " ORDER BY NAMA_USER ASC");
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
        $check = $this->db_oracle->query("SELECT ID_USER FROM " . $this->table_name . " WHERE UPPER(ID_USER) = UPPER(?)", array($id_user));
        if ($check && $check->num_rows() > 0) {
            // Update
            if ($passwd) {
                $sql = "UPDATE " . $this->table_name . " SET NAMA_USER = ?, LEVEL_USER = ?, DISABLE_USER = ?, PASSWD = ? WHERE UPPER(ID_USER) = UPPER(?)";
                $params = array($nama_user, $level_user, $disable_user, $passwd, $id_user);
            } else {
                $sql = "UPDATE " . $this->table_name . " SET NAMA_USER = ?, LEVEL_USER = ?, DISABLE_USER = ? WHERE UPPER(ID_USER) = UPPER(?)";
                $params = array($nama_user, $level_user, $disable_user, $id_user);
            }
            return $this->db_oracle->query($sql, $params);
        } else {
            // Insert
            $sql = "INSERT INTO " . $this->table_name . " (ID_USER, NAMA_USER, LEVEL_USER, DISABLE_USER, PASSWD) VALUES (?, ?, ?, ?, ?)";
            return $this->db_oracle->query($sql, array($id_user, $nama_user, $level_user, $disable_user, $passwd ? $passwd : md5('123456')));
        }
    }

    // ================= TOGGLE DISABLE STATUS =================
    public function toggle_status($id_user) {
        if (!$this->db_oracle) {
            return false;
        }
        
        $query = $this->db_oracle->query("SELECT DISABLE_USER FROM " . $this->table_name . " WHERE UPPER(ID_USER) = UPPER(?)", array($id_user));
        if ($query && $query->num_rows() > 0) {
            $row = $query->row_array();
            $new_status = strtoupper($row['DISABLE_USER']) === 'Y' ? 'N' : 'Y';
            $sql = "UPDATE " . $this->table_name . " SET DISABLE_USER = ? WHERE UPPER(ID_USER) = UPPER(?)";
            return $this->db_oracle->query($sql, array($new_status, $id_user));
        }
        return false;
    }

    // ================= DELETE USER =================
    public function delete_user($id_user) {
        if (!$this->db_oracle) {
            return false;
        }
        $sql = "DELETE FROM " . $this->table_name . " WHERE UPPER(ID_USER) = UPPER(?)";
        return $this->db_oracle->query($sql, array($id_user));
    }

    // ================= UPDATE PROFILE MANDIRI =================
    public function get_user_by_id($id_user) {
        if (!$this->db_oracle) {
            if (strtolower($id_user) === 'polma') {
                return array(
                    'id_user' => 'polma',
                    'nama_user' => 'POLMA SIHOTANG (EMERGENSI)',
                    'level_user' => 'DEVELOPER'
                );
            }
            return null;
        }
        $query = $this->db_oracle->query("SELECT ID_USER, NAMA_USER, LEVEL_USER, DISABLE_USER FROM " . $this->table_name . " WHERE UPPER(ID_USER) = UPPER(?)", array($id_user));
        if ($query && $query->num_rows() > 0) {
            $row = $query->row_array();
            $normalized_user = array();
            foreach ($row as $key => $val) {
                $normalized_user[strtolower($key)] = $val;
            }
            return $normalized_user;
        }
        return null;
    }

    public function verify_old_password($id_user, $old_password) {
        if (!$this->db_oracle) {
            if (strtolower($id_user) === 'polma') {
                return true;
            }
            return false;
        }
        $query = $this->db_oracle->query("SELECT PASSWD FROM " . $this->table_name . " WHERE UPPER(ID_USER) = UPPER(?)", array($id_user));
        if ($query && $query->num_rows() > 0) {
            $row = $query->row_array();
            return md5($old_password) === $row['PASSWD'];
        }
        return false;
    }

    public function update_self_profile($id_user, $data) {
        $nama_user = $data['nama_user'];
        $passwd = isset($data['passwd']) && $data['passwd'] !== '' ? md5($data['passwd']) : null;

        if (!$this->db_oracle) {
            if (strtolower($id_user) === 'polma') {
                $this->session->set_userdata('nama_user', $nama_user);
                return true;
            }
            return false;
        }

        if ($passwd) {
            $sql = "UPDATE " . $this->table_name . " SET NAMA_USER = ?, PASSWD = ? WHERE UPPER(ID_USER) = UPPER(?)";
            $params = array($nama_user, $passwd, $id_user);
        } else {
            $sql = "UPDATE " . $this->table_name . " SET NAMA_USER = ? WHERE UPPER(ID_USER) = UPPER(?)";
            $params = array($nama_user, $id_user);
        }

        $result = $this->db_oracle->query($sql, $params);
        if ($result) {
            $this->session->set_userdata('nama_user', $nama_user);
        }
        return $result;
    }

    public function get_all_roles($is_postgres = false) {
        $result_data = array();
        $allowed_roles = array(
            'ADMINF1','ADMINF23','ADMINF456','ADMINPPJ','ADMIN_KAWASAN','ADMIN_NEDYSIS',
            'ADMIN_TAMPER','ADMIN_TMP','ADMIN_VALIDASI_UJL','BPANGSUR','CATERF23',
            'DIVAGA','DMAN','DMPEMASARAN_ROLE','GERAI','INFOLAP','LOKETF1','MANAGER',
            'P2TL','PENAGIHAN','SAP','SATKER','SECMAN','TEKNIKF1','WASKIT','ADMIN_FSO',
            'ADMIN_SAR','ASMAN','ADMIN_CMT','ADMIN_IMEI_CMT','ADMIN_MON_CMT','EDISON',
            'MANAGER_ROLE','MENU_TES','INFO_BDT'
        );
        $roles_str = "'" . implode("','", $allowed_roles) . "'";

        if ($is_postgres) {
            $db = $this->load->database('postgres', TRUE);
            $query = $db->query("SELECT id_group, nama_group FROM secman.grouptab WHERE id_group IN ($roles_str) ORDER BY id_group");
            $result_data = $query ? $query->result_array() : array();
        } else {
            if (!$this->db_oracle) {
                $dummy = array();
                foreach ($allowed_roles as $r) {
                    $dummy[] = array('id_group' => $r, 'nama_group' => str_replace('_', ' ', $r));
                }
                return $dummy;
            }
            $query = $this->db_oracle->query("SELECT ID_GROUP, NAMA_GROUP FROM SECMAN.GROUPTAB WHERE ID_GROUP IN ($roles_str) ORDER BY ID_GROUP");
            $result_data = $query ? $query->result_array() : array();
        }

        // Standardize all keys to lowercase
        $normalized = array();
        foreach ($result_data as $row) {
            $normalized[] = array_change_key_case($row, CASE_LOWER);
        }

        // Ensure all allowed roles are present (fallback if not in master)
        $existing_ids = array_map(function($item) {
            return strtoupper($item['id_group']);
        }, $normalized);

        foreach ($allowed_roles as $allowed_id) {
            if (!in_array(strtoupper($allowed_id), $existing_ids)) {
                $normalized[] = array(
                    'id_group' => $allowed_id,
                    'nama_group' => str_replace('_', ' ', $allowed_id)
                );
            }
        }

        // Sort by id_group
        usort($normalized, function($a, $b) {
            return strcmp($a['id_group'], $b['id_group']);
        });

        return $normalized;
    }
}
