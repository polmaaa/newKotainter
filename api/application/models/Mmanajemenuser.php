<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Mmanajemenuser extends CI_Model {

    private $db_oracle = null;
    private $db_postgres = null;

    public function __construct() {
        parent::__construct();
        $this->init_databases();
    }

    private function _ping_host($host, $port, $timeout = 1) {
        if (empty($host) || empty($port)) return false;
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

    private function init_databases() {
        $db_debug_default = $this->db->db_debug;
        $this->db->db_debug = FALSE;

        $db_file = APPPATH . 'config/database.php';
        $oracle_host = '';
        $postgres_host = '';
        $postgres_port = 5432;

        if (file_exists($db_file)) {
            include($db_file);
            $oracle_host = isset($tnsname_oracle) ? $tnsname_oracle : '';
            if (isset($db['postgres'])) {
                $postgres_host = $db['postgres']['hostname'];
                $postgres_port = isset($db['postgres']['port']) ? $db['postgres']['port'] : 5432;
            }
        }

        // 1. Initialize Oracle connection safely
        if ($oracle_host && $this->_ping_host($oracle_host, 1521, 1)) {
            try {
                $this->db_oracle = @$this->load->database('oracle', TRUE);
                if (!$this->db_oracle || !$this->db_oracle->conn_id) {
                    $this->db_oracle = null;
                }
            } catch (Exception $e) {
                $this->db_oracle = null;
            }
        }

        // 2. Initialize PostgreSQL connection safely
        if ($postgres_host && $this->_ping_host($postgres_host, $postgres_port, 1)) {
            try {
                $this->db_postgres = @$this->load->database('postgres', TRUE);
                if (!$this->db_postgres || !$this->db_postgres->conn_id) {
                    $this->db_postgres = null;
                }
            } catch (Exception $e) {
                $this->db_postgres = null;
            }
        }

        $this->db->db_debug = $db_debug_default;
    }

    // ==========================================
    // ORACLE IMPLEMENTATIONS (Calling Package)
    // ==========================================

    public function get_info_user_oracle($id_user, $unitup) {
        if (!$this->db_oracle) {
            return array('status' => 'error', 'message' => 'Database Oracle offline.');
        }

        try {
            $conn = $this->db_oracle->conn_id;
            $sql = "BEGIN OPHARAPP.DTKS_MANAJEMEN_USER.proc_get_info_user(:in_id_user, :in_unitup, :out_data); END;";
            
            $stmt = oci_parse($conn, $sql);
            $cursor = oci_new_cursor($conn);
            
            // Set bindings (allow NULL values)
            $p_id_user = !empty($id_user) ? trim($id_user) : null;
            $p_unitup = !empty($unitup) ? trim($unitup) : null;
            
            oci_bind_by_name($stmt, ':in_id_user', $p_id_user);
            oci_bind_by_name($stmt, ':in_unitup', $p_unitup);
            oci_bind_by_name($stmt, ':out_data', $cursor, -1, OCI_B_CURSOR);
            
            $exec = @oci_execute($stmt);
            if (!$exec) {
                $err = oci_error($stmt);
                oci_free_statement($stmt);
                return array('status' => 'error', 'message' => 'Oracle Exec Error: ' . $err['message']);
            }
            
            @oci_execute($cursor);
            $data = array();
            while (($row = oci_fetch_array($cursor, OCI_ASSOC + OCI_RETURN_NULLS)) !== false) {
                // Standardize keys to lowercase for frontend consistency
                $row_lower = array_change_key_case($row, CASE_LOWER);
                $data[] = $row_lower;
            }
            
            oci_free_statement($cursor);
            oci_free_statement($stmt);
            
            $debug_msg = "[" . date('Y-m-d H:i:s') . "] Search User Oracle - ID: '$id_user' | Unitup: '$unitup' | Count: " . count($data) . "\n";
            @file_put_contents(APPPATH . 'logs/update_pnj_debug.log', $debug_msg, FILE_APPEND);

            if (count($data) > 0) {
                return array(
                    'status' => 'success',
                    'message' => 'Sukses',
                    'data' => $data
                );
            } else {
                return array('status' => 'error', 'message' => 'Maaf Data tidak Ditemukan');
            }
            
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function set_kode_unit_oracle($params) {
        if (!$this->db_oracle) {
            return array('status' => 'error', 'message' => 'Database Oracle offline.');
        }

        $log_file = APPPATH . 'logs/update_pnj_debug.log';
        $id_user = isset($params['id_user']) ? $params['id_user'] : '';
        @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Set Unit Oracle Init - User: '$id_user'\n", FILE_APPEND);

        try {
            $conn = $this->db_oracle->conn_id;
            $sql = "BEGIN 
                        OPHARAPP.DTKS_MANAJEMEN_USER.proc_set_kode_unit(
                            :in_id_user, :in_kode_unit, :in_leveluser, 
                            :in_user_login, :in_namafile, :out_message
                        ); 
                    END;";
            
            $stmt = oci_parse($conn, $sql);
            $msgerror = '';
            
            oci_bind_by_name($stmt, ':in_id_user', $params['id_user']);
            oci_bind_by_name($stmt, ':in_kode_unit', $params['kode_unit']);
            oci_bind_by_name($stmt, ':in_leveluser', $params['leveluser']);
            oci_bind_by_name($stmt, ':in_user_login', $params['user_login']);
            oci_bind_by_name($stmt, ':in_namafile', $params['nama_file']);
            oci_bind_by_name($stmt, ':out_message', $msgerror, 4000);
            
            $exec = @oci_execute($stmt);
            if (!$exec) {
                $err = oci_error($stmt);
                @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Set Unit Oracle Exec Error - User: '$id_user' | Error: " . $err['message'] . "\n", FILE_APPEND);
                return array('status' => 'error', 'message' => 'Oracle Exec Error: ' . $err['message']);
            }
            
            oci_free_statement($stmt);
            
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Set Unit Oracle - User: '$id_user' | MsgError: '$msgerror'\n", FILE_APPEND);
            
            if (trim(strtoupper($msgerror)) === 'SUKSES') {
                return array('status' => 'success', 'message' => 'Kode unit user berhasil diubah.');
            } else {
                return array('status' => 'error', 'message' => $msgerror);
            }
        } catch (Exception $e) {
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Set Unit Oracle Exception - User: '$id_user' | Msg: " . $e->getMessage() . "\n", FILE_APPEND);
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    // ==========================================
    // POSTGRES IMPLEMENTATIONS (PHP Engine Logic)
    // ==========================================

    public function get_info_user_postgres($id_user, $unitup) {
        if (!$this->db_postgres) {
            return array('status' => 'error', 'message' => 'Database PostgreSQL offline.');
        }

        try {
            $db = $this->db_postgres;
            $db->select("
                a.unitup AS kodeunit,
                a.id_user,
                a.nama_user,
                a.jabatan,
                a.alamat_user,
                a.leveluser,
                (SELECT string_agg(id_group, ',') FROM secman.usrgroup WHERE id_user = a.id_user) AS role,
                a.email1,
                a.no_telp1,
                a.disable_user,
                a.salahpassword,
                a.passwd,
                a.tglakhirijin
            ");
            $db->from('secman.usertab a');
            
            if (!empty($id_user) && !empty($unitup)) {
                $db->group_start()
                   ->where('a.id_user', trim($id_user))
                   ->or_where('a.unitup', trim($unitup))
                   ->group_end();
            } else if (!empty($id_user)) {
                $db->where('a.id_user', trim($id_user));
            } else if (!empty($unitup)) {
                $db->where('a.unitup', trim($unitup));
            } else {
                return array('status' => 'error', 'message' => 'Masukkan pencarian ID User atau Kode Unit!');
            }

            $db->order_by('a.unitup', 'ASC');

            $query = $db->get();
            if ($query && $query->num_rows() >= 1) {
                return array(
                    'status' => 'success',
                    'message' => 'Sukses',
                    'data' => $query->result_array()
                );
            } else {
                return array('status' => 'error', 'message' => 'Maaf Data tidak Ditemukan');
            }
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function set_kode_unit_postgres($params) {
        if (!$this->db_postgres) {
            return array('status' => 'error', 'message' => 'Database PostgreSQL offline.');
        }

        $log_file = APPPATH . 'logs/update_pnj_debug.log';
        $id_user = isset($params['id_user']) ? $params['id_user'] : '';
        @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Set Unit Postgres Init - User: '$id_user'\n", FILE_APPEND);

        $db = $this->db_postgres;

        try {
            $db->trans_begin();

            // 1. Check if user exists
            $db->where('id_user', $id_user);
            $count = $db->count_all_results('secman.usertab');
            if ($count === 0) {
                $db->trans_rollback();
                @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Set Unit Postgres Error - User: '$id_user' | User tidak ditemukan!\n", FILE_APPEND);
                return array('status' => 'error', 'message' => 'User tidak ditemukan');
            }

            // 2. Insert backup into opharapp.usertab_log
            $qUser = $db->get_where('secman.usertab', array('id_user' => $id_user));
            if ($qUser && $qUser->num_rows() > 0) {
                $rowUser = $qUser->row_array();
                $rowUser['tgllog'] = date('Y-m-d H:i:s');
                $rowUser['pk__unitup'] = $rowUser['unitup'];
                
                // Filter columns to match opharapp.usertab_log schema structure exactly
                $allowed_cols = array(
                    'tgllog', 'id_user', 'kdpp', 'unitup', 'pk__unitup', 'nama_user', 'alamat_user', 
                    'no_telp1', 'no_telp2', 'no_telp3', 'email1', 'email2', 'disable_user', 'is_builtin', 
                    'passwd', 'tglawalijin', 'tglakhirijin', 'jamawalijin', 'jamakhirijin', 'nip', 
                    'jenispp', 'leveluser', 'tglinsert', 'userinsert', 'tglupdate', 'userupdate', 
                    'tglubahpassword', 'masapassword', 'tglkadaluarsapasswd', 'flageula', 
                    'tglflageula', 'salahpassword', 'jabatan'
                );
                $rowUser = array_intersect_key($rowUser, array_flip($allowed_cols));
                
                $db->insert('opharapp.usertab_log', $rowUser);
                
                // Get variables from query result (need unitup and leveluser from $qUser row)
                $origRow = $qUser->row_array();
                $p_unitup = $origRow['unitup'];
                $p_leveluser = $origRow['leveluser'];
            } else {
                $db->trans_rollback();
                return array('status' => 'error', 'message' => 'Gagal membaca data user lama.');
            }

            // 3. Update active user table
            $db->where('id_user', $id_user);
            $db->update('secman.usertab', array(
                'unitup' => $params['kode_unit'],
                'leveluser' => $params['leveluser'],
                'tglupdate' => date('Y-m-d H:i:s'),
                'userupdate' => $params['user_login']
            ));

            // Helper to get active user roles in postgres (comma separated)
            $db->select("string_agg(id_group, ',') AS roles");
            $qRoles = $db->get_where('secman.usrgroup', array('id_user' => $id_user));
            $role_list = '';
            if ($qRoles && $qRoles->num_rows() > 0) {
                $rowRoles = $qRoles->row_array();
                $role_list = $rowRoles['roles'] ? $rowRoles['roles'] : '';
            }

            // 4. Insert into opharapp.log_update_user
            $db->insert('opharapp.log_update_user', array(
                'tanggal' => date('Y-m-d H:i:s'),
                'upi' => substr($p_unitup, 0, 2),
                'id_user' => $id_user,
                'nama_user' => $rowUser['nama_user'],
                'unitup_lama' => $p_unitup,
                'unitup_baru' => $params['kode_unit'],
                'leveluser_lama' => $p_leveluser,
                'leveluser_baru' => $params['leveluser'],
                'role_lama' => $role_list,
                'role_baru' => $role_list,
                'nama_file' => $params['nama_file'],
                'petugas' => $params['user_login']
            ));

            if ($db->trans_status() === FALSE) {
                $db->trans_rollback();
                @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Set Unit Postgres Error - trans_status is FALSE\n", FILE_APPEND);
                return array('status' => 'error', 'message' => 'Gagal mengubah kode unit di PostgreSQL.');
            } else {
                $db->trans_commit();
                @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Set Unit Postgres Success - User: '$id_user'\n", FILE_APPEND);
                
                // Write OPHARAPP.DTKS_LOG_PROSES on Oracle via reusable helper
                try {
                    $this->load->model('mlogs');
                    $this->mlogs->insert_dtks_log(
                        $params['nama_file'], 
                        'Ubah Kode Unit', 
                        'id_user: ' . $id_user, 
                        $params['kode_unit'], 
                        $params['user_login'],
                        'POSTGRE'
                    );
                } catch (Exception $log_ex) {
                    // Ignore logger failure
                }

                return array('status' => 'success', 'message' => 'Kode unit user berhasil diubah.');
            }

        } catch (Exception $e) {
            $db->trans_rollback();
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Set Unit Postgres Exception - User: '$id_user' | Msg: " . $e->getMessage() . "\n", FILE_APPEND);
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }
}
