<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Mpdl extends CI_Model {

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

    public function get_pdl_oracle($idpel, $tiket) {
        if (!$this->db_oracle) {
            return array('status' => 'error', 'message' => 'Database Oracle offline.');
        }

        try {
            $conn = $this->db_oracle->conn_id;
            
            $sql = "DECLARE 
                        v_ret INT;
                    BEGIN 
                        v_ret := OPHARAPP.DTKS_OPHAR_TRANS.get_transaksi_pdl(:p_idpel, :plogin, :out_rowcount, :out_data, :out_message); 
                    END;";
                    
            $stmt = oci_parse($conn, $sql);
            
            $cursor = oci_new_cursor($conn);
            $rowcount = 0;
            $message = '';
            $plogin = $this->session->userdata('id_user') ? $this->session->userdata('id_user') : 'SYSTEM';
            
            oci_bind_by_name($stmt, ':p_idpel', $idpel);
            oci_bind_by_name($stmt, ':plogin', $plogin);
            oci_bind_by_name($stmt, ':out_data', $cursor, -1, OCI_B_CURSOR);
            oci_bind_by_name($stmt, ':out_rowcount', $rowcount, 32);
            oci_bind_by_name($stmt, ':out_message', $message, 4000);
            
            $exec = @oci_execute($stmt);
            if (!$exec) {
                $err = oci_error($stmt);
                return array('status' => 'error', 'message' => 'Oracle Exec Error: ' . $err['message']);
            }
            
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
            
            $debug_msg = "[" . date('Y-m-d H:i:s') . "] Oracle PDL Search - IDPel: '$idpel' | Tiket: '$tiket' | Rowcount: '$rowcount' | Message: '$message'\n";
            @file_put_contents(APPPATH . 'logs/pdl_posting_debug.log', $debug_msg, FILE_APPEND);
            
            if ($rowcount >= 1) {
                return array('status' => 'success', 'message' => $message, 'data' => $data);
            } else {
                return array('status' => 'error', 'message' => $message ? $message : 'Data tidak ditemukan.');
            }
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function get_pdl_detail_oracle($noagenda, $idpel) {
        if (!$this->db_oracle) {
            return array('status' => 'error', 'message' => 'Database Oracle offline.');
        }

        try {
            $conn = $this->db_oracle->conn_id;
            
            $sql = "DECLARE 
                        v_ret INT;
                    BEGIN 
                        v_ret := OPHARAPP.DTKS_OPHAR_TRANS.get_detiltransaksi_pdl(:p_noagenda, :p_idpel, :out_data, :out_rowcount, :out_message); 
                    END;";
                    
            $stmt = oci_parse($conn, $sql);
            
            $cursor = oci_new_cursor($conn);
            $rowcount = 0;
            $message = '';
            
            oci_bind_by_name($stmt, ':p_noagenda', $noagenda);
            oci_bind_by_name($stmt, ':p_idpel', $idpel);
            oci_bind_by_name($stmt, ':out_data', $cursor, -1, OCI_B_CURSOR);
            oci_bind_by_name($stmt, ':out_rowcount', $rowcount, 32);
            oci_bind_by_name($stmt, ':out_message', $message, 4000);
            
            $exec = @oci_execute($stmt);
            if (!$exec) {
                $err = oci_error($stmt);
                return array('status' => 'error', 'message' => 'Oracle Exec Error: ' . $err['message']);
            }
            
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
            
            if ($rowcount >= 1) {
                return array('status' => 'success', 'message' => $message, 'data' => $data);
            } else {
                return array('status' => 'error', 'message' => $message ? $message : 'Detail tidak ditemukan.');
            }
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function save_pdl_oracle($params) {
        $log_file = APPPATH . 'logs/pdl_posting_debug.log';
        $idpel = isset($params['idpel']) ? $params['idpel'] : '';
        @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save PDL Oracle Init - IDPel: '$idpel'\n", FILE_APPEND);

        if (!$this->db_oracle) {
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save PDL Oracle Error - Database Oracle offline.\n", FILE_APPEND);
            return array('status' => 'error', 'message' => 'Database Oracle offline.');
        }

        try {
            $conn = $this->db_oracle->conn_id;
            $sql = "BEGIN 
                        OPHARAPP.DTKS_OPHAR_TRANS.get_simpantrans_pdl(
                            :p_idpel, :p_noagenda, :p_postingpdl, :p_thblangs1a, :p_pnj, :p_namapnj,
                            :p_kdprov, :p_kdkab, :p_kdkec, :p_kdkel, :p_pemda, :p_nobang, :p_ketnobang,
                            :p_thblmut, :p_unitupi, :p_unitap, :p_unitup, :p_nopdl, :plogin, :pno_tiket,
                            :pjns_trans, :out_rowcount, :msgerror
                        ); 
                    END;";
            
            $stmt = oci_parse($conn, $sql);
            
            $rowcount = 0;
            $msgerror = '';
            $pjns_trans = 'POSTING PDL';
            
            oci_bind_by_name($stmt, ':p_idpel', $params['idpel']);
            oci_bind_by_name($stmt, ':p_noagenda', $params['p_noagenda']);
            oci_bind_by_name($stmt, ':p_postingpdl', $params['postingPDLBaru']);
            oci_bind_by_name($stmt, ':p_thblangs1a', $params['THBLangS1ABaru']);
            oci_bind_by_name($stmt, ':p_pnj', $params['PNJBaru']);
            oci_bind_by_name($stmt, ':p_namapnj', $params['namaPNJBaru']);
            oci_bind_by_name($stmt, ':p_kdprov', $params['KDPROVBaru']);
            oci_bind_by_name($stmt, ':p_kdkab', $params['KDKABBaru']);
            oci_bind_by_name($stmt, ':p_kdkec', $params['KDKECBaru']);
            oci_bind_by_name($stmt, ':p_kdkel', $params['KDKELBaru']);
            oci_bind_by_name($stmt, ':p_pemda', $params['PEMDABaru']);
            oci_bind_by_name($stmt, ':p_nobang', $params['noBangBaru']);
            oci_bind_by_name($stmt, ':p_ketnobang', $params['ketNoBangBaru']);
            oci_bind_by_name($stmt, ':p_thblmut', $params['thblmut']);
            oci_bind_by_name($stmt, ':p_unitupi', $params['unitUpiBaru']);
            oci_bind_by_name($stmt, ':p_unitap', $params['unitApBaru']);
            oci_bind_by_name($stmt, ':p_unitup', $params['unitUpBaru']);
            oci_bind_by_name($stmt, ':p_nopdl', $params['NopostingPDLBaru']);
            oci_bind_by_name($stmt, ':plogin', $params['plogin']);
            oci_bind_by_name($stmt, ':pno_tiket', $params['tiket']);
            oci_bind_by_name($stmt, ':pjns_trans', $pjns_trans);
            
            oci_bind_by_name($stmt, ':out_rowcount', $rowcount, 32);
            oci_bind_by_name($stmt, ':msgerror', $msgerror, 4000);
            
            $exec = @oci_execute($stmt);
            if (!$exec) {
                $err = oci_error($stmt);
                @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save PDL Oracle Exec Error - IDPel: '$idpel' | Error: " . $err['message'] . "\n", FILE_APPEND);
                return array('status' => 'error', 'message' => 'Oracle Exec Error: ' . $err['message']);
            }
            
            oci_free_statement($stmt);
            
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save PDL Oracle Success - IDPel: '$idpel' | MsgError: '$msgerror' | Rowcount: '$rowcount'\n", FILE_APPEND);
            
            if (trim($msgerror) === 'SUKSES') {
                return array('status' => 'success', 'message' => 'Pembaruan data Posting PDL berhasil disimpan.');
            } else {
                return array('status' => 'error', 'message' => $msgerror);
            }
        } catch (Exception $e) {
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save PDL Oracle Exception - IDPel: '$idpel' | Msg: " . $e->getMessage() . "\n", FILE_APPEND);
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    // ==========================================
    // POSTGRES IMPLEMENTATIONS (PHP Engine Logic)
    // ==========================================

    public function get_pdl_postgres($idpel, $tiket) {
        if (!$this->db_postgres) {
            return array('status' => 'error', 'message' => 'Database PostgreSQL offline.');
        }

        try {
            $db = $this->db_postgres;
            $db->where('idpel', $idpel);
            $query = $db->get('bill52.trans_pdl');

            if (!$query || $query->num_rows() === 0) {
                return array('status' => 'error', 'message' => 'Maaf idpel tidak ditemukan');
            }

            $results = $query->result_array();
            $data = array();
            foreach ($results as $row) {
                $normalized = array();
                foreach ($row as $k => $v) {
                    $normalized[strtolower($k)] = $v;
                }
                $data[] = $normalized;
            }

            return array('status' => 'success', 'message' => 'SUKSES', 'data' => $data);
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function get_pdl_detail_postgres($noagenda, $idpel) {
        if (!$this->db_postgres) {
            return array('status' => 'error', 'message' => 'Database PostgreSQL offline.');
        }

        try {
            $db = $this->db_postgres;
            
            // Check count of trans_pdl where (noagenda = ? or noagenda is null) and postingpdl <> 3
            $db->group_start();
            $db->where('noagenda', $noagenda);
            $db->or_where('noagenda IS NULL', null, false);
            $db->group_end();
            $db->where('postingpdl <>', 3);
            $count = $db->count_all_results('bill52.trans_pdl');

            if ($count === 0) {
                return array('status' => 'error', 'message' => 'Maaf NoAgenda tidak ditemukan');
            }

            // Get detail row
            $db->where('nomorpdl', $noagenda);
            $db->where('idpel', $idpel);
            $query = $db->get('bill52.trans_pdl');

            if (!$query || $query->num_rows() === 0) {
                return array('status' => 'error', 'message' => 'Maaf data tidak ditemukan');
            }

            $results = $query->result_array();
            $data = array();
            foreach ($results as $row) {
                $normalized = array();
                foreach ($row as $k => $v) {
                    $normalized[strtolower($k)] = $v;
                }
                $data[] = $normalized;
            }

            return array('status' => 'success', 'message' => 'SUKSES', 'data' => $data);
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function save_pdl_postgres($params) {
        $log_file = APPPATH . 'logs/pdl_posting_debug.log';
        $idpel = isset($params['idpel']) ? $params['idpel'] : '';
        @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save PDL Postgres Init - IDPel: '$idpel'\n", FILE_APPEND);

        if (!$this->db_postgres) {
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save PDL Postgres Error - Database PostgreSQL offline.\n", FILE_APPEND);
            return array('status' => 'error', 'message' => 'Database PostgreSQL offline.');
        }

        $db = $this->db_postgres;

        try {
            $db->trans_begin();

            // 1. Check if record exists
            $db->where('idpel', $idpel);
            $db->where('nomorpdl', $params['NopostingPDLBaru']);
            if (!empty($params['p_noagenda'])) {
                $db->where('noagenda', $params['p_noagenda']);
            }
            $query = $db->get('bill52.trans_pdl');

            if (!$query || $query->num_rows() === 0) {
                $db->trans_rollback();
                return array('status' => 'error', 'message' => 'Data trans_pdl tidak ditemukan!');
            }

            $current_pdl = $query->row_array();
            $jenis_mk = isset($current_pdl['jenis_mk']) ? $current_pdl['jenis_mk'] : '';
            $tglentripdl = isset($current_pdl['tglentripdl']) ? $current_pdl['tglentripdl'] : null;

            // 2. Insert into opharapp.ophar_trans_pdl_log
            $log_data = array(
                'nomorpdl' => $params['NopostingPDLBaru'],
                'thblmut' => $params['thblmut'],
                'idpel' => $idpel,
                'noagenda' => $params['p_noagenda'] ? $params['p_noagenda'] : null,
                'postingpdl' => $params['postingPDLBaru'],
                'thblangs1a' => $params['THBLangS1ABaru'],
                'pnj' => $params['PNJBaru'],
                'namapnj' => $params['namaPNJBaru'],
                'kd_prov' => $params['KDPROVBaru'],
                'kd_kab' => $params['KDKABBaru'],
                'kd_kec' => $params['KDKECBaru'],
                'kd_kel' => $params['KDKELBaru'],
                'pemda' => $params['PEMDABaru'],
                'nobang' => $params['noBangBaru'],
                'ketnobang' => $params['ketNoBangBaru'],
                'jenis_mk' => $jenis_mk,
                'tglentripdl' => $tglentripdl,
                'tglcatat' => date('Y-m-d H:i:s'),
                'catatby' => $params['plogin'],
                'unitupi' => $params['unitUpiBaru'],
                'unitap' => $params['unitApBaru'],
                'unitup' => $params['unitUpBaru'],
                'tgl_log' => date('Y-m-d H:i:s'),
                'no_tiket' => $params['tiket']
            );

            // In Postgres, let's convert column names in insert data to match the actual casing. 
            // Standard lowercase columns are used.
            $db->insert('opharapp.ophar_trans_pdl_log', $log_data);

            // 3. Update bill52.trans_pdl
            $db->where('idpel', $idpel);
            $db->where('nomorpdl', $params['NopostingPDLBaru']);
            if (!empty($params['p_noagenda'])) {
                $db->where('noagenda', $params['p_noagenda']);
            }

            $update_data = array(
                'unitupi' => $params['unitUpiBaru'],
                'unitap' => $params['unitApBaru'],
                'unitup' => $params['unitUpBaru'],
                'thblangs1a' => $params['THBLangS1ABaru'],
                'postingpdl' => $params['postingPDLBaru'],
                'pnj' => $params['PNJBaru'],
                'namapnj' => $params['namaPNJBaru'],
                'kd_prov' => $params['KDPROVBaru'],
                'kd_kab' => $params['KDKABBaru'],
                'kd_kec' => $params['KDKECBaru'],
                'kd_kel' => $params['KDKELBaru'],
                'pemda' => $params['PEMDABaru'],
                'nobang' => $params['noBangBaru'],
                'ketnobang' => $params['ketNoBangBaru']
            );
            $db->update('bill52.trans_pdl', $update_data);
            // 4. Update was done directly (local log skipped per user request)

            if ($db->trans_status() === FALSE) {
                $db->trans_rollback();
                @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save PDL Postgres Error - trans_status is FALSE\n", FILE_APPEND);
                return array('status' => 'error', 'message' => 'Gagal memperbarui data Posting PDL!');
            } else {
                $db->trans_commit();
                @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save PDL Postgres Success - IDPel: '$idpel'\n", FILE_APPEND);
                
                // 5. Write central log OPHARAPP.DTKS_LOG_PROSES on Oracle via reusable helper
                try {
                    $this->load->model('mlogs');
                    $this->mlogs->insert_dtks_log(
                        $params['tiket'], 
                        'POSTING PDL', 
                        $params['p_noagenda'] ? 'noagenda: ' . $params['p_noagenda'] . ', idpel: ' . $idpel : 'idpel: ' . $idpel, 
                        $params['unitUpiBaru'], 
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
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save PDL Postgres Exception - IDPel: '$idpel' | Msg: " . $e->getMessage() . "\n", FILE_APPEND);
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }
}
