<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Auth extends MY_Controller {

    // Login dan logout dapat diakses tanpa login
    protected $protected = false;

    public function __construct() {
        parent::__construct();
        $this->load->model('muser');
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

        // Jalankan kueri autentikasi ke database (atau fallback) melalui model Muser
        $auth_result = $this->muser->login($username, $password);

        if ($auth_result['status'] === 'success') {
            $user_data = $auth_result['data'];
            
            $usersession = array(
                'logged'     => TRUE,
                'id_user'    => $user_data['id_user'],
                'nama_user'  => $user_data['nama_user'],
                'level_user' => $user_data['level_user'],
                'loginstate' => 1
            );
            $this->session->set_userdata($usersession);

            return $this->response(200, 'success', 'Login berhasil', array(
                'id_user'    => $user_data['id_user'],
                'nama_user'  => $user_data['nama_user'],
                'level_user' => $user_data['level_user']
            ));
        } else {
            return $this->response(401, 'error', $auth_result['message']);
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
