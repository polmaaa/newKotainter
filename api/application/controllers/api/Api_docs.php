<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Api_docs extends MY_Controller {

    // Matikan proteksi otomatis agar kita bisa merender HTML Error atau JSON Error secara spesifik
    protected $protected = false;

    public function __construct() {
        parent::__construct();
    }

    public function index() {
        // Cek login manual untuk rendering Swagger HTML
        if (!$this->session->userdata('logged')) {
            show_error('Unauthorized. Silakan login ke aplikasi NewKotainter terlebih dahulu sebelum mengakses dokumentasi API.', 401);
            return;
        }

        $spec_url = base_url('Api_docs/openapi');
        $this->load->view('swagger', array('spec_url' => $spec_url));
    }

    public function openapi() {
        // Cek login manual untuk kueri OpenAPI JSON
        if (!$this->session->userdata('logged')) {
            return $this->response(401, 'error', 'Unauthorized');
        }

        $spec_path = APPPATH . 'docs/openapi.json';
        if (!is_file($spec_path)) {
            return $this->response(404, 'error', 'File openapi.json tidak ditemukan di path: ' . realpath(APPPATH) . '/docs/openapi.json');
        }

        $spec = json_decode(file_get_contents($spec_path), true);
        
        // Sesuaikan target server API secara dinamis sesuai URL runtime
        $spec['servers'] = array(
            array(
                'url' => base_url(),
                'description' => 'Current Environment'
            )
        );

        $this->output
            ->set_content_type('application/json', 'utf-8')
            ->set_output(json_encode($spec, JSON_PRETTY_PRINT));
    }
}
