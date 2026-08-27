<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Mmenu extends CI_Model {

    private $db_oracle = null;
    private $table_name = 'OPHARAPP.DTKS_MENU';

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
                $this->table_name = 'OPHARAPP.DTKS_MENU';
            } else {
                $this->db_oracle = null;
            }
        } catch (Exception $e) {
            $this->db_oracle = null;
        }
        $this->db->db_debug = $db_debug_default;
    }

    public function get_all_menus() {
        if (!$this->db_oracle) {
            return array();
        }

        try {
            $query = $this->db_oracle->query("SELECT ID_MENU, PARENT_MENU, MENU_NAME, ORACLE, POSTGRE, AKTIVE, ROLE_MENU, TO_CHAR(CREATE_AT, 'YYYY-MM-DD HH24:MI:SS') as CREATE_AT FROM " . $this->table_name . " ORDER BY ID_MENU ASC");
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

        if ($id_menu !== null) {
            $check = $this->db_oracle->query("SELECT ID_MENU FROM " . $this->table_name . " WHERE ID_MENU = ?", array($id_menu));
            if ($check && $check->num_rows() > 0) {
                $sql = "UPDATE " . $this->table_name . " SET PARENT_MENU = ?, MENU_NAME = ?, ORACLE = ?, POSTGRE = ?, AKTIVE = ?, ROLE_MENU = ? WHERE ID_MENU = ?";
                return $this->db_oracle->query($sql, array($parent_menu, $menu_name, $oracle, $postgre, $aktive, $role_menu, $id_menu));
            }
        }

        $sql = "INSERT INTO " . $this->table_name . " (ID_MENU, PARENT_MENU, MENU_NAME, ORACLE, POSTGRE, AKTIVE, ROLE_MENU) 
                VALUES ((SELECT NVL(MAX(ID_MENU), 0) + 1 FROM " . $this->table_name . "), ?, ?, ?, ?, ?, ?)";
        return $this->db_oracle->query($sql, array($parent_menu, $menu_name, $oracle, $postgre, $aktive, $role_menu));
    }

    public function delete_menu($id_menu) {
        if (!$this->db_oracle) {
            return false;
        }
        $sql = "DELETE FROM " . $this->table_name . " WHERE ID_MENU = ?";
        return $this->db_oracle->query($sql, array(intval($id_menu)));
    }
}
