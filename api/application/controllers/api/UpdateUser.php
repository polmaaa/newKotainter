<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class UpdateUser extends MY_Controller {

    protected $protected = true; // Protected via session auth

    public function __construct() {
        parent::__construct();
        $this->load->model('mmanajemenuser');
    }

    public function get_data() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $id_user = $this->input->get('id_user');
        $unitup = $this->input->get('unitup');

        if (empty($id_user) && empty($unitup)) {
            return $this->response(400, 'error', 'Masukkan parameter pencarian ID User atau Kode Unit!');
        }

        $result = $this->mmanajemenuser->get_info_user_oracle($id_user, $unitup);
        if ($result['status'] === 'success') {
            return $this->response(200, 'success', $result['message'], $result['data']);
        } else {
            return $this->response(400, 'error', $result['message']);
        }
    }

    public function save() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $json_data = json_decode($this->input->raw_input_stream, true);
        if (empty($json_data)) {
            return $this->response(400, 'error', 'Format data tidak valid.');
        }

        $user_login = $this->session->userdata('id_user') ? $this->session->userdata('id_user') : 'SYSTEM';
        $params = array(
            'id_user' => isset($json_data['id_user']) ? trim($json_data['id_user']) : '',
            'kode_unit' => isset($json_data['kode_unit']) ? trim($json_data['kode_unit']) : '',
            'leveluser' => isset($json_data['leveluser']) ? trim($json_data['leveluser']) : '',
            'nama_file' => isset($json_data['nama_file']) ? trim($json_data['nama_file']) : '',
            'user_login' => $user_login
        );

        if (empty($params['id_user']) || empty($params['kode_unit']) || empty($params['leveluser'])) {
            return $this->response(400, 'error', 'ID User, Kode Unit Baru, dan Level User wajib diisi!');
        }

        $result = $this->mmanajemenuser->set_kode_unit_oracle($params);
        if ($result['status'] === 'success') {
            return $this->response(200, 'success', $result['message']);
        } else {
            return $this->response(500, 'error', $result['message']);
        }
    }
}
