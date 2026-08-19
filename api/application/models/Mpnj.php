<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Mpnj extends CI_Model {

    private $db_oracle = null;
    private $db_postgres = null;

    public function __construct() {
        parent::__construct();
        $this->init_databases();
    }

    private function _ping_host($host, $port, $timeout = 1) {
        if (empty($host) || empty($port)) return false;
        if (strpos($host, '(DESCRIPTION') !== false) {
            preg_match_all('/HOST\s*=\s*([a-zA-Z0-9\.-]+)/i', $host, $matches);
            if (!empty($matches[1])) {
                foreach ($matches[1] as $ip) {
                    $fp = @fsockopen($ip, $port, $errno, $errstr, $timeout);
                    if ($fp) {
                        fclose($fp);
                        return true;
                    }
                }
                return false;
            }
        }
        $fp = @fsockopen($host, $port, $errno, $errstr, $timeout);
        if ($fp) {
            fclose($fp);
            return true;
        }
        return false;
    }

    private function init_databases() {
        $db_debug_default = $this->db->db_debug;
        $this->db->db_debug = FALSE;

        $db_file = APPPATH . 'config/database.php';
        $oracle_host = '';
        $postgres_host = '';
        $postgres_port = 5432;

        if (file_exists($db_file)) {
            include($db_file);
            $oracle_host = isset($tnsname_oracle) ? $tnsname_oracle : '';
            if (isset($db['postgres'])) {
                $postgres_host = $db['postgres']['hostname'];
                $postgres_port = isset($db['postgres']['port']) ? $db['postgres']['port'] : 5432;
            }
        }

        // 1. Initialize Oracle connection safely
        if ($oracle_host && $this->_ping_host($oracle_host, 1521, 1)) {
            try {
                $this->db_oracle = @$this->load->database('oracle', TRUE);
                if (!$this->db_oracle || !$this->db_oracle->conn_id) {
                    $this->db_oracle = null;
                }
            } catch (Exception $e) {
                $this->db_oracle = null;
            }
        }

        // 2. Initialize PostgreSQL connection safely
        if ($postgres_host && $this->_ping_host($postgres_host, $postgres_port, 1)) {
            try {
                $this->db_postgres = @$this->load->database('postgres', TRUE);
                if (!$this->db_postgres || !$this->db_postgres->conn_id) {
                    $this->db_postgres = null;
                }
            } catch (Exception $e) {
                $this->db_postgres = null;
            }
        }

        $this->db->db_debug = $db_debug_default;
    }

    // ==========================================
    // ORACLE IMPLEMENTATIONS (Calling Package)
    // ==========================================

    public function get_data_pnj_oracle($noagenda, $tiket) {
        if (!$this->db_oracle) {
            return array('status' => 'error', 'message' => 'Database Oracle offline.');
        }

        try {
            $conn = $this->db_oracle->conn_id;
            
            // We use native oci8 functions because CI query builder does not support cursor binding
            $sql = "DECLARE 
                        v_ret INT;
                    BEGIN 
                        v_ret := OPHARAPP.PKG_PNJ_NULL.get_data_pnj(:noagenda, :tiket, :out_data, :out_rowcount, :out_message); 
                    END;";
                    
            $stmt = oci_parse($conn, $sql);
            
            // Create a cursor resource
            $cursor = oci_new_cursor($conn);
            $rowcount = 0;
            $message = '';
            
            oci_bind_by_name($stmt, ':noagenda', $noagenda);
            oci_bind_by_name($stmt, ':tiket', $tiket);
            oci_bind_by_name($stmt, ':out_data', $cursor, -1, OCI_B_CURSOR);
            oci_bind_by_name($stmt, ':out_rowcount', $rowcount, 32);
            oci_bind_by_name($stmt, ':out_message', $message, 4000);
            
            $exec = @oci_execute($stmt);
            if (!$exec) {
                $err = oci_error($stmt);
                return array('status' => 'error', 'message' => 'Oracle Exec Error: ' . $err['message']);
            }
            
            // Execute the cursor
            @oci_execute($cursor);
            $data = array();
            while (($row = oci_fetch_array($cursor, OCI_ASSOC + OCI_RETURN_NULLS)) !== false) {
                $normalized_row = array();
                foreach ($row as $k => $v) {
                    $normalized_row[strtolower($k)] = $v;
                }
                $data[] = $normalized_row;
            }
            
            oci_free_statement($cursor);
            oci_free_statement($stmt);
            
            $debug_msg = "[" . date('Y-m-d H:i:s') . "] Search - Agenda: '$noagenda' | Tiket: '$tiket' | Rowcount: '$rowcount' | Message: '$message'\n";
            @file_put_contents(APPPATH . 'logs/update_pnj_debug.log', $debug_msg, FILE_APPEND);
            
            if ($rowcount >= 1) {
                return array('status' => 'success', 'message' => $message, 'data' => $data);
            } else {
                return array('status' => 'error', 'message' => $message ? $message : 'Data tidak ditemukan.');
            }
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function save_pnj_oracle($params) {
        $log_file = APPPATH . 'logs/update_pnj_debug.log';
        $noagenda = isset($params['noagenda']) ? $params['noagenda'] : '';
        @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Oracle Init - Agenda: '$noagenda'\n", FILE_APPEND);

        if (!$this->db_oracle) {
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Oracle Error - Database Oracle offline.\n", FILE_APPEND);
            return array('status' => 'error', 'message' => 'Database Oracle offline.');
        }

        try {
            $conn = $this->db_oracle->conn_id;
            $sql = "BEGIN 
                        OPHARAPP.PKG_PNJ_NULL.save_pnj(
                            :plogin, :tiket, :noagenda, 
                            :pnj_101, :pnj_pemohon, :pnj_106, 
                            :nobang_101, :nobang_pemohon, :nobang_106, 
                            :ket_101, :ket_pemohon, :ket_106, 
                            :out_rowcount, :msgerror
                        ); 
                    END;";
            
            $stmt = oci_parse($conn, $sql);
            
            $rowcount = 0;
            $msgerror = '';
            
            oci_bind_by_name($stmt, ':plogin', $params['plogin']);
            oci_bind_by_name($stmt, ':tiket', $params['tiket']);
            oci_bind_by_name($stmt, ':noagenda', $params['noagenda']);
            oci_bind_by_name($stmt, ':pnj_101', $params['pnj_101']);
            oci_bind_by_name($stmt, ':pnj_pemohon', $params['pnj_pemohon']);
            oci_bind_by_name($stmt, ':pnj_106', $params['pnj_106']);
            oci_bind_by_name($stmt, ':nobang_101', $params['nobang_101']);
            oci_bind_by_name($stmt, ':nobang_pemohon', $params['nobang_pemohon']);
            oci_bind_by_name($stmt, ':nobang_106', $params['nobang_106']);
            oci_bind_by_name($stmt, ':ket_101', $params['ketnobang_101']);
            oci_bind_by_name($stmt, ':ket_pemohon', $params['ketnobang_pemohon']);
            oci_bind_by_name($stmt, ':ket_106', $params['ketnobang_106']);
            
            oci_bind_by_name($stmt, ':out_rowcount', $rowcount, 32);
            oci_bind_by_name($stmt, ':msgerror', $msgerror, 4000);
            
            $exec = @oci_execute($stmt);
            if (!$exec) {
                $err = oci_error($stmt);
                @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Oracle Exec Error - Agenda: '$noagenda' | Error: " . $err['message'] . "\n", FILE_APPEND);
                return array('status' => 'error', 'message' => 'Oracle Exec Error: ' . $err['message']);
            }
            
            oci_free_statement($stmt);
            
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Oracle - Agenda: '$noagenda' | MsgError: '$msgerror' | Rowcount: '$rowcount'\n", FILE_APPEND);
            
            if (trim($msgerror) === 'Sukses') {
                return array('status' => 'success', 'message' => 'Pembaruan data PNJ berhasil disimpan.');
            } else {
                return array('status' => 'error', 'message' => $msgerror);
            }
        } catch (Exception $e) {
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Oracle Exception - Agenda: '$noagenda' | Msg: " . $e->getMessage() . "\n", FILE_APPEND);
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function save_koreksi_tarif_oracle($params) {
        if (!$this->db_oracle) {
            return array('status' => 'error', 'message' => 'Database Oracle offline.');
        }

        try {
            $conn = $this->db_oracle->conn_id;
            $sql = "BEGIN 
                        OPHARAPP.PKG_PNJ_NULL.save_koreksi_tarif(
                            :plogin, :tiket, :noagenda, 
                            :out_rowcount, :msgerror
                        ); 
                    END;";
            
            $stmt = oci_parse($conn, $sql);
            
            $rowcount = 0;
            $msgerror = '';
            
            oci_bind_by_name($stmt, ':plogin', $params['plogin']);
            oci_bind_by_name($stmt, ':tiket', $params['tiket']);
            oci_bind_by_name($stmt, ':noagenda', $params['noagenda']);
            oci_bind_by_name($stmt, ':out_rowcount', $rowcount, 32);
            oci_bind_by_name($stmt, ':msgerror', $msgerror, 4000);
            
            $exec = @oci_execute($stmt);
            if (!$exec) {
                $err = oci_error($stmt);
                return array('status' => 'error', 'message' => 'Oracle Exec Error: ' . $err['message']);
            }
            
            oci_free_statement($stmt);
            
            if (trim($msgerror) === 'Sukses') {
                return array('status' => 'success', 'message' => 'Pembaruan data koreksi tarif berhasil disimpan.');
            } else {
                return array('status' => 'error', 'message' => $msgerror);
            }
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    // ==========================================
    // POSTGRES IMPLEMENTATIONS (PHP Engine Logic)
    // ==========================================

    public function get_data_pnj_postgres($noagenda, $tiket) {
        if (!$this->db_postgres) {
            return array('status' => 'error', 'message' => 'Database PostgreSQL offline.');
        }

        try {
            // 1. Fetch from trans_101_pemohon
            $q_pemohon = $this->db_postgres->get_where('bill52.trans_101_pemohon', array('noagenda' => $noagenda));
            if (!$q_pemohon || $q_pemohon->num_rows() === 0) {
                return array('status' => 'error', 'message' => 'Maaf Data tidak Ditemukan');
            }
            $pemohon = $q_pemohon->row_array();

            // 2. Fetch from trans_101
            $pnj_101 = null; $nobang_101 = null; $ketnobang_101 = null;
            $q_101 = $this->db_postgres->get_where('bill52.trans_101', array('noagenda' => $noagenda));
            if ($q_101 && $q_101->num_rows() > 0) {
                $row_101 = $q_101->row_array();
                $pnj_101 = isset($row_101['pnj']) ? $row_101['pnj'] : null;
                $nobang_101 = isset($row_101['nobang']) ? $row_101['nobang'] : null;
                $ketnobang_101 = isset($row_101['ketnobang']) ? $row_101['ketnobang'] : null;
            }

            // 3. Fetch from trans_106
            $pnj_106 = null; $nobang_106 = null; $ketnobang_106 = null;
            $q_106 = $this->db_postgres->get_where('bill52.trans_106', array('noagenda' => $noagenda));
            if ($q_106 && $q_106->num_rows() > 0) {
                $row_106 = $q_106->row_array();
                $pnj_106 = isset($row_106['pnj']) ? $row_106['pnj'] : null;
                $nobang_106 = isset($row_106['nobang']) ? $row_106['nobang'] : null;
                $ketnobang_106 = isset($row_106['ketnobang']) ? $row_106['ketnobang'] : null;
            }

            $data = array(
                array(
                    'pnj_101' => $pnj_101,
                    'nobang_101' => $nobang_101,
                    'ketnobang_101' => $ketnobang_101,
                    'pnj_pemohon' => isset($pemohon['pnj_pemohon']) ? $pemohon['pnj_pemohon'] : null,
                    'nobang_pemohon' => isset($pemohon['nobang_pemohon']) ? $pemohon['nobang_pemohon'] : null,
                    'ketnobang_pemohon' => isset($pemohon['ketnobang_pemohon']) ? $pemohon['ketnobang_pemohon'] : null,
                    'pnj_106' => $pnj_106,
                    'nobang_106' => $nobang_106,
                    'ketnobang_106' => $ketnobang_106,
                    'noagenda' => $noagenda
                )
            );

            return array(
                'status' => 'success',
                'message' => 'Sukses',
                'data' => $data
            );
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function save_pnj_postgres($params) {
        $log_file = APPPATH . 'logs/update_pnj_debug.log';
        $noagenda = isset($params['noagenda']) ? $params['noagenda'] : '';
        @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Postgres Init - Agenda: '$noagenda'\n", FILE_APPEND);

        if (!$this->db_postgres) {
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Postgres Error - Database PostgreSQL offline.\n", FILE_APPEND);
            return array('status' => 'error', 'message' => 'Database PostgreSQL offline.');
        }

        $db = $this->db_postgres;

        try {
            $db->trans_begin();

            // 1. Check if record exists in bill52.trans_101
            $db->where('noagenda', $noagenda);
            $count = $db->count_all_results('bill52.trans_101');
            if ($count === 0) {
                $db->trans_rollback();
                @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Postgres Error - Agenda: '$noagenda' | Data tidak ditemukan!\n", FILE_APPEND);
                return array('status' => 'error', 'message' => 'Data tidak ditemukan!');
            }

            // 2. Insert into opharapp.trans_101_log
            // PostgreSQL column names are typically lowercase. Select query to copy active records.
            $q101 = $db->get_where('bill52.trans_101', array('noagenda' => $noagenda));
            if ($q101 && $q101->num_rows() > 0) {
                $row101 = $q101->row_array();
                $row101['no_tiket'] = $params['tiket'];
                $row101['plogin'] = $params['plogin'];
                $row101['tgl_log'] = date('Y-m-d H:i:s');
                $db->insert('opharapp.trans_101_log', $row101);
            }

            // 3. Insert into opharapp.trans_101_pemohon_log
            $qPemohon = $db->get_where('bill52.trans_101_pemohon', array('noagenda' => $noagenda));
            if ($qPemohon && $qPemohon->num_rows() > 0) {
                $rowPemohon = $qPemohon->row_array();
                $rowPemohon['tgllog'] = date('Y-m-d H:i:s');
                $rowPemohon['logby'] = $params['tiket'];
                $db->insert('opharapp.trans_101_pemohon_log', $rowPemohon);
            }

            // 4. Insert into opharapp.trans_106_log
            $q106 = $db->get_where('bill52.trans_106', array('noagenda' => $noagenda));
            if ($q106 && $q106->num_rows() > 0) {
                $row106 = $q106->row_array();
                $row106['tgllog'] = date('Y-m-d H:i:s');
                $row106['logby'] = $params['tiket'];
                $db->insert('opharapp.trans_106_log', $row106);
            }

            // 5. Update active tables
            $db->where('noagenda', $noagenda);
            $db->update('bill52.trans_101', array(
                'pnj' => $params['pnj_101'],
                'nobang' => $params['nobang_101'],
                'ketnobang' => $params['ketnobang_101']
            ));

            $db->where('noagenda', $noagenda);
            $db->update('bill52.trans_101_pemohon', array(
                'pnj_pemohon' => $params['pnj_pemohon'],
                'nobang_pemohon' => $params['nobang_pemohon'],
                'ketnobang_pemohon' => $params['ketnobang_pemohon']
            ));

            $db->where('noagenda', $noagenda);
            $db->update('bill52.trans_106', array(
                'pnj' => $params['pnj_106'],
                'nobang' => $params['nobang_106'],
                'ketnobang' => $params['ketnobang_106']
            ));

            // 6. Write to log processes opharapp.ophar_log_proses
            $db->insert('opharapp.ophar_log_proses', array(
                'no_tiket' => $params['tiket'],
                'jenis_transaksi' => 'UPDATE PNJ OR NOBANG OR KETNOBANG NULL',
                'no_pelanggan' => $noagenda,
                'tglproses' => date('Y-m-d H:i:s'),
                'petugas' => $params['plogin']
            ));

            if ($db->trans_status() === FALSE) {
                $db->trans_rollback();
                @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Postgres Error - trans_status is FALSE\n", FILE_APPEND);
                return array('status' => 'error', 'message' => 'Gagal Update Data PNJ OR NOBANG OR KETNOBANG!');
            } else {
                $db->trans_commit();
                @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Postgres Success - Agenda: '$noagenda'\n", FILE_APPEND);
                
                // Write OPHARAPP.DTKS_LOG_PROSES on Oracle via reusable helper
                try {
                    $this->load->model('mlogs');
                    $this->mlogs->insert_dtks_log(
                        $params['tiket'], 
                        'Update PNJ', 
                        'noagenda: ' . $noagenda, 
                        '0', 
                        $params['plogin'],
                        'POSTGRE'
                    );
                } catch (Exception $log_ex) {
                    // Ignore logger failure
                }

                return array('status' => 'success', 'message' => 'Sukses');
            }
        } catch (Exception $e) {
            $db->trans_rollback();
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Postgres Exception - Agenda: '$noagenda' | Msg: " . $e->getMessage() . "\n", FILE_APPEND);
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function save_koreksi_tarif_postgres($params) {
        if (!$this->db_postgres) {
            return array('status' => 'error', 'message' => 'Database PostgreSQL offline.');
        }

        $db = $this->db_postgres;
        $noagenda = $params['noagenda'];

        try {
            $db->trans_begin();

            // 1. Check if record exists in bill52.trans_mutasi_koreksi
            $db->where('noagenda', $noagenda);
            $count = $db->count_all_results('bill52.trans_mutasi_koreksi');
            if ($count === 0) {
                $db->trans_rollback();
                return array('status' => 'error', 'message' => 'Data tidak ditemukan!');
            }

            // 2. Insert into opharapp.trans_mutasi_koreksi_log
            $qKoreksi = $db->get_where('bill52.trans_mutasi_koreksi', array('noagenda' => $noagenda));
            if ($qKoreksi && $qKoreksi->num_rows() > 0) {
                $rowKoreksi = $qKoreksi->row_array();
                $rowKoreksi['tgllog'] = date('Y-m-d H:i:s');
                $rowKoreksi['logby'] = $params['tiket'];
                $db->insert('opharapp.trans_mutasi_koreksi_log', $rowKoreksi);
            }

            // 3. Update bill52.trans_mutasi_koreksi from bill52.trans_pdl
            // We select values from postgres trans_pdl first
            $qPdl = $db->select('tglperemajaan, peremajaanby')
                       ->get_where('bill52.trans_pdl', array('noagenda' => $noagenda));
            
            if ($qPdl && $qPdl->num_rows() > 0) {
                $rowPdl = $qPdl->row_array();
                
                $db->where('noagenda', $noagenda);
                $db->update('bill52.trans_mutasi_koreksi', array(
                    'tglremaja' => $rowPdl['tglperemajaan'],
                    'petugasremaja' => $rowPdl['peremajaanby']
                ));
            } else {
                $db->trans_rollback();
                return array('status' => 'error', 'message' => 'Data PDL pendukung tidak ditemukan.');
            }

            // 4. Write to opharapp.ophar_log_proses
            $db->insert('opharapp.ophar_log_proses', array(
                'no_tiket' => $params['tiket'],
                'jenis_transaksi' => 'UPDATE REMAJA KOREKSI TARIF',
                'no_pelanggan' => $noagenda,
                'tglproses' => date('Y-m-d H:i:s'),
                'petugas' => $params['plogin']
            ));

            if ($db->trans_status() === FALSE) {
                $db->trans_rollback();
                return array('status' => 'error', 'message' => 'Gagal Update Data Koreksi Tarif!');
            } else {
                $db->trans_commit();
                
                // Write OPHARAPP.DTKS_LOG_PROSES on Oracle via reusable helper
                try {
                    $this->load->model('mlogs');
                    $this->mlogs->insert_dtks_log(
                        $params['tiket'], 
                        'UPDATE REMAJA KOREKSI TARIF', 
                        'noagenda: ' . $noagenda, 
                        '0', 
                        $params['plogin'],
                        'POSTGRE'
                    );
                } catch (Exception $log_ex) {
                    // Ignore logger failure
                }

                return array('status' => 'success', 'message' => 'Sukses');
            }
        } catch (Exception $e) {
            $db->trans_rollback();
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }
}
