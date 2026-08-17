CREATE OR REPLACE PACKAGE DTKS.PKG_PNJ_NULL AS
    /*
     * Package: DTKS.PKG_PNJ_NULL
     * Deskripsi: Pembaruan alur proses PNJ Null & Koreksi Tarif untuk REST API NewKotainter
     * Dibuat oleh: AI Antigravity
     */

    FUNCTION get_data_pnj (
        in_noagenda   IN  VARCHAR2,
        in_tiket      IN  VARCHAR2,
        out_data      OUT SYS_REFCURSOR,
        out_rowcount  OUT NUMBER,
        out_message   OUT VARCHAR2
    ) RETURN INT;

    PROCEDURE save_pnj (
        in_plogin            IN  VARCHAR2,
        in_tiket             IN  VARCHAR2,
        in_noagenda          IN  VARCHAR2,
        in_pnj_101           IN  VARCHAR2,
        in_pnj_pemohon       IN  VARCHAR2,
        in_pnj_106           IN  VARCHAR2,
        in_nobang_101        IN  VARCHAR2,
        in_nobang_pemohon    IN  VARCHAR2,
        in_nobang_106        IN  VARCHAR2,
        in_ketnobang_101      IN  VARCHAR2,
        in_ketnobang_pemohon  IN  VARCHAR2,
        in_ketnobang_106      IN  VARCHAR2,
        out_rowcount         OUT NUMBER,
        msgerror             OUT VARCHAR2
    );

    PROCEDURE save_koreksi_tarif (
        in_plogin     IN  VARCHAR2,
        in_tiket      IN  VARCHAR2,
        in_noagenda   IN  VARCHAR2,
        out_rowcount  OUT NUMBER,
        msgerror      OUT VARCHAR2
    );
END PKG_PNJ_NULL;
/

