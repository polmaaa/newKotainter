<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Users extends MY_Controller {

    protected $protected = true; // Hanya user yang login

    public function __construct() {
        parent::__construct();
        $this->load->model('muser');
    }

    // Check if the current user is developer or superuser
    private function _check_admin() {
        $level = strtoupper($this->session->userdata('level_user'));
        if ($level !== 'DEVELOPER' && $level !== 'SUPERUSER') {
            $this->response(403, 'error', 'Forbidden: Anda tidak memiliki akses untuk operasi ini.');
            exit;
        }
    }

    // ================= GET USERS =================
    public function get_users() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }
        $this->_check_admin();

        $users = $this->muser->get_all_users();
        return $this->response(200, 'success', 'Berhasil memuat list user.', $users);
    }

    // ================= SAVE USER (Create / Update) =================
    public function save_user() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }
        $this->_check_admin();

        $stream_clean = $this->security->xss_clean($this->input->raw_input_stream);
        $json_data = json_decode($stream_clean, true);

        $id_user    = isset($json_data['id_user']) ? trim($json_data['id_user']) : '';
        $nama_user  = isset($json_data['nama_user']) ? trim($json_data['nama_user']) : '';
        $level_user = isset($json_data['level_user']) ? trim($json_data['level_user']) : '';
        $passwd     = isset($json_data['passwd']) ? trim($json_data['passwd']) : '';
        $disable    = isset($json_data['disable_user']) ? trim($json_data['disable_user']) : 'N';

        if (empty($id_user) || empty($nama_user) || empty($level_user)) {
            return $this->response(400, 'error', 'ID User, Nama User, dan Level User wajib diisi!');
        }

        $data = array(
            'id_user'      => $id_user,
            'nama_user'    => $nama_user,
            'level_user'   => strtoupper($level_user),
            'passwd'       => $passwd,
            'disable_user' => $disable
        );

        $success = $this->muser->save_user($data);
        if ($success) {
            return $this->response(200, 'success', 'User berhasil disimpan!');
        } else {
            return $this->response(500, 'error', 'Gagal menyimpan user ke database. Pastikan koneksi database aktif.');
        }
    }

    // ================= TOGGLE STATUS =================
    public function toggle_status() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }
        $this->_check_admin();

        $stream_clean = $this->security->xss_clean($this->input->raw_input_stream);
        $json_data = json_decode($stream_clean, true);
        $id_user = isset($json_data['id_user']) ? trim($json_data['id_user']) : '';

        if (empty($id_user)) {
            return $this->response(400, 'error', 'ID User tidak valid.');
        }

        if (strtoupper($id_user) === strtoupper($this->session->userdata('id_user'))) {
            return $this->response(400, 'error', 'Anda tidak bisa menonaktifkan akun Anda sendiri!');
        }

        $success = $this->muser->toggle_status($id_user);
        if ($success) {
            return $this->response(200, 'success', 'Status user berhasil diperbarui!');
        } else {
            return $this->response(500, 'error', 'Gagal mengubah status user.');
        }
    }

    // ================= DELETE USER =================
    public function delete_user() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }
        $this->_check_admin();

        $stream_clean = $this->security->xss_clean($this->input->raw_input_stream);
        $json_data = json_decode($stream_clean, true);
        $id_user = isset($json_data['id_user']) ? trim($json_data['id_user']) : '';

        if (empty($id_user)) {
            return $this->response(400, 'error', 'ID User tidak valid.');
        }

        if (strtoupper($id_user) === strtoupper($this->session->userdata('id_user'))) {
            return $this->response(400, 'error', 'Anda tidak bisa menghapus akun Anda sendiri!');
        }

        $success = $this->muser->delete_user($id_user);
        if ($success) {
            return $this->response(200, 'success', 'User berhasil dihapus!');
        } else {
            return $this->response(500, 'error', 'Gagal menghapus user.');
        }
    }

    // ================= UPDATE PROFILE (MANDIRI) =================
    public function update_profile() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $stream_clean = $this->security->xss_clean($this->input->raw_input_stream);
        $json_data = json_decode($stream_clean, true);

        $id_user   = isset($json_data['id_user']) ? trim($json_data['id_user']) : '';
        $nama_user = isset($json_data['nama_user']) ? trim($json_data['nama_user']) : '';
        $passwd    = isset($json_data['passwd']) ? trim($json_data['passwd']) : '';

        if (empty($id_user) || empty($nama_user)) {
            return $this->response(400, 'error', 'Username dan Nama Lengkap wajib diisi!');
        }

        $current_id = $this->session->userdata('id_user');

        $data = array(
            'id_user'   => $id_user,
            'nama_user' => $nama_user,
            'passwd'    => $passwd
        );

        $success = $this->muser->update_self_profile($current_id, $data);
        if ($success) {
            return $this->response(200, 'success', 'Profil Anda berhasil diperbarui!');
        } else {
            return $this->response(500, 'error', 'Gagal memperbarui profil Anda. Pastikan koneksi database aktif.');
        }
    }
}
