<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Mrealokasilittr extends CI_Model {

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

        // 2. Initialize PostgreSQL connection safely (multi-region header support)
        if ($postgres_host && $this->_ping_host($postgres_host, $postgres_port, 1)) {
            try {
                $region_header = $this->input->get_request_header('X-DB-Region');
                if ($region_header) {
                    $db_key = 'postgres_' . strtolower(trim($region_header));
                    if (isset($db[$db_key])) {
                        $this->db_postgres = @$this->load->database($db_key, TRUE);
                    }
                }
                
                if (!$this->db_postgres) {
                    $this->db_postgres = @$this->load->database('postgres', TRUE);
                }
                
                if (!$this->db_postgres || !$this->db_postgres->conn_id) {
                    $this->db_postgres = null;
                }
            } catch (Exception $e) {
                $this->db_postgres = null;
            }
        }

        $this->db->db_debug = $db_debug_default;
    }

    private function _fetch_cursor($cursor) {
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
        return $data;
    }

    // ==========================================
    // ORACLE IMPLEMENTATIONS
    // ==========================================

    public function get_data_oracle($noagenda) {
        if (!$this->db_oracle) {
            return array('status' => 'error', 'message' => 'Database Oracle offline.');
        }

        $log_file = APPPATH . 'logs/realokasi_littr_oracle.log';
        try {
            $conn = $this->db_oracle->conn_id;
            $sql = "BEGIN 
                        :result := OPHARAPP.DTKS_REALOKASI_LITTR.get_data(
                            :p_noagenda, :out_101, :out_kirim, 
                            :out_plnpay, :out_pdl, :out_master, :out_msg
                        ); 
                    END;";
            
            $stmt = oci_parse($conn, $sql);
            
            $curs_101 = oci_new_cursor($conn);
            $curs_kirim = oci_new_cursor($conn);
            $curs_plnpay = oci_new_cursor($conn);
            $curs_pdl = oci_new_cursor($conn);
            $curs_master = oci_new_cursor($conn);
            
            $result_val = 0;
            $out_msg = '';
            
            oci_bind_by_name($stmt, ':p_noagenda', $noagenda);
            oci_bind_by_name($stmt, ':out_101', $curs_101, -1, OCI_B_CURSOR);
            oci_bind_by_name($stmt, ':out_kirim', $curs_kirim, -1, OCI_B_CURSOR);
            oci_bind_by_name($stmt, ':out_plnpay', $curs_plnpay, -1, OCI_B_CURSOR);
            oci_bind_by_name($stmt, ':out_pdl', $curs_pdl, -1, OCI_B_CURSOR);
            oci_bind_by_name($stmt, ':out_master', $curs_master, -1, OCI_B_CURSOR);
            oci_bind_by_name($stmt, ':out_msg', $out_msg, 4000);
            oci_bind_by_name($stmt, ':result', $result_val, -1, OCI_B_INT);
            
            $exec = @oci_execute($stmt);
            if (!$exec) {
                $err = oci_error($stmt);
                return array('status' => 'error', 'message' => 'Oracle Exec Error: ' . $err['message']);
            }
            
            if ($result_val === 1) {
                $data_101 = $this->_fetch_cursor($curs_101);
                $data_kirim = $this->_fetch_cursor($curs_kirim);
                $data_plnpay = $this->_fetch_cursor($curs_plnpay);
                $data_pdl = $this->_fetch_cursor($curs_pdl);
                $data_master = $this->_fetch_cursor($curs_master);
                
                oci_free_statement($stmt);
                
                return array(
                    'status' => 'success',
                    'message' => 'Data ditemukan.',
                    'data' => array(
                        'trans_101' => isset($data_101[0]) ? $data_101[0] : null,
                        'trans_kirim' => isset($data_kirim[0]) ? $data_kirim[0] : null,
                        'trans_plnpay' => isset($data_plnpay[0]) ? $data_plnpay[0] : null,
                        'trans_pdl' => isset($data_pdl[0]) ? $data_pdl[0] : null,
                        'master_littr' => $data_master
                    )
                );
            } else {
                oci_free_statement($curs_101);
                oci_free_statement($curs_kirim);
                oci_free_statement($curs_plnpay);
                oci_free_statement($curs_pdl);
                oci_free_statement($curs_master);
                oci_free_statement($stmt);
                return array('status' => 'error', 'message' => $out_msg);
            }
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function save_realokasi_oracle($params) {
        if (!$this->db_oracle) {
            return array('status' => 'error', 'message' => 'Database Oracle offline.');
        }

        $log_file = APPPATH . 'logs/realokasi_littr_oracle.log';
        try {
            $conn = $this->db_oracle->conn_id;
            $sql = "BEGIN 
                        OPHARAPP.DTKS_REALOKASI_LITTR.proses_realokasi(
                            :p_noagenda, :p_no_tiket, :p_new_id_littr, 
                            :plogin, :pdb_session, :out_status
                        ); 
                    END;";
            
            $stmt = oci_parse($conn, $sql);
            
            $out_status = '';
            
            oci_bind_by_name($stmt, ':p_noagenda', $params['noagenda']);
            oci_bind_by_name($stmt, ':p_no_tiket', $params['tiket']);
            oci_bind_by_name($stmt, ':p_new_id_littr', $params['new_id_littr']);
            oci_bind_by_name($stmt, ':plogin', $params['plogin']);
            oci_bind_by_name($stmt, ':pdb_session', $params['db_session']);
            oci_bind_by_name($stmt, ':out_status', $out_status, 4000);
            
            $exec = @oci_execute($stmt);
            if (!$exec) {
                $err = oci_error($stmt);
                return array('status' => 'error', 'message' => 'Oracle Execute Error: ' . $err['message']);
            }
            
            oci_free_statement($stmt);
            
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Oracle - Agenda: '{$params['noagenda']}' | Tiket: '{$params['tiket']}' | Status: '$out_status'\n", FILE_APPEND);
            
            if (trim($out_status) === 'SUCCESS') {
                return array('status' => 'success', 'message' => 'Proses realokasi LITTR Oracle berhasil diselesaikan.');
            } else {
                return array('status' => 'error', 'message' => $out_status);
            }
        } catch (Exception $e) {
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save Oracle Exception - Agenda: '{$params['noagenda']}' | Msg: " . $e->getMessage() . "\n", FILE_APPEND);
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }


    // ==========================================
    // POSTGRESQL IMPLEMENTATIONS
    // ==========================================

    public function get_data_postgres($noagenda) {
        if (!$this->db_postgres) {
            return array('status' => 'error', 'message' => 'Database PostgreSQL offline.');
        }

        try {
            // 1. Fetch from trans_101
            $q_101 = $this->db_postgres->get_where('bill52.trans_101', array('noagenda' => $noagenda));
            if (!$q_101 || $q_101->num_rows() === 0) {
                return array('status' => 'error', 'message' => 'Maaf, Noagenda tidak ditemukan di TRANS_101.');
            }
            $row_101 = $q_101->row_array();

            // 2. Fetch from trans_kirim_ke_littr
            $q_kirim = $this->db_postgres->get_where('bill52.trans_kirim_ke_littr', array('noagenda' => $noagenda));
            $row_kirim = ($q_kirim && $q_kirim->num_rows() > 0) ? $q_kirim->row_array() : null;

            // 3. Fetch from trans_mohon_plnpay
            $q_plnpay = $this->db_postgres->get_where('bill52.trans_mohon_plnpay', array('noagenda' => $noagenda));
            $row_plnpay = ($q_plnpay && $q_plnpay->num_rows() > 0) ? $q_plnpay->row_array() : null;

            // 4. Fetch from trans_pdl
            $q_pdl = $this->db_postgres->get_where('bill52.trans_pdl', array('noagenda' => $noagenda));
            $row_pdl = ($q_pdl && $q_pdl->num_rows() > 0) ? $q_pdl->row_array() : null;

            // 5. Fetch master_littr
            $q_master = $this->db_postgres->select('id_littr, nama')
                                            ->from('erwinbudi.master_littr_sug2')
                                            ->order_by('id_littr')
                                            ->get();
            $master_littr = ($q_master && $q_master->num_rows() > 0) ? $q_master->result_array() : array();

            return array(
                'status' => 'success',
                'message' => 'Data ditemukan.',
                'data' => array(
                    'trans_101' => $row_101,
                    'trans_kirim' => $row_kirim,
                    'trans_plnpay' => $row_plnpay,
                    'trans_pdl' => $row_pdl,
                    'master_littr' => $master_littr
                )
            );
        } catch (Exception $e) {
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }

    public function save_realokasi_postgres($params) {
        if (!$this->db_postgres) {
            return array('status' => 'error', 'message' => 'Database PostgreSQL offline.');
        }

        $log_file = APPPATH . 'logs/realokasi_littr_postgres.log';
        $noagenda = $params['noagenda'];
        $tiket = $params['tiket'];
        $new_id_littr = $params['new_id_littr'];
        $plogin = $params['plogin'];
        $db_session = $params['db_session'];

        $this->db_postgres->trans_begin();

        try {
            // 1. Cek PAKETSLO dari trans_101
            $q_101 = $this->db_postgres->select('paketslo, idpel, unitup')->get_where('bill52.trans_101', array('noagenda' => $noagenda));
            if (!$q_101 || $q_101->num_rows() === 0) {
                throw new Exception('Noagenda tidak ditemukan di tabel TRANS_101.');
            }
            $row_101 = $q_101->row_array();
            $paketslo = isset($row_101['paketslo']) ? (int)$row_101['paketslo'] : 0;
            $v_idpel = isset($row_101['idpel']) ? $row_101['idpel'] : null;
            $v_unitupi = isset($row_101['unitup']) ? $row_101['unitup'] : null;

            // Cari detail idpel/unitupi dari PDL jika ada
            $q_pdl = $this->db_postgres->select('idpel, unitupi')->get_where('bill52.trans_pdl', array('noagenda' => $noagenda));
            if ($q_pdl && $q_pdl->num_rows() > 0) {
                $row_pdl = $q_pdl->row_array();
                if (!empty($row_pdl['idpel'])) $v_idpel = $row_pdl['idpel'];
                if (!empty($row_pdl['unitupi'])) $v_unitupi = $row_pdl['unitupi'];
            }

            // 2. Insert Log & Update berdasarkan PAKETSLO
            if ($paketslo === 1) {
                // PAKET
                // A. Log TRANS_101
                $sql_log_101 = "INSERT INTO bill52.trans_101_log (
                    noagenda, tglagenda, tgljawaban_101, tgljatuhtempo_101, tglcatat, petugascatat, tgledit, petugasedit, nokolektif, paket, vialayanan, filler_10, filler_11, filler_12, mk, jenis_mk, ket_mohon_a, ket_mohon_b, ket_mohon_c, ket_mohon_d, ket_mohon_e, nama, kdurubah_nourutplg, nourutplg, npwp, tarif, kdpt, kdpt_2, daya, kdaya, pnj, namapnj, nobang, ketnobang, rt, rw, nodlmrt, ketnodlmrt, lingkungan, kodepos, notelp, identitas, noidentitas, email, keperluan, nodenah_plg, fileblob, idpel_tetangga, unitup, idpel, tgl_106, tgllog, logby, jenis_transaksi, nopel, dayajbst, faknpremium, jmlkolektif, flag_rpadmin, notelp_hp, bp_hibah, rpbphibaH, rpbp
                ) SELECT 
                    noagenda, tglagenda, tgljawaban_101, tgljatuhtempo_101, tglcatat, petugascatat, tgledit, petugasedit, nokolektif, paket, vialayanan, filler_10, filler_11, filler_12, mk, jenis_mk, ket_mohon_a, ket_mohon_b, ket_mohon_c, ket_mohon_d, ket_mohon_e, nama, kdurubah_nourutplg, nourutplg, npwp, tarif, kdpt, kdpt_2, daya, kdaya, pnj, namapnj, nobang, ketnobang, rt, rw, nodlmrt, ketnodlmrt, lingkungan, kodepos, notelp, identitas, noidentitas, email, keperluan, nodenah_plg, fileblob, idpel_tetangga, unitup, idpel, tgl_106, NOW(), ?::text, jenis_transaksi, nopel, dayajbst, faknpremium, jmlkolektif, flag_rpadmin, notelp_hp, bp_hibah, rpbphibah, rpbp 
                FROM bill52.trans_101 
                WHERE noagenda = ?";
                $this->db_postgres->query($sql_log_101, array('Notiket: ' . $tiket, $noagenda));

                // B. Log TRANS_KIRIM_KE_LITTR
                $sql_log_kirim = "INSERT INTO bill52.trans_kirim_ke_littr_log (
                    noagenda, tgl_log, kd_alasanslo, unitap, unitup, unitupi, noregslo, noregtlo, kirim_ke, vendor_ke, tglcatat, tglkirim, keterangan, tglfeedback, tglflagtdksiap, alasantidaksiap, tglpenangguhan, alasanpenangguhan, tglkirimpenangguhan, tgl_terbit, tgl_kadaluarsa, url, flagpln, tglflagpln, petugasflagpln, rpslo, rc_kirim, desc_kirim, tgljttempofb, flagtidaksiap, id_littr, kd_alasan, tglsiapinstalasi, flagtangguh, rc_tangguh, desc_tangguh, flagnyala, tglnyala, tglkirimnyala, rc_nyala, desc_nyala, flagrestitusi, tglresitusi, tglkirimrestitusi, rc_restitusi, desc_restitusi, flagsiapsambung, flagsiapsambung_tgl, flagsiapsambung_tglkirim, flagsiapsambung_rc, flagsiapsambung_desc, tglflagtdksiap_littr, alasantdksiap_littr, flagbloking_fb, tglbloking_fb, tglkirim_bloking_fb, flagbloking_pln, tglbloking_pln, tglkirim_bloking_pln, kd_bloking, tgljttempolittrkerja
                ) SELECT 
                    noagenda, NOW(), kd_alasanslo, unitap, unitup, unitupi, noregslo, noregtlo, kirim_ke, vendor_ke, tglcatat, tglkirim, keterangan, tglfeedback, tglflagtdksiap, alasantidaksiap, tglpenangguhan, alasanpenangguhan, tglkirimpenangguhan, tgl_terbit, tgl_kadaluarsa, url, flagpln, tglflagpln, petugasflagpln, rpslo, rc_kirim, desc_kirim, tgljttempofb, flagtidaksiap, id_littr, kd_alasan, tglsiapinstalasi, flagtangguh, rc_tangguh, desc_tangguh, flagnyala, tglnyala, tglkirimnyala, rc_nyala, desc_nyala, flagrestitusi, tglresitusi, tglkirimrestitusi, rc_restitusi, desc_restitusi, flagsiapsambung, flagsiapsambung_tgl, flagsiapsambung_tglkirim, flagsiapsambung_rc, flagsiapsambung_desc, tglflagtdksiap_littr, alasantdksiap_littr, flagbloking_fb, tglbloking_fb, tglkirim_bloking_fb, flagbloking_pln, tglbloking_pln, tglkirim_bloking_pln, kd_bloking, tgljttempolittrkerja 
                FROM bill52.trans_kirim_ke_littr 
                WHERE noagenda = ?";
                $this->db_postgres->query($sql_log_kirim, array($noagenda));

                // C. Log TRANS_MOHON_PLNPAY
                $sql_log_plnpay = "INSERT INTO opharapp.trans_mohon_plnpay_log (
                    noagenda, no_sip, kdboking, kdbank, merchant, kdmerchant, tglcatat, id_littr, rpujl, rpbp, rpslo, tglkirim, tgljttempo, refnum, tglboking, rc_kirim, ket_kirim, tglkirim_batal, rc_batal, ket_batal, statusplnpay, tgllog, logby
                ) SELECT 
                    noagenda, no_sip, kdboking, kdbank, merchant, kdmerchant, tglcatat, id_littr, rpujl, rpbp, rpslo, tglkirim, tgljttempo, refnum, tglboking, rc_kirim, ket_kirim, tglkirim_batal, rc_batal, ket_batal, statusplnpay, NOW(), ?::text 
                FROM bill52.trans_mohon_plnpay 
                WHERE noagenda = ?";
                $this->db_postgres->query($sql_log_plnpay, array('Notiket: ' . $tiket, $noagenda));

                // D. Log TRANS_PDL
                $sql_log_pdl = "INSERT INTO bill52.trans_pdl_log (
                    nomorpdl, kdpembmeter, daya, kdaya, frt, namapnj, kogol, kdjenis_sl, pemda, kdinkaso, letakdesa, merek_pembatas, kodedesa, tegangan_sl, type_pembatas, kdbpt, mk, kdurubah_nourutplg, kdam, merek_saklarwaktu, kdpt, ktegangan_sl, kdpt_2, letakapp, kdpenggerak, kdrekg, kdpengukuran, kelasdesa, tarif, type_saklarwaktu, pnj, kdpsl, fjn, ref_kdppj, kdind, kdklp, kdujl, lingkungan, idpel, thblmut, jenis_mk, unitupi, unitap, unitup, unitkj, postingpdl, tglentripdl, tglrubah_mk, tglcatat, catatby, tglupdate, updateby, tglperemajaan, peremajaanby, nama, nourutplg, npwp, kdtarip_cis, nobang, ketnobang, rt, rw, nodlmrt, ketnodlmrt, kodepos, kdangsa, rpangsa, lamaangsa, thblangs1a, angskea, kdangsa, rpangs, lamaangs, thblangs1b, angskeb, kdangsc, rpangsc, lamaangsc, thblangs1c, angskec, nobp, tglbp, rpbp, noujl, tglujl, rpujl, kddk, kdbacameter, subkogol, copyrek, kdmeterai, kdppj, lokettgk, kdkvamaks, dayabpt, kddayabpt, tglpasang_kwh, merek_kwh, type_kwh, nometer_kwh, thtera_kwh, thbuat_kwh, kddk_awal_lwbp, kddk_awal_wbp, nopabrik_kwh, noregister_kwh, fasa_kwh, stand_cabut_lwbp, stand_cabut_wbp, kdpembmeter_kwh, tglpasang_kvarh, merek_kvarh, type_kvarh, nometer_kvarh, thtera_kvarh, thbuat_kvarh, kddk_awal_kvarh, nopabrik_kvarh, noregister_kvarh, fasa_kvarh, stand_cabut_kvarh, kdpembmeter_kvarh, tglpasang_kvamaks, merek_kvamaks, type_kvamaks, nometer_kvamaks, thtera_kvamaks, thbuat_kvamaks, kddk_awal_kvamaks, nopabrik_kvamaks, noregister_kvamaks, fasa_kvamaks, stand_cabut_kvamaks, kdpembmeter_kvamaks, tglpasang_ctptkwh, ct_primer_kwh, ct_sekunder_kwh, pt_primer_kwh, pt_sekunder_kwh, konstanta_kwh, fakmkwh, tglpasang_ctptkvarh, ct_primer_kvarh, ct_sekunder_kvarh, pt_primer_kvarh, pt_sekunder_kvarh, konstanta_kvarh, fakmkvarh, tglpasang_ctptkvamaks, ct_primer_kvamaks, ct_sekunder_kvamaks, pt_primer_kvamaks, pt_sekunder_kvamaks, konstanta_kvamaks, fakmkvam, thtera_pembatas, nopembatas, tglpasang_pembatas, thbuat_pembatas, jenis_pembatas, ukuransetting_pembatas, arus_pembatas, tegangan_pembatas, fasa_pembatas, tglpasang_saklarwaktu, nomor_saklarwaktu, thbuat_saklarwaktu, thtera_saklarwaktu, tglpasang_sl, kdgardu, notiang, nosl, panjang_sl, fasa_sl, kdijin_wbp, kdinstalatir, kodelokasidesa, kel_desa, kecamatan, kodya_kab, msg1, msg2, batchid, f_ketbp, f_ketujl, kdkomersil, lwbp, wbp, kdgmp, nospjbtl, tglspjbtl, j_aruskwh, g_stangs1, g_stangs2, g_stangs3, g_nobukti1, g_tglbukti1, g_nobukti2, g_tglbukti2, g_nobukti3, g_tglbukti3, ubahgantinama, tgl_pengesahan, sah_by, noagenda, nopel, faknpremium, pemasaran, sts_prima, dayajbst, kddayajbst, tglawljbst, tglakhjbst, tglbyremin, rpeminjbst, kwheminjbst, btskwhreg, kdbedajbst, nokuitemin, kdproses, kdpdpj, notelp, kdinvoice, koordinatx, koordinaty, no_pabrik, koreksike, log_by, tgl_log, idpel_ttg, type_ct_kwh, type_ct_kvarh, type_ct_kvamax, rpsewatrafo, noidentitas, nokk, notrafo
                ) SELECT 
                    nomorpdl, kdpembmeter, daya, kdaya, frt, namapnj, kogol, kdjenis_sl, pemda, kdinkaso, letakdesa, merek_pembatas, kodedesa, tegangan_sl, type_pembatas, kdbpt, mk, kdurubah_nourutplg, kdam, merek_saklarwaktu, kdpt, ktegangan_sl, kdpt_2, letakapp, kdpenggerak, kdrekg, kdpengukuran, kelasdesa, tarif, type_saklarwaktu, pnj, kdpsl, fjn, ref_kdppj, kdind, kdklp, kdujl, lingkungan, idpel, thblmut, jenis_mk, unitupi, unitap, unitup, unitkj, postingpdl, tglentripdl, tglrubah_mk, tglcatat, catatby, tglupdate, updateby, tglperemajaan, peremajaanby, nama, nourutplg, npwp, kdtarip_cis, nobang, ketnobang, rt, rw, nodlmrt, ketnodlmrt, kodepos, kdangsa, rpangsa, lamaangsa, thblangs1a, angskea, kdangsa, rpangs, lamaangs, thblangs1b, angskeb, kdangsc, rpangsc, lamaangsc, thblangs1c, angskec, nobp, tglbp, rpbp, noujl, tglujl, rpujl, kddk, kdbacameter, subkogol, copyrek, kdmeterai, kdppj, lokettgk, kdkvamaks, dayabpt, kddayabpt, tglpasang_kwh, merek_kwh, type_kwh, nometer_kwh, thtera_kwh, thbuat_kwh, kddk_awal_lwbp, kddk_awal_wbp, nopabrik_kwh, noregister_kwh, fasa_kwh, stand_cabut_lwbp, stand_cabut_wbp, kdpembmeter_kwh, tglpasang_kvarh, merek_kvarh, type_kvarh, nometer_kvarh, thtera_kvarh, thbuat_kvarh, kddk_awal_kvarh, nopabrik_kvarh, noregister_kvarh, fasa_kvarh, stand_cabut_kvarh, kdpembmeter_kvarh, tglpasang_kvamaks, merek_kvamaks, type_kvamaks, nometer_kvamaks, thtera_kvamaks, thbuat_kvamaks, kddk_awal_kvamaks, nopabrik_kvamaks, noregister_kvamaks, fasa_kvamaks, stand_cabut_kvamaks, kdpembmeter_kvamaks, tglpasang_ctptkwh, ct_primer_kwh, ct_sekunder_kwh, pt_primer_kwh, pt_sekunder_kwh, konstanta_kwh, fakmkwh, tglpasang_ctptkvarh, ct_primer_kvarh, ct_sekunder_kvarh, pt_primer_kvarh, pt_sekunder_kvarh, konstanta_kvarh, fakmkvarh, tglpasang_ctptkvamaks, ct_primer_kvamaks, ct_sekunder_kvamaks, pt_primer_kvamaks, pt_sekunder_kvamaks, konstanta_kvamaks, fakmkvam, thtera_pembatas, nopembatas, tglpasang_pembatas, thbuat_pembatas, jenis_pembatas, ukuransetting_pembatas, arus_pembatas, tegangan_pembatas, fasa_pembatas, tglpasang_saklarwaktu, nomor_saklarwaktu, thbuat_saklarwaktu, thtera_saklarwaktu, tglpasang_sl, kdgardu, notiang, nosl, panjang_sl, fasa_sl, kdijin_wbp, kdinstalatir, kodelokasidesa, kel_desa, kecamatan, kodya_kab, msg1, msg2, batchid, f_ketbp, f_ketujl, kdkomersil, lwbp, wbp, kdgmp, nospjbtl, tglspjbtl, j_aruskwh, g_stangs1, g_stangs2, g_stangs3, g_nobukti1, g_tglbukti1, G_nobukti2, g_tglbukti2, g_nobukti3, g_tglbukti3, ubahgantinama, tgl_pengesahan, sah_by, noagenda, nopel, faknpremium, pemasaran, sts_prima, dayajbst, kddayajbst, tglawljbst, tglakhjbst, tglbyremin, rpeminjbst, kwheminjbst, btskwhreg, kdbedajbst, nokuitemin, kdproses, kdpdpj, notelp, kdinvoice, koordinatx, koordinaty, no_pabrik, (SELECT COALESCE(MAX(COALESCE(koreksike,0)),0)+1 FROM bill52.trans_pdl_log WHERE noagenda=a.noagenda), ?::text, NOW(), idpel_ttg, type_ct_kwh, type_ct_kvarh, type_ct_kvamax, rpsewatrafo, noidentitas, nokk, notrafo 
                FROM bill52.trans_pdl a 
                WHERE noagenda = ?";
                $this->db_postgres->query($sql_log_pdl, array('Notiket: ' . $tiket, $noagenda));

                // E. Update
                $this->db_postgres->update('bill52.trans_101', array('id_littr' => $new_id_littr), array('noagenda' => $noagenda));
                $this->db_postgres->update('bill52.trans_mohon_plnpay', array('id_littr' => $new_id_littr), array('noagenda' => $noagenda));
                $this->db_postgres->update('bill52.trans_pdl', array('id_littr' => $new_id_littr), array('noagenda' => $noagenda));
                $this->db_postgres->update('bill52.trans_kirim_ke_littr', array('id_littr' => $new_id_littr, 'tglkirim' => null, 'rc_kirim' => null, 'desc_kirim' => null), array('noagenda' => $noagenda));

            } else {
                // NON-PAKET
                // A. Log TRANS_101
                $sql_log_101 = "INSERT INTO bill52.trans_101_log (
                    noagenda, tglagenda, tgljawaban_101, tgljatuhtempo_101, tglcatat, petugascatat, tgledit, petugasedit, nokolektif, paket, vialayanan, filler_10, filler_11, filler_12, mk, jenis_mk, ket_mohon_a, ket_mohon_b, ket_mohon_c, ket_mohon_d, ket_mohon_e, nama, kdurubah_nourutplg, nourutplg, npwp, tarif, kdpt, kdpt_2, daya, kdaya, pnj, namapnj, nobang, ketnobang, rt, rw, nodlmrt, ketnodlmrt, lingkungan, kodepos, notelp, identitas, noidentitas, email, keperluan, nodenah_plg, fileblob, idpel_tetangga, unitup, idpel, tgl_106, tgllog, logby, jenis_transaksi, nopel, dayajbst, faknpremium, jmlkolektif, flag_rpadmin, notelp_hp, bp_hibah, rpbphibah, rpbp
                ) SELECT 
                    noagenda, tglagenda, tgljawaban_101, tgljatuhtempo_101, tglcatat, petugascatat, tgledit, petugasedit, nokolektif, paket, vialayanan, filler_10, filler_11, filler_12, mk, jenis_mk, ket_mohon_a, ket_mohon_b, ket_mohon_c, ket_mohon_d, ket_mohon_e, nama, kdurubah_nourutplg, nourutplg, npwp, tarif, kdpt, kdpt_2, daya, kdaya, pnj, namapnj, nobang, ketnobang, rt, rw, nodlmrt, ketnodlmrt, lingkungan, kodepos, notelp, identitas, noidentitas, email, keperluan, nodenah_plg, fileblob, idpel_tetangga, unitup, idpel, tgl_106, NOW(), ?::text, jenis_transaksi, nopel, dayajbst, faknpremium, jmlkolektif, flag_rpadmin, notelp_hp, bp_hibah, rpbphibah, rpbp 
                FROM bill52.trans_101 
                WHERE noagenda = ?";
                $this->db_postgres->query($sql_log_101, array('Notiket: ' . $tiket, $noagenda));

                // B. Log TRANS_PDL
                $sql_log_pdl = "INSERT INTO bill52.trans_pdl_log (
                    nomorpdl, kdpembmeter, daya, kdaya, frt, namapnj, kogol, kdjenis_sl, pemda, kdinkaso, letakdesa, merek_pembatas, kodedesa, tegangan_sl, type_pembatas, kdbpt, mk, kdurubah_nourutplg, kdam, merek_saklarwaktu, kdpt, ktegangan_sl, kdpt_2, letakapp, kdpenggerak, kdrekg, kdpengukuran, kelasdesa, tarif, type_saklarwaktu, pnj, kdpsl, fjn, ref_kdppj, kdind, kdklp, kdujl, lingkungan, idpel, thblmut, jenis_mk, unitupi, unitap, unitup, unitkj, postingpdl, tglentripdl, tglrubah_mk, tglcatat, catatby, tglupdate, updateby, tglperemajaan, peremajaanby, nama, nourutplg, npwp, kdtarip_cis, nobang, ketnobang, rt, rw, nodlmrt, ketnodlmrt, kodepos, kdangsa, rpangsa, lamaangsa, thblangs1a, angskea, kdangsa, rpangs, lamaangs, thblangs1b, angskeb, kdangsc, rpangsc, lamaangsc, thblangs1c, angskec, nobp, tglbp, rpbp, noujl, tglujl, rpujl, kddk, kdbacameter, subkogol, copyrek, kdmeterai, kdppj, lokettgk, kdkvamaks, dayabpt, kddayabpt, tglpasang_kwh, merek_kwh, type_kwh, nometer_kwh, thtera_kwh, thbuat_kwh, kddk_awal_lwbp, kddk_awal_wbp, nopabrik_kwh, noregister_kwh, fasa_kwh, stand_cabut_lwbp, stand_cabut_wbp, kdpembmeter_kwh, tglpasang_kvarh, merek_kvarh, type_kvarh, nometer_kvarh, thtera_kvarh, thbuat_kvarh, kddk_awal_kvarh, nopabrik_kvarh, noregister_kvarh, fasa_kvarh, stand_cabut_kvarh, kdpembmeter_kvarh, tglpasang_kvamaks, merek_kvamaks, type_kvamaks, nometer_kvamaks, thtera_kvamaks, thbuat_kvamaks, kddk_awal_kvamaks, nopabrik_kvamaks, noregister_kvamaks, fasa_kvamaks, stand_cabut_kvamaks, kdpembmeter_kvamaks, tglpasang_ctptkwh, ct_primer_kwh, ct_sekunder_kwh, pt_primer_kwh, pt_sekunder_kwh, konstanta_kwh, fakmkwh, tglpasang_ctptkvarh, ct_primer_kvarh, ct_sekunder_kvarh, pt_primer_kvarh, pt_sekunder_kvarh, konstanta_kvarh, fakmkvarh, tglpasang_ctptkvamaks, ct_primer_kvamaks, ct_sekunder_kvamaks, pt_primer_kvamaks, pt_sekunder_kvamaks, konstanta_kvamaks, fakmkvam, thtera_pembatas, nopembatas, tglpasang_pembatas, thbuat_pembatas, jenis_pembatas, ukuransetting_pembatas, arus_pembatas, tegangan_pembatas, fasa_pembatas, tglpasang_saklarwaktu, nomor_saklarwaktu, thbuat_saklarwaktu, thtera_saklarwaktu, tglpasang_sl, kdgardu, notiang, nosl, panjang_sl, fasa_sl, kdijin_wbp, kdinstalatir, kodelokasidesa, kel_desa, kecamatan, kodya_kab, msg1, msg2, batchid, f_ketbp, f_ketujl, kdkomersil, lwbp, wbp, kdgmp, nospjbtl, tglspjbtl, j_aruskwh, g_stangs1, g_stangs2, g_stangs3, g_nobukti1, g_tglbukti1, g_nobukti2, g_tglbukti2, g_nobukti3, g_tglbukti3, ubahgantinama, tgl_pengesahan, sah_by, noagenda, nopel, faknpremium, pemasaran, sts_prima, dayajbst, kddayajbst, tglawljbst, tglakhjbst, tglbyremin, rpeminjbst, kwheminjbst, btskwhreg, kdbedajbst, nokuitemin, kdproses, kdpdpj, notelp, kdinvoice, koordinatx, koordinaty, no_pabrik, (SELECT COALESCE(MAX(COALESCE(koreksike,0)),0)+1 FROM bill52.trans_pdl_log WHERE noagenda=a.noagenda), ?::text, NOW(), idpel_ttg, type_ct_kwh, type_ct_kvarh, type_ct_kvamax, rpsewatrafo, noidentitas, nokk, notrafo 
                FROM bill52.trans_pdl a 
                WHERE noagenda = ?";
                $this->db_postgres->query($sql_log_pdl, array('Notiket: ' . $tiket, $noagenda));

                // C. Update
                $this->db_postgres->update('bill52.trans_101', array('id_littr' => $new_id_littr), array('noagenda' => $noagenda));
                $this->db_postgres->update('bill52.trans_pdl', array('id_littr' => $new_id_littr), array('noagenda' => $noagenda));
            }

            // 3. Log Akhir Proses
            $sql_log_proses = "INSERT INTO opharapp.dtks_log_proses (
                no_tiket, jenis_transaksi, no_pelanggan, tglproses, unitupi, login, db_session
            ) VALUES (?, 'Realokasi LITTR', ?, NOW(), ?, ?, ?)";
            $this->db_postgres->query($sql_log_proses, array($tiket, $v_idpel, $v_unitupi, $plogin, $db_session));

            if ($this->db_postgres->trans_status() === FALSE) {
                $this->db_postgres->trans_rollback();
                throw new Exception('Transaksi PostgreSQL gagal.');
            } else {
                $this->db_postgres->trans_commit();
                @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save PG Success - Agenda: '$noagenda' | Tiket: '$tiket'\n", FILE_APPEND);
                return array('status' => 'success', 'message' => 'Proses realokasi LITTR PostgreSQL berhasil diselesaikan.');
            }
        } catch (Exception $e) {
            $this->db_postgres->trans_rollback();
            @file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Save PG Error - Agenda: '$noagenda' | Msg: " . $e->getMessage() . "\n", FILE_APPEND);
            return array('status' => 'error', 'message' => $e->getMessage());
        }
    }
}
