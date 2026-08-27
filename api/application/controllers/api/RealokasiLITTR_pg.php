<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class RealokasiLITTR_pg extends MY_Controller {

    protected $protected = true; // Auth protected via session

    public function __construct() {
        parent::__construct();
        $this->load->model('mrealokasilittr');
    }

    public function get_data() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $noagenda = $this->input->get('noagenda');

        if (empty($noagenda)) {
            return $this->response(400, 'error', 'Parameter noagenda wajib diisi!');
        }

        $result = $this->mrealokasilittr->get_data_postgres($noagenda);
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
        $db_session = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';

        $params = array(
            'plogin' => $plogin,
            'db_session' => $db_session,
            'tiket' => isset($json_data['tiket']) ? trim($json_data['tiket']) : '',
            'noagenda' => isset($json_data['noagenda']) ? trim($json_data['noagenda']) : '',
            'new_id_littr' => isset($json_data['new_id_littr']) ? trim($json_data['new_id_littr']) : ''
        );

        if (empty($params['noagenda']) || empty($params['tiket']) || empty($params['new_id_littr'])) {
            return $this->response(400, 'error', 'No Agenda, No Tiket, dan ID LITTR Baru wajib diisi!');
        }

        $result = $this->mrealokasilittr->save_realokasi_postgres($params);
        if ($result['status'] === 'success') {
            return $this->response(200, 'success', $result['message']);
        } else {
            return $this->response(500, 'error', $result['message']);
        }
    }
}
