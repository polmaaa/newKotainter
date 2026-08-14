<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Logs extends MY_Controller {

    // Proteksi diaktifkan: hanya user dengan session login valid yang dapat mengakses API ini
    protected $protected = true;

    public function __construct() {
        parent::__construct();
        $this->load->model('mlogs');
    }

    // ================= GET LOGS =================
    public function get_logs() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $logs = $this->mlogs->get_all_logs();
        $db_status = $this->mlogs->get_db_status();

        return $this->response(200, 'success', 'Berhasil memuat data log.', array(
            'logs'      => $logs,
            'db_status' => $db_status
        ));
    }

    // ================= SAVE LOG =================
    public function save_log() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        // Membaca input JSON payload atau Form POST
        $stream_clean = $this->security->xss_clean($this->input->raw_input_stream);
        $json_data = json_decode($stream_clean, true);

        $no_tiket        = isset($json_data['no_tiket']) ? trim($json_data['no_tiket']) : trim($this->input->post('no_tiket'));
        $no_pelanggan    = isset($json_data['no_pelanggan']) ? trim($json_data['no_pelanggan']) : trim($this->input->post('no_pelanggan'));
        $jenis_transaksi = isset($json_data['jenis_transaksi']) ? trim($json_data['jenis_transaksi']) : trim($this->input->post('jenis_transaksi'));
        $database        = isset($json_data['database']) ? trim($json_data['database']) : trim($this->input->post('database'));
        $status          = isset($json_data['status']) ? trim($json_data['status']) : trim($this->input->post('status'));
        $query           = isset($json_data['query']) ? trim($json_data['query']) : trim($this->input->post('query'));

        if ($no_tiket === '' || $no_pelanggan === '' || $jenis_transaksi === '' || $query === '') {
            return $this->response(400, 'error', 'Seluruh kolom form tiket wajib diisi!');
        }

        $param = array(
            'no_tiket'        => $no_tiket,
            'no_pelanggan'    => $no_pelanggan,
            'jenis_transaksi' => $jenis_transaksi,
            'database'        => $database,
            'status'          => $status,
            'query'           => $query
        );

        $result = $this->mlogs->save_log($param);

        return $this->response(200, 'success', 'Tiket log berhasil disimpan!', $result);
    }

    // ================= DATABASE STATUS =================
    public function get_db_status() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $db_status = $this->mlogs->get_db_status();
        return $this->response(200, 'success', 'Berhasil mengambil status database.', $db_status);
    }
}
