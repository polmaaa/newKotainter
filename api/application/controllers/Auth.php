<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Auth extends MY_Controller {

    // Login dan logout dapat diakses tanpa login
    protected $protected = false;

    public function __construct() {
        parent::__construct();
    }

    // ================= LOGIN =================
    public function login() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        // Mendukung request JSON payload atau Form POST standar
        $stream_clean = $this->security->xss_clean($this->input->raw_input_stream);
        $json_data = json_decode($stream_clean, true);

        $username = isset($json_data['username']) ? trim($json_data['username']) : trim($this->input->post('username'));
        $password = isset($json_data['password']) ? trim($json_data['password']) : trim($this->input->post('password'));

        if ($username === '' || $password === '') {
            return $this->response(400, 'error', 'Username dan password wajib diisi');
        }

        // Kredensial login statis default
        if ($username === 'admin' && $password === 'admin123') {
            $usersession = array(
                'logged'     => TRUE,
                'id_user'    => '1',
                'nama_user'  => 'POLMA SIHOTANG',
                'level_user' => '1',
                'loginstate' => 1
            );
            $this->session->set_userdata($usersession);

            return $this->response(200, 'success', 'Login berhasil', array(
                'id_user'    => '1',
                'nama_user'  => 'POLMA SIHOTANG',
                'level_user' => '1'
            ));
        } else {
            return $this->response(401, 'error', 'Username atau Password salah!');
        }
    }

    // ================= ME (Mengecek Sesi Aktif) =================
    public function me() {
        if (!$this->session->userdata('logged')) {
            return $this->response(401, 'error', 'Unauthenticated');
        }

        return $this->response(200, 'success', 'Authenticated', array(
            'id_user'    => $this->session->userdata('id_user'),
            'nama_user'  => $this->session->userdata('nama_user'),
            'level_user' => $this->session->userdata('level_user')
        ));
    }

    // ================= LOGOUT =================
    public function logout() {
        $this->session->sess_destroy();
        return $this->response(200, 'success', 'Logout berhasil');
    }
}
