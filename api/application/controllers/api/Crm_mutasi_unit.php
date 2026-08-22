<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Crm_mutasi_unit extends MY_Controller {

    protected $protected = true; // Sesi harus aktif

    public function __construct() {
        parent::__construct();
        $this->load->model('mcrm');
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

    public function save_mutasi() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $json_data = json_decode($this->input->raw_input_stream, true);
        if (!is_array($json_data)) {
            return $this->response(400, 'error', 'Format payload JSON tidak valid.');
        }

        $identifier   = isset($json_data['identifier']) ? trim($json_data['identifier']) : '';
        $working_unit = isset($json_data['working_unit']) ? trim($json_data['working_unit']) : '';
        $no_tiket     = isset($json_data['no_tiket']) ? trim($json_data['no_tiket']) : '';

        if (empty($identifier) || empty($working_unit) || empty($no_tiket)) {
            return $this->response(400, 'error', 'Kolom Identifier, Unit Kerja Baru, dan Nomor Tiket wajib diisi!');
        }

        $id_user_session = $this->session->userdata('id_user') ? $this->session->userdata('id_user') : 'SYSTEM';

        $result = $this->mcrm->update_working_unit($identifier, $working_unit, $id_user_session, $no_tiket);
        if ($result['status'] === true) {
            return $this->response(200, 'success', $result['message']);
        } else {
            return $this->response(400, 'error', $result['message']);
        }
    }
}
