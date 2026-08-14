<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

class Home extends CI_Controller {

    public function __construct()
    {
        parent::__construct();
        if (!$this->session->userdata('logged')) {
            redirect(site_url('auth'));
        }
    }

    public function index() {
        $data = array(
            'title' => 'Dashboard - NewKotainter',
            'nama_user' => $this->session->userdata('nama_user')
        );
        $this->load->view('vdashboard', $data);
    }
}
