<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Home extends MY_Controller {

    // Status API dapat diakses secara publik
    protected $protected = false;

    public function __construct() {
        parent::__construct();
    }

    public function index() {
        return $this->response(200, 'success', 'NewKotainter Backend API is online.', array(
            'version' => '1.0.0',
            'php_version' => PHP_VERSION,
            'ci_version' => CI_VERSION
        ));
    }
}