CREATE OR REPLACE PACKAGE BODY DTKS.PKG_PNJ_NULL AS

    FUNCTION get_data_pnj (
        in_noagenda   IN  VARCHAR2,
        in_tiket      IN  VARCHAR2,
        out_data      OUT SYS_REFCURSOR,
        out_rowcount  OUT NUMBER,
        out_message   OUT VARCHAR2
    ) RETURN INT IS
        v_count NUMBER;
        
        v_pnj_101 VARCHAR2(100) := NULL;
        v_nobang_101 VARCHAR2(100) := NULL;
        v_ket_101 VARCHAR2(100) := NULL;
        
        v_pnj_pemohon VARCHAR2(100) := NULL;
        v_nobang_pemohon VARCHAR2(100) := NULL;
        v_ket_pemohon VARCHAR2(100) := NULL;
        
        v_pnj_106 VARCHAR2(100) := NULL;
        v_nobang_106 VARCHAR2(100) := NULL;
        v_ket_106 VARCHAR2(100) := NULL;
    BEGIN
        -- 1. Fetch from TRANS_101_PEMOHON (Main reference table)
        BEGIN
            SELECT PNJ_PEMOHON, NOBANG_PEMOHON, KETNOBANG_PEMOHON
            INTO v_pnj_pemohon, v_nobang_pemohon, v_ket_pemohon
            FROM BILL52.TRANS_101_PEMOHON
            WHERE NOAGENDA = in_noagenda;
            v_count := 1;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                v_count := 0;
        END;

        out_rowcount := v_count;

        IF v_count >= 1 THEN
            -- 2. Fetch from TRANS_101
            BEGIN
                SELECT PNJ, NOBANG, KETNOBANG
                INTO v_pnj_101, v_nobang_101, v_ket_101
                FROM BILL52.TRANS_101
                WHERE NOAGENDA = in_noagenda;
            EXCEPTION
                WHEN NO_DATA_FOUND THEN NULL;
            END;

            -- 3. Fetch from TRANS_106
            BEGIN
                SELECT PNJ, NOBANG, KETNOBANG
                INTO v_pnj_106, v_nobang_106, v_ket_106
                FROM BILL52.TRANS_106
                WHERE NOAGENDA = in_noagenda;
            EXCEPTION
                WHEN NO_DATA_FOUND THEN NULL;
            END;

            -- 4. Open ref cursor from DUAL using gathered variables (avoids slow joins)
            OPEN out_data FOR
            SELECT 
                v_pnj_101 AS PNJ_101, v_nobang_101 AS NOBANG_101, v_ket_101 AS KETNOBANG_101,
                v_pnj_pemohon AS PNJ_PEMOHON, v_nobang_pemohon AS NOBANG_PEMOHON, v_ket_pemohon AS KETNOBANG_PEMOHON,
                v_pnj_106 AS PNJ_106, v_nobang_106 AS NOBANG_106, v_ket_106 AS KETNOBANG_106,
                in_noagenda AS NOAGENDA
            FROM DUAL;
            
            out_message := 'Sukses';
            RETURN 1;
        ELSE
            out_message := 'Maaf Data tidak Ditemukan';
            RETURN 0;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            out_message := SQLERRM;
            RETURN 0;
    END get_data_pnj;

    PROCEDURE save_pnj (
        in_plogin            IN  VARCHAR2,
        in_tiket             IN  VARCHAR2,
        in_noagenda          IN  VARCHAR2,
        in_pnj_101           IN  VARCHAR2,
        in_pnj_pemohon       IN  VARCHAR2,
        in_pnj_106           IN  VARCHAR2,
        in_nobang_101        IN  VARCHAR2,
        in_nobang_pemohon    IN  VARCHAR2,
        in_nobang_106        IN  VARCHAR2,
        in_ketnobang_101      IN  VARCHAR2,
        in_ketnobang_pemohon  IN  VARCHAR2,
        in_ketnobang_106      IN  VARCHAR2,
        out_rowcount         OUT NUMBER,
        msgerror             OUT VARCHAR2
    ) IS
        v_jml NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_jml
        FROM BILL52.TRANS_101
        WHERE NOAGENDA = in_noagenda;

        IF v_jml = 0 THEN
            msgerror := 'Data tidak ditemukan!';
            out_rowcount := 0;
            RETURN;
        END IF;

        -- 1. Menyimpan data log ke skema OPHARAPP
        INSERT INTO OPHARAPP.TRANS_101_LOG (
            NOAGENDA, TGLAGENDA, TGLJAWABAN_101, TGLJATUHTEMPO_101, TGLCATAT, PETUGASCATAT, TGLEDIT, PETUGASEDIT, NOKOLEKTIF, PAKET, VIALAYANAN, 
            FILLER_10, FILLER_11, FILLER_12, MK, JENIS_MK, KET_MOHON_A, KET_MOHON_B, KET_MOHON_C, KET_MOHON_D, KET_MOHON_E, NAMA, KDRUBAH_NOURUTPLG, 
            NOURUTPLG, NPWP, TARIF, KDPT, KDPT_2, DAYA, KDAYA, PNJ, NAMAPNJ, NOBANG, KETNOBANG, RT, RW, NODLMRT, KETNODLMRT, LINGKUNGAN, KODEPOS, 
            NOTELP, IDENTITAS, NOIDENTITAS, EMAIL, KEPERLUAN, NODENAH_PLG, FILEBLOB, IDPEL_TETANGGA, UNITUP, IDPEL, TGL_106, NAMA_INSTALATIR, 
            JENIS_TRANSAKSI, KD_PAKET_SAR, NOPEL, DAYAJBST, FAKNPREMIUM, JMLKOLEKTIF, TGLBATAL, BATALBY, ALASANBATAL, FLAG_RPADMIN, NOTELP_HP, 
            BP_HIBAH, RPBPHIBAH, RPBP, KODETDL, UNITMOHON, KELURAHAN, PROSENPPJ, PEMDA, KOORDINAT_X, KOORDINAT_Y, KD_KEPERLUAN, KD_KABKOTA, 
            TGL_SLO, NOREGSLO, PAKETSLO, FLAGINSTALASI, TGLINSTALASISIAP, NO_SLO, DAYAMOHON, FLAGREKOMENDASI, NOSURATREKOMENDASI, NO_TIKET, PLOGIN, TGL_LOG
        )
        SELECT 
            NOAGENDA, TGLAGENDA, TGLJAWABAN_101, TGLJATUHTEMPO_101, TGLCATAT, PETUGASCATAT, TGLEDIT, PETUGASEDIT, NOKOLEKTIF, PAKET, VIALAYANAN, 
            FILLER_10, FILLER_11, FILLER_12, MK, JENIS_MK, KET_MOHON_A, KET_MOHON_B, KET_MOHON_C, KET_MOHON_D, KET_MOHON_E, NAMA, KDRUBAH_NOURUTPLG, 
            NOURUTPLG, NPWP, TARIF, KDPT, KDPT_2, DAYA, KDAYA, PNJ, NAMAPNJ, NOBANG, KETNOBANG, RT, RW, NODLMRT, KETNODLMRT, LINGKUNGAN, KODEPOS, 
            NOTELP, IDENTITAS, NOIDENTITAS, EMAIL, KEPERLUAN, NODENAH_PLG, FILEBLOB, IDPEL_TETANGGA, UNITUP, IDPEL, TGL_106, NAMA_INSTALATIR, 
            JENIS_TRANSAKSI, KD_PAKET_SAR, NOPEL, DAYAJBST, FAKNPREMIUM, JMLKOLEKTIF, TGLBATAL, BATALBY, ALASANBATAL, FLAG_RPADMIN, NOTELP_HP, 
            BP_HIBAH, RPBPHIBAH, RPBP, KODETDL, UNITMOHON, KELURAHAN, PROSENPPJ, PEMDA, KOORDINAT_X, KOORDINAT_Y, KD_KEPERLUAN, KD_KABKOTA, 
            TGL_SLO, NOREGSLO, PAKETSLO, FLAGINSTALASI, TGLINSTALASISIAP, NO_SLO, DAYAMOHON, FLAGREKOMENDASI, NOSURATREKOMENDASI, in_tiket, in_plogin, SYSDATE 
        FROM BILL52.TRANS_101 
        WHERE NOAGENDA = in_noagenda;

        INSERT INTO OPHARAPP.TRANS_101_PEMOHON_LOG (
            NOAGENDA, TGLCATAT, PETUGASCATAT, TGLEDIT, PETUGASEDIT, FILLER_02, NAMA_PEMOHON, PNJ_PEMOHON, NAMAPNJ_PEMOHON, 
            NOBANG_PEMOHON, KETNOBANG_PEMOHON, RT_PEMOHON, RW_PEMOHON, NODLMRT_PEMOHON, KETNODLMRT_PEMOHON, LINGKUNGAN_PEMOHON, 
            KOTA_PEMOHON, KODEPOS_PEMOHON, NOTELP_PEMOHON, IDENTITAS_PEMOHON, NOIDENTITAS_PEMOHON, EMAIL_PEMOHON, TGLLOG, LOGBY, NOTELP_HP_PEMOHON
        )
        SELECT 
            NOAGENDA, TGLCATAT, PETUGASCATAT, TGLEDIT, PETUGASEDIT, FILLER_02, NAMA_PEMOHON, PNJ_PEMOHON, NAMAPNJ_PEMOHON, 
            NOBANG_PEMOHON, KETNOBANG_PEMOHON, RT_PEMOHON, RW_PEMOHON, NODLMRT_PEMOHON, KETNODLMRT_PEMOHON, LINGKUNGAN_PEMOHON, 
            KOTA_PEMOHON, KODEPOS_PEMOHON, NOTELP_PEMOHON, IDENTITAS_PEMOHON, NOIDENTITAS_PEMOHON, EMAIL_PEMOHON, SYSDATE, in_tiket, NOTELP_HP_PEMOHON
        FROM BILL52.TRANS_101_PEMOHON 
        WHERE NOAGENDA = in_noagenda;

        INSERT INTO OPHARAPP.TRANS_106_LOG (
            NOAGENDA, NO_KOLEKTIF, UNITUP, IDPEL, TGL_106, BANKID, NAMABANK, REFNO, TGLLUNAS_BANK, RP_106, NO_106, NO_REGISTER,
            TGLCATAT, PETUGASCATAT, TGLEDIT, PETUGASEDIT, NOJAMINANINST, TGLJAMINANINST, INSTALATIR, NOSPJBTL, TGLSPJBTL, NOBP, TGLBP,
            RPBP, NOUJL, TGLUJL, RPUJL, KDUJL, FILLER_10, FILLER_11, FILLER_12, MK, JENIS_MK, KET_MOHON_A, KET_MOHON_B, KET_MOHON_C,
            KET_MOHON_D, KET_MOHON_E, NAMA, KDRUBAH_NOURUTPLG, NOURUTPLG, NPWP, TARIF, KDPT, KDPT_2, DAYA, KDAYA, PNJ, NAMAPNJ, 
            NOBANG, KETNOBANG, RT, RW, NODLMRT, KETNODLMRT, LINGKUNGAN, KODEPOS, NOTELP, IDENTITAS, NOIDENTITAS, KEPERLUAN, 
            NODENAH_PLG, FILEBLOB, IDPEL_TETANGGA, TGLPDL, TGLLOG, LOGBY, NOPEL
        )
        SELECT 
            NOAGENDA, NO_KOLEKTIF, UNITUP, IDPEL, TGL_106, BANKID, NAMABANK, REFNO, TGLLUNAS_BANK, RP_106, NO_106, NO_REGISTER,
            TGLCATAT, PETUGASCATAT, TGLEDIT, PETUGASEDIT, NOJAMINANINST, TGLJAMINANINST, INSTALATIR, NOSPJBTL, TGLSPJBTL, NOBP, TGLBP,
            RPBP, NOUJL, TGLUJL, RPUJL, KDUJL, FILLER_10, FILLER_11, FILLER_12, MK, JENIS_MK, KET_MOHON_A, KET_MOHON_B, KET_MOHON_C,
            KET_MOHON_D, KET_MOHON_E, NAMA, KDRUBAH_NOURUTPLG, NOURUTPLG, NPWP, TARIF, KDPT, KDPT_2, DAYA, KDAYA, PNJ, NAMAPNJ, 
            NOBANG, KETNOBANG, RT, RW, NODLMRT, KETNODLMRT, LINGKUNGAN, KODEPOS, NOTELP, IDENTITAS, NOIDENTITAS, KEPERLUAN, 
            NODENAH_PLG, FILEBLOB, IDPEL_TETANGGA, TGLPDL, SYSDATE, in_tiket, NOPEL
        FROM BILL52.TRANS_106 
        WHERE NOAGENDA = in_noagenda;

        -- 2. Melakukan update data baru ke skema BILL52
        UPDATE BILL52.TRANS_101
        SET PNJ = in_pnj_101, NOBANG = in_nobang_101, KETNOBANG = in_ketnobang_101
        WHERE NOAGENDA = in_noagenda;
          
        UPDATE BILL52.TRANS_101_PEMOHON
        SET PNJ_PEMOHON = in_pnj_pemohon, NOBANG_PEMOHON = in_nobang_pemohon, KETNOBANG_PEMOHON = in_ketnobang_pemohon
        WHERE NOAGENDA = in_noagenda;
          
        UPDATE BILL52.TRANS_106
        SET PNJ = in_pnj_106, NOBANG = in_nobang_106, KETNOBANG = in_ketnobang_106
        WHERE NOAGENDA = in_noagenda;

        out_rowcount := SQL%ROWCOUNT;

        -- 3. Mencatat aktivitas ke log proses OPHARAPP
        INSERT INTO OPHARAPP.OPHAR_LOG_PROSES (NO_TIKET, JENIS_TRANSAKSI, NO_PELANGGAN, TGLPROSES, PETUGAS)
        VALUES (in_tiket, 'UPDATE PNJ OR NOBANG OR KETNOBANG NULL', in_noagenda, SYSDATE, in_plogin);

        COMMIT;
        msgerror := 'Sukses';
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            msgerror := SQLERRM;
            out_rowcount := 0;
    END save_pnj;

    PROCEDURE save_koreksi_tarif (
        in_plogin     IN  VARCHAR2,
        in_tiket      IN  VARCHAR2,
        in_noagenda   IN  VARCHAR2,
        out_rowcount  OUT NUMBER,
        msgerror      OUT VARCHAR2
    ) IS
        v_jml NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_jml
        FROM BILL52.TRANS_MUTASI_KOREKSI
        WHERE NOAGENDA = in_noagenda;

        IF v_jml = 0 THEN
            msgerror := 'Data tidak ditemukan!';
            out_rowcount := 0;
            RETURN;
        END IF;

        -- 1. Menyimpan backup data log mutasi
        INSERT INTO OPHARAPP.TRANS_MUTASI_KOREKSI_LOG
        SELECT A.*, SYSDATE, in_tiket 
        FROM BILL52.TRANS_MUTASI_KOREKSI A 
        WHERE NOAGENDA = in_noagenda;

        -- 2. Memperbarui tanggal dan petugas peremajaan
        UPDATE BILL52.TRANS_MUTASI_KOREKSI A 
        SET TGLREMAJA = (SELECT TGLPEREMAJAAN FROM BILL52.TRANS_PDL WHERE NOAGENDA = A.NOAGENDA),
            PETUGASREMAJA = (SELECT PEREMAJAANBY FROM BILL52.TRANS_PDL WHERE NOAGENDA = A.NOAGENDA) 
        WHERE NOAGENDA = in_noagenda;

        out_rowcount := SQL%ROWCOUNT;

        -- 3. Mencatat aktivitas ke log proses OPHARAPP
        INSERT INTO OPHARAPP.OPHAR_LOG_PROSES (NO_TIKET, JENIS_TRANSAKSI, NO_PELANGGAN, TGLPROSES, PETUGAS)
        VALUES (in_tiket, 'UPDATE REMAJA KOREKSI TARIF', in_noagenda, SYSDATE, in_plogin);

        COMMIT;
        msgerror := 'Sukses';
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            msgerror := SQLERRM;
            out_rowcount := 0;
    END save_koreksi_tarif;

END PKG_PNJ_NULL;
/
