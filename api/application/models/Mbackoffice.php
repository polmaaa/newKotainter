<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Mbackoffice extends CI_Model {

    private $db_oracle = null;

    public function __construct() {
        parent::__construct();
        $this->init_databases();
    }

    private function init_databases() {
        if ($this->db_oracle === null) {
            try {
                $this->db_oracle = $this->load->database('oracle', TRUE);
            } catch (Exception $e) {
                log_message('error', 'Mbackoffice Oracle connection failed: ' . $e->getMessage());
            }
        }
    }

    public function get_idpel_bermohon_oracle($idpel) {
        $this->init_databases();
        if (!$this->db_oracle) {
            return array('status' => 'error', 'message' => 'Database Oracle offline.');
        }

        try {
            $sql = "SELECT IDPEL, NOAGENDA, JENIS_TRANSAKSI, JML FROM opharapp.vw_idpel_bermohon WHERE IDPEL = ?";
            $query = $this->db_oracle->query($sql, array($idpel));
            if ($query) {
                $result = $query->result_array();
                $normalized = array();
                foreach ($result as $row) {
                    $normalized[] = array_change_key_case($row, CASE_LOWER);
                }
                return array('status' => 'success', 'data' => $normalized);
            } else {
                return array('status' => 'error', 'message' => 'Gagal mengeksekusi query di Oracle.');
            }
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function get_idpel_bermohon_postgres($idpel) {
        try {
            $db = $this->load->database('postgres', TRUE);
            $sql = "SELECT idpel, noagenda, jenis_transaksi, jml FROM opharapp.vw_idpel_bermohon WHERE idpel = ?";
            $query = $db->query($sql, array($idpel));
            if ($query) {
                $result = $query->result_array();
                $normalized = array();
                foreach ($result as $row) {
                    $normalized[] = array_change_key_case($row, CASE_LOWER);
                }
                return array('status' => 'success', 'data' => $normalized);
            } else {
                return array('status' => 'error', 'message' => 'Gagal mengeksekusi query di PostgreSQL.');
            }
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }
}
