<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Crm_update_role extends MY_Controller {

    protected $protected = true; // Sesi harus aktif

    public function __construct() {
        parent::__construct();
        $this->load->model('mcrm');
    }

    public function get_roles() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $result = $this->mcrm->get_all_crm_roles();
        if ($result['status'] === 'success') {
            return $this->response(200, 'success', 'Daftar role CRM berhasil dimuat.', $result['data']);
        } else {
            return $this->response(400, 'error', $result['message']);
        }
    }

    public function get_user() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $identifier = $this->input->get('identifier');
        if (empty($identifier)) {
            return $this->response(400, 'error', 'Identifier (User ID / Email) wajib diisi!');
        }

        $result = $this->mcrm->get_usercrm_details($identifier);
        if ($result['status'] === 'success') {
            return $this->response(200, 'success', 'Data user CRM ditemukan.', $result['data']);
        } else {
            return $this->response(404, 'error', $result['message']);
        }
    }

    public function save_role() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $json_data = json_decode($this->input->raw_input_stream, true);
        if (!is_array($json_data)) {
            return $this->response(400, 'error', 'Format payload JSON tidak valid.');
        }

        $identifier  = isset($json_data['identifier']) ? trim($json_data['identifier']) : '';
        $role_id     = isset($json_data['role_id']) ? trim($json_data['role_id']) : '';
        $no_tiket    = isset($json_data['no_tiket']) ? trim($json_data['no_tiket']) : '';

        if (empty($identifier) || empty($role_id) || empty($no_tiket)) {
            return $this->response(400, 'error', 'Kolom Identifier, Role ID Baru, dan Nomor Tiket wajib diisi!');
        }

        $id_user_session = $this->session->userdata('id_user') ? $this->session->userdata('id_user') : 'SYSTEM';

        $result = $this->mcrm->update_user_role_id($identifier, $role_id, $id_user_session, $no_tiket);
        if ($result['status'] === true) {
            return $this->response(200, 'success', $result['message']);
        } else {
            return $this->response(400, 'error', $result['message']);
        }
    }
}
