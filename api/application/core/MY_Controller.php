<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class MY_Controller extends CI_Controller {

    // Default: Rute memerlukan login. Setel false pada controller yang bisa diakses publik (seperti Auth).
    protected $protected = true;

    public function __construct() {
        parent::__construct();

        // ================= CORS (Cross-Origin Resource Sharing) =================
        // Mengizinkan asal request (Origin) dinamis agar frontend bisa mengakses API
        if (isset($_SERVER['HTTP_ORIGIN'])) {
            header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        } else {
            header("Access-Control-Allow-Origin: *");
        }
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-DB-Region');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

        // Menangani preflight request OPTIONS
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        // ================= SESSION & AUTH GUARD =================
        $this->load->library('session');

        if ($this->protected === true) {
            if (!$this->session->userdata('logged')) {
                $this->response(401, 'error', 'Unauthorized. Silakan login terlebih dahulu.');
                exit;
            }
        }
    }

    /**
     * Membantu memformat dan mengirimkan respons JSON secara seragam
     */
    protected function response($code, $status, $message, $data = null) {
        $this->output
            ->set_status_header($code)
            ->set_content_type('application/json', 'utf-8')
            ->set_output(json_encode(array(
                'status'  => $status,
                'message' => $message,
                'data'    => $data
            )));
    }
}
