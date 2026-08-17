<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class UpdatePnj extends MY_Controller {

    protected $protected = true; // Auth protected via session

    public function __construct() {
        parent::__construct();
        $this->load->model('mpnj');
    }

    public function get_data() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $noagenda = $this->input->get('noagenda');
        $tiket = $this->input->get('tiket');

        if (empty($noagenda) || empty($tiket)) {
            return $this->response(400, 'error', 'Parameter noagenda dan tiket wajib diisi!');
        }

        $result = $this->mpnj->get_data_pnj_oracle($noagenda, $tiket);
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

        $plogin = $this->session->userdata('id_user') ? $this->session->userdata('id_user') : 'SYSTEM';
        $params = array(
            'plogin' => $plogin,
            'tiket' => isset($json_data['tiket']) ? trim($json_data['tiket']) : '',
            'noagenda' => isset($json_data['noagenda']) ? trim($json_data['noagenda']) : '',
            'pnj_101' => isset($json_data['pnj_101']) ? trim($json_data['pnj_101']) : '',
            'pnj_pemohon' => isset($json_data['pnj_pemohon']) ? trim($json_data['pnj_pemohon']) : '',
            'pnj_106' => isset($json_data['pnj_106']) ? trim($json_data['pnj_106']) : '',
            'nobang_101' => isset($json_data['nobang_101']) ? trim($json_data['nobang_101']) : '',
            'nobang_pemohon' => isset($json_data['nobang_pemohon']) ? trim($json_data['nobang_pemohon']) : '',
            'nobang_106' => isset($json_data['nobang_106']) ? trim($json_data['nobang_106']) : '',
            'ketnobang_101' => isset($json_data['ketnobang_101']) ? trim($json_data['ketnobang_101']) : '',
            'ketnobang_pemohon' => isset($json_data['ketnobang_pemohon']) ? trim($json_data['ketnobang_pemohon']) : '',
            'ketnobang_106' => isset($json_data['ketnobang_106']) ? trim($json_data['ketnobang_106']) : ''
        );

        if (empty($params['noagenda']) || empty($params['tiket'])) {
            return $this->response(400, 'error', 'No Agenda dan No Tiket wajib diisi!');
        }

        $result = $this->mpnj->save_pnj_oracle($params);
        if ($result['status'] === 'success') {
            return $this->response(200, 'success', $result['message']);
        } else {
            return $this->response(500, 'error', $result['message']);
        }
    }

    public function save_koreksi() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $json_data = json_decode($this->input->raw_input_stream, true);
        if (empty($json_data)) {
            return $this->response(400, 'error', 'Format data tidak valid.');
        }

        $plogin = $this->session->userdata('id_user') ? $this->session->userdata('id_user') : 'SYSTEM';
        $params = array(
            'plogin' => $plogin,
            'tiket' => isset($json_data['tiket']) ? trim($json_data['tiket']) : '',
            'noagenda' => isset($json_data['noagenda']) ? trim($json_data['noagenda']) : ''
        );

        if (empty($params['noagenda']) || empty($params['tiket'])) {
            return $this->response(400, 'error', 'No Agenda dan No Tiket wajib diisi!');
        }

        $result = $this->mpnj->save_koreksi_tarif_oracle($params);
        if ($result['status'] === 'success') {
            return $this->response(200, 'success', $result['message']);
        } else {
            return $this->response(500, 'error', $result['message']);
        }
    }
}
