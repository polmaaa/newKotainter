<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class InfoDataTabel extends MY_Controller {

    protected $protected = true; // Protected via session auth

    public function __construct() {
        parent::__construct();
        $this->load->model('mbackoffice');
    }

    public function get_data() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $idpel = $this->input->get('idpel');

        if (empty($idpel)) {
            return $this->response(400, 'error', 'Parameter IDPEL wajib diisi!');
        }

        $result = $this->mbackoffice->get_idpel_bermohon_oracle($idpel);
        if ($result['status'] === 'success') {
            return $this->response(200, 'success', 'Data berhasil ditemukan.', $result['data']);
        } else {
            return $this->response(400, 'error', $result['message']);
        }
    }
}
