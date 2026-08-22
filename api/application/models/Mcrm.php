<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Mcrm extends CI_Model {

    private $db_crm = null;

    public function __construct() {
        parent::__construct();
        $this->load->model('mlogs');
        $this->init_database();
    }

    private function init_database() {
        if ($this->db_crm === null) {
            try {
                $this->db_crm = $this->load->database('postgres_crm', TRUE);
            } catch (Exception $e) {
                log_message('error', 'Mcrm: Gagal koneksi ke postgres_crm: ' . $e->getMessage());
            }
        }
    }

    public function get_usercrm_details($identifier) {
        $this->init_database();
        if (!$this->db_crm || !$this->db_crm->conn_id) {
            return array('status' => 'not_found', 'message' => 'Koneksi ke database CRM Offline.');
        }

        $this->db_crm->select('*');
        $this->db_crm->from('crm_user');
        $this->db_crm->group_start();
        $this->db_crm->where('user_id', $identifier);
        $this->db_crm->or_where('user_id_ap2t', $identifier);
        $this->db_crm->or_where('email', $identifier);
        $this->db_crm->group_end();

        $query = $this->db_crm->get();
        if ($query && $query->num_rows() > 0) {
            $row = array_change_key_case($query->row_array(), CASE_LOWER);
            return array('status' => 'success', 'data' => $row);
        } else {
            return array('status' => 'not_found', 'message' => 'Data user CRM tidak ditemukan.');
        }
    }

    public function get_all_crm_roles() {
        $this->init_database();
        if (!$this->db_crm || !$this->db_crm->conn_id) {
            return array('status' => 'error', 'message' => 'Koneksi ke database CRM Offline.');
        }

        $this->db_crm->select('id, name, description');
        $this->db_crm->from('crm_user_role');
        $this->db_crm->where('status', 'ACTIVE');
        $this->db_crm->order_by('name', 'ASC');

        $query = $this->db_crm->get();
        if ($query) {
            $result = $query->result_array();
            $normalized = array();
            foreach ($result as $row) {
                $normalized[] = array_change_key_case($row, CASE_LOWER);
            }
            return array('status' => 'success', 'data' => $normalized);
        } else {
            return array('status' => 'error', 'message' => 'Gagal mengambil data role CRM.');
        }
    }

    public function update_working_unit($identifier, $new_working_unit, $id_user_session, $no_tiket) {
        $this->init_database();
        if (!$this->db_crm || !$this->db_crm->conn_id) {
            return array('status' => false, 'message' => 'Koneksi ke database CRM Offline.');
        }

        $result = $this->get_usercrm_details($identifier);
        if ($result['status'] !== 'success') {
            return array('status' => false, 'message' => $result['message']);
        }

        $user_data_lama = $result['data'];

        $this->db_crm->trans_start();

        // Update working_unit
        $this->db_crm->group_start();
        $this->db_crm->where('user_id', $identifier);
        $this->db_crm->or_where('user_id_ap2t', $identifier);
        $this->db_crm->or_where('email', $identifier);
        $this->db_crm->group_end();
        $this->db_crm->update('crm_user', array('working_unit' => $new_working_unit));

        // Insert into log backup
        $log_data = $user_data_lama;
        $log_data['logby'] = 'NOTIKET: ' . $no_tiket;
        $this->db_crm->set('tgllog', 'NOW()', FALSE);
        $this->db_crm->insert('crm_user_log', $log_data);

        $this->db_crm->trans_complete();

        if ($this->db_crm->trans_status() === FALSE) {
            return array('status' => false, 'message' => 'Gagal memperbarui working unit di database PostgreSQL CRM.');
        }

        // Log to Oracle
        $log_oracle = $this->mlogs->insert_dtks_log($no_tiket, 'UPDATE CRM WORKING UNIT', $user_data_lama['user_id'], null, $id_user_session, 'POSTGRE');

        return array('status' => true, 'message' => 'Working unit user CRM berhasil diperbarui.');
    }

    public function update_user_role_id($identifier, $new_role_id, $id_user_session, $no_tiket) {
        $this->init_database();
        if (!$this->db_crm || !$this->db_crm->conn_id) {
            return array('status' => false, 'message' => 'Koneksi ke database CRM Offline.');
        }

        $result = $this->get_usercrm_details($identifier);
        if ($result['status'] !== 'success') {
            return array('status' => false, 'message' => $result['message']);
        }

        $user_data_lama = $result['data'];

        $this->db_crm->trans_start();

        // Update role_id
        $this->db_crm->group_start();
        $this->db_crm->where('user_id', $identifier);
        $this->db_crm->or_where('user_id_ap2t', $identifier);
        $this->db_crm->or_where('email', $identifier);
        $this->db_crm->group_end();
        $this->db_crm->update('crm_user', array('role_id' => $new_role_id));

        // Insert into log backup
        $log_data = $user_data_lama;
        $log_data['logby'] = 'NOTIKET: ' . $no_tiket;
        $this->db_crm->set('tgllog', 'NOW()', FALSE);
        $this->db_crm->insert('crm_user_log', $log_data);

        $this->db_crm->trans_complete();

        if ($this->db_crm->trans_status() === FALSE) {
            return array('status' => false, 'message' => 'Gagal memperbarui role_id di database PostgreSQL CRM.');
        }

        // Log to Oracle
        $log_oracle = $this->mlogs->insert_dtks_log($no_tiket, 'UPDATE ROLE USER CRM', $user_data_lama['user_id'], null, $id_user_session, 'POSTGRE');

        return array('status' => true, 'message' => 'Role user CRM berhasil diperbarui.');
    }
}
