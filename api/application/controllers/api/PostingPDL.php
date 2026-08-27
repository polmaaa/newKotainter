<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class PostingPDL extends MY_Controller {

    protected $protected = true; // Auth protected via session

    public function __construct() {
        parent::__construct();
        $this->load->model('mpdl');
    }

    public function get_data() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $idpel = $this->input->get('idpel');
        $tiket = $this->input->get('tiket') ? $this->input->get('tiket') : 'SEARCH';

        if (empty($idpel)) {
            return $this->response(400, 'error', 'Parameter idpel wajib diisi!');
        }

        $result = $this->mpdl->get_pdl_oracle($idpel, $tiket);
        if ($result['status'] === 'success') {
            return $this->response(200, 'success', $result['message'], $result['data']);
        } else {
            return $this->response(400, 'error', $result['message']);
        }
    }

    public function get_detail() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $noagenda = $this->input->get('noagenda');
        $idpel = $this->input->get('idpel');

        if (empty($idpel)) {
            return $this->response(400, 'error', 'Parameter idpel wajib diisi!');
        }

        $result = $this->mpdl->get_pdl_detail_oracle($noagenda, $idpel);
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
            'idpel' => isset($json_data['idpel']) ? trim($json_data['idpel']) : '',
            'p_noagenda' => isset($json_data['p_noagenda']) ? trim($json_data['p_noagenda']) : '',
            'postingPDLBaru' => isset($json_data['postingPDLBaru']) ? trim($json_data['postingPDLBaru']) : '',
            'THBLangS1ABaru' => isset($json_data['THBLangS1ABaru']) ? trim($json_data['THBLangS1ABaru']) : '',
            'PNJBaru' => isset($json_data['PNJBaru']) ? trim($json_data['PNJBaru']) : '',
            'namaPNJBaru' => isset($json_data['namaPNJBaru']) ? trim($json_data['namaPNJBaru']) : '',
            'KDPROVBaru' => isset($json_data['KDPROVBaru']) ? trim($json_data['KDPROVBaru']) : '',
            'KDKABBaru' => isset($json_data['KDKABBaru']) ? trim($json_data['KDKABBaru']) : '',
            'KDKECBaru' => isset($json_data['KDKECBaru']) ? trim($json_data['KDKECBaru']) : '',
            'KDKELBaru' => isset($json_data['KDKELBaru']) ? trim($json_data['KDKELBaru']) : '',
            'PEMDABaru' => isset($json_data['PEMDABaru']) ? trim($json_data['PEMDABaru']) : '',
            'noBangBaru' => isset($json_data['noBangBaru']) ? trim($json_data['noBangBaru']) : '',
            'ketNoBangBaru' => isset($json_data['ketNoBangBaru']) ? trim($json_data['ketNoBangBaru']) : '',
            'thblmut' => isset($json_data['thblmut']) ? trim($json_data['thblmut']) : '',
            'unitUpiBaru' => isset($json_data['unitUpiBaru']) ? trim($json_data['unitUpiBaru']) : '',
            'unitApBaru' => isset($json_data['unitApBaru']) ? trim($json_data['unitApBaru']) : '',
            'unitUpBaru' => isset($json_data['unitUpBaru']) ? trim($json_data['unitUpBaru']) : '',
            'NopostingPDLBaru' => isset($json_data['NopostingPDLBaru']) ? trim($json_data['NopostingPDLBaru']) : ''
        );

        if (empty($params['idpel']) || empty($params['tiket']) || empty($params['NopostingPDLBaru'])) {
            return $this->response(400, 'error', 'ID Pel, No Tiket, dan No PDL wajib diisi!');
        }

        $result = $this->mpdl->save_pdl_oracle($params);
        if ($result['status'] === 'success') {
            return $this->response(200, 'success', $result['message']);
        } else {
            return $this->response(500, 'error', $result['message']);
        }
    }
}
