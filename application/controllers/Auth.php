<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

class Auth extends CI_Controller {

    public function __construct()
    {
        parent::__construct();
    }

    public function index($error = NULL) {
        if ($this->session->userdata('logged')) {
            redirect(site_url('home'));
        }
        $data = array(
            'title' => 'Login Page - NewKotainter',
            'action' => site_url('auth/login'),
            'error' => $error
        );
        $this->load->view('vlogin', $data);
    }

    public function login() {
        $username = $this->input->post('username');
        $password = $this->input->post('password');

        if ($username === 'admin' && $password === 'admin123') {
            $usersession = array(
                'logged' => TRUE,
                'id_user' => '1',
                'nama_user' => 'POLMA SIHOTANG',
                'level_user' => '1',
                'loginstate' => 1
            );
            $this->session->set_userdata($usersession);
            redirect(site_url('home'));
        } else {
            $error = 'Username atau Password salah!';
            $this->index($error);
        }
    }

    public function logout() {
        $this->session->sess_destroy();
        redirect(site_url('auth'));
    }
}
