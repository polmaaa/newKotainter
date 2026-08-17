<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Mmenu extends CI_Model {

    private $db_oracle = null;
    private $table_name = 'DTKS.DTKS_MENU';

    public function __construct() {
        parent::__construct();
        $this->init_db();
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

    private function init_db() {
        $db_debug_default = $this->db->db_debug;
        $this->db->db_debug = FALSE;

        $db_file = APPPATH . 'config/database.php';
        $oracle_host = '';
        if (file_exists($db_file)) {
            include($db_file);
            $oracle_host = isset($tnsname_oracle) ? $tnsname_oracle : '';
        }

        if (!$this->_ping_host($oracle_host, 1521, 1)) {
            $this->db_oracle = null;
            $this->db->db_debug = $db_debug_default;
            return;
        }

        try {
            $this->db_oracle = @$this->load->database('oracle', TRUE);
            if ($this->db_oracle && $this->db_oracle->conn_id) {
                // Check if DTKS.DTKS_MENU table is accessible (at least for SELECT)
                $table_check = @$this->db_oracle->query("SELECT 1 FROM DTKS.DTKS_MENU WHERE ROWNUM = 1");
                if ($table_check) {
                    $this->table_name = 'DTKS.DTKS_MENU';
                } else {
                    // Try local schema fallback
                    $table_own_check = @$this->db_oracle->query("SELECT 1 FROM DTKS_MENU WHERE ROWNUM = 1");
                    if ($table_own_check) {
                        $this->table_name = 'DTKS_MENU';
                    } else {
                        $this->table_name = 'DTKS_MENU';
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

    private function _create_local_table_if_not_exists() {
        if (!$this->db_oracle) return;
        $check = @$this->db_oracle->query("SELECT 1 FROM DTKS_MENU WHERE ROWNUM = 1");
        if (!$check) {
            $sql = "CREATE TABLE DTKS_MENU (
                ID_MENU NUMBER NOT NULL,
                PARENT_MENU VARCHAR2(100),
                MENU_NAME VARCHAR2(100) NOT NULL,
                ORACLE VARCHAR2(255),
                POSTGRE VARCHAR2(255),
                AKTIVE CHAR(1) DEFAULT 'Y' NOT NULL,
                ROLE_MENU VARCHAR2(255),
                CREATE_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
                CONSTRAINT PK_LOCAL_DTKS_MENU PRIMARY KEY (ID_MENU),
                CONSTRAINT CHK_LOCAL_MENU_AKTIVE CHECK (AKTIVE IN ('Y', 'N'))
            )";
            @$this->db_oracle->query($sql);
        }
    }

    private function _execute_save($table, $id_menu, $parent_menu, $menu_name, $oracle, $postgre, $aktive, $role_menu) {
        if ($id_menu !== null) {
            $check = $this->db_oracle->query("SELECT ID_MENU FROM " . $table . " WHERE ID_MENU = ?", array($id_menu));
            if ($check && $check->num_rows() > 0) {
                $sql = "UPDATE " . $table . " SET PARENT_MENU = ?, MENU_NAME = ?, ORACLE = ?, POSTGRE = ?, AKTIVE = ?, ROLE_MENU = ? WHERE ID_MENU = ?";
                return @$this->db_oracle->query($sql, array($parent_menu, $menu_name, $oracle, $postgre, $aktive, $role_menu, $id_menu));
            }
        }

        $sql = "INSERT INTO " . $table . " (ID_MENU, PARENT_MENU, MENU_NAME, ORACLE, POSTGRE, AKTIVE, ROLE_MENU) 
                VALUES ((SELECT NVL(MAX(ID_MENU), 0) + 1 FROM " . $table . "), ?, ?, ?, ?, ?, ?)";
        return @$this->db_oracle->query($sql, array($parent_menu, $menu_name, $oracle, $postgre, $aktive, $role_menu));
    }

    public function get_all_menus() {
        if (!$this->db_oracle) {
            // Simulated default menu list if offline
            return array(
                array('id_menu' => 1, 'parent_menu' => 'PELAYANAN PELANGGAN', 'menu_name' => 'Insert Data BLTHMUT', 'oracle' => 'InsertDataBLTHMUT', 'postgre' => 'InsertDataBLTHMUT_pg', 'aktive' => 'Y', 'role_menu' => 'DEVELOPER,SUPERUSER')
            );
        }

        try {
            // First check if cached table_name works
            $query = @$this->db_oracle->query("SELECT ID_MENU, PARENT_MENU, MENU_NAME, ORACLE, POSTGRE, AKTIVE, ROLE_MENU, TO_CHAR(CREATE_AT, 'YYYY-MM-DD HH24:MI:SS') as CREATE_AT FROM " . $this->table_name . " ORDER BY CREATE_AT ASC");
            
            // If failed and table name was DTKS.DTKS_MENU, try local DTKS_MENU fallback
            if (!$query && $this->table_name === 'DTKS.DTKS_MENU') {
                $this->table_name = 'DTKS_MENU';
                $query = @$this->db_oracle->query("SELECT ID_MENU, PARENT_MENU, MENU_NAME, ORACLE, POSTGRE, AKTIVE, ROLE_MENU, TO_CHAR(CREATE_AT, 'YYYY-MM-DD HH24:MI:SS') as CREATE_AT FROM DTKS_MENU ORDER BY CREATE_AT ASC");
            }

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

    public function save_menu($data) {
        if (!$this->db_oracle) {
            return false;
        }

        $id_menu     = !empty($data['id_menu']) ? intval($data['id_menu']) : null;
        $parent_menu = !empty($data['parent_menu']) ? $data['parent_menu'] : null;
        $menu_name   = $data['menu_name'];
        $oracle      = !empty($data['oracle']) ? $data['oracle'] : null;
        $postgre     = !empty($data['postgre']) ? $data['postgre'] : null;
        $aktive      = !empty($data['aktive']) ? $data['aktive'] : 'Y';
        $role_menu   = !empty($data['role_menu']) ? $data['role_menu'] : 'DEVELOPER';

        $db_debug_default = $this->db_oracle->db_debug;
        $this->db_oracle->db_debug = FALSE;

        // Try writing to primary table
        $success = $this->_execute_save($this->table_name, $id_menu, $parent_menu, $menu_name, $oracle, $postgre, $aktive, $role_menu);

        // If failed due to write permissions (e.g. ORA-01031) or missing table, fallback to local table
        if (!$success && $this->table_name === 'DTKS.DTKS_MENU') {
            $this->_create_local_table_if_not_exists();
            $success = $this->_execute_save('DTKS_MENU', $id_menu, $parent_menu, $menu_name, $oracle, $postgre, $aktive, $role_menu);
            if ($success) {
                $this->table_name = 'DTKS_MENU'; // Fallback cached
            }
        }

        $this->db_oracle->db_debug = $db_debug_default;
        return $success;
    }

    public function delete_menu($id_menu) {
        if (!$this->db_oracle) {
            return false;
        }

        $db_debug_default = $this->db_oracle->db_debug;
        $this->db_oracle->db_debug = FALSE;

        $sql = "DELETE FROM " . $this->table_name . " WHERE ID_MENU = ?";
        $success = @$this->db_oracle->query($sql, array(intval($id_menu)));

        if (!$success && $this->table_name === 'DTKS.DTKS_MENU') {
            $this->table_name = 'DTKS_MENU';
            $sql = "DELETE FROM DTKS_MENU WHERE ID_MENU = ?";
            $success = @$this->db_oracle->query($sql, array(intval($id_menu)));
        }

        $this->db_oracle->db_debug = $db_debug_default;
        return $success;
    }
}
