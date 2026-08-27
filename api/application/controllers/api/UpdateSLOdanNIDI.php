<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class UpdateSLOdanNIDI extends MY_Controller {

    protected $protected = true;

    public function __construct() {
        parent::__construct();
        $this->load->model('mupdateslodannidi');
    }

    public function get_data() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }
        return $this->response(200, 'success', 'GET method implemented.');
    }

    public function save() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }
        return $this->response(200, 'success', 'POST method implemented.');
    }
}
