<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Menu_config extends MY_Controller {

    protected $protected = true;

    public function __construct() {
        parent::__construct();
        $this->load->model('mmenu');
    }

    private function _check_admin() {
        $level = strtoupper($this->session->userdata('level_user'));
        if ($level !== 'DEVELOPER' && $level !== 'SUPERUSER') {
            $this->response(403, 'error', 'Forbidden: Anda tidak memiliki akses untuk operasi ini.');
            exit;
        }
    }

    public function get_menus() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }
        $menus = $this->mmenu->get_all_menus();
        return $this->response(200, 'success', 'Berhasil memuat list menu.', $menus);
    }

    public function save_menu() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }
        $this->_check_admin();

        $json_data = json_decode($this->input->raw_input_stream, true);

        $id_menu     = isset($json_data['id_menu']) && $json_data['id_menu'] !== '' && $json_data['id_menu'] !== null ? intval($json_data['id_menu']) : null;
        $parent_menu = isset($json_data['parent_menu']) ? trim($json_data['parent_menu']) : null;
        $menu_name   = isset($json_data['menu_name']) ? trim($json_data['menu_name']) : '';
        $oracle      = isset($json_data['oracle']) ? trim($json_data['oracle']) : null;
        $postgre     = isset($json_data['postgre']) ? trim($json_data['postgre']) : null;
        $aktive      = isset($json_data['aktive']) ? trim($json_data['aktive']) : 'Y';
        $role_menu   = isset($json_data['role_menu']) ? trim($json_data['role_menu']) : '';

        if (empty($menu_name)) {
            return $this->response(400, 'error', 'Nama Menu wajib diisi!');
        }

        $data = array(
            'id_menu'     => $id_menu,
            'parent_menu' => $parent_menu,
            'menu_name'   => $menu_name,
            'oracle'      => $oracle,
            'postgre'     => $postgre,
            'aktive'      => $aktive,
            'role_menu'   => $role_menu
        );

        $success = $this->mmenu->save_menu($data);
        if ($success) {
            return $this->response(200, 'success', 'Menu berhasil disimpan!');
        } else {
            $db_error = $this->db->error();
            $err_msg = isset($db_error['message']) && !empty($db_error['message']) 
                ? 'Oracle Error: ' . $db_error['message'] 
                : 'Gagal menyimpan menu ke database. Pastikan tabel DTKS.DTKS_MENU ada dan memiliki kolom PARENT_MENU bertipe VARCHAR2.';
            return $this->response(500, 'error', $err_msg);
        }
    }

    public function delete_menu() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }
        $this->_check_admin();

        $json_data = json_decode($this->input->raw_input_stream, true);
        $id_menu = isset($json_data['id_menu']) ? trim($json_data['id_menu']) : '';

        if (empty($id_menu)) {
            return $this->response(400, 'error', 'ID Menu tidak valid.');
        }

        if ($id_menu === 'dashboard' || $id_menu === 'setting' || $id_menu === 'setting_menu') {
            return $this->response(400, 'error', 'Menu sistem utama tidak boleh dihapus!');
        }

        $success = $this->mmenu->delete_menu($id_menu);
        if ($success) {
            return $this->response(200, 'success', 'Menu berhasil dihapus!');
        } else {
            $db_error = $this->db->error();
            $err_msg = isset($db_error['message']) && !empty($db_error['message']) 
                ? 'Oracle Error: ' . $db_error['message'] 
                : 'Gagal menghapus menu.';
            return $this->response(500, 'error', $err_msg);
        }
    }
}
