CREATE OR REPLACE PACKAGE DTKS.pkg_manajemen_user AS
    PROCEDURE proc_get_info_user (
        in_id_user    IN  VARCHAR2,
        in_unitup     IN  VARCHAR2,
        out_data      OUT SYS_REFCURSOR
    );

    PROCEDURE proc_set_kode_unit (
        in_id_user       IN  VARCHAR2,
        in_kode_unit     IN  VARCHAR2,
        in_leveluser     IN  VARCHAR2,
        in_user_login    IN  VARCHAR2,
        in_namafile      IN  VARCHAR2,
        out_message      OUT VARCHAR2
    );

    FUNCTION f$getuserroleaktif (
        in_id_user IN VARCHAR2
    ) RETURN VARCHAR2;

    FUNCTION f$get_info_user (
        in_id_user   IN  VARCHAR2,
        in_unitup    IN  VARCHAR2
    ) RETURN SYS_REFCURSOR;

    FUNCTION f$set_kode_unit (
        in_id_user       IN  VARCHAR2,
        in_kode_unit     IN  VARCHAR2,
        in_leveluser     IN  VARCHAR2,
        in_user_login    IN  VARCHAR2,
        in_namafile      IN  VARCHAR2,
        out_message      OUT VARCHAR2
    ) RETURN INT;
END pkg_manajemen_user;
/

CREATE OR REPLACE PACKAGE BODY DTKS.pkg_manajemen_user IS

    FUNCTION f$getuserroleaktif (in_id_user IN VARCHAR2) RETURN VARCHAR2 IS
        sRet VARCHAR2(1000) := '';
    BEGIN
        FOR my IN (SELECT id_user, id_group
                   FROM DTKS.usrgroup
                   WHERE id_user = in_id_user)
        LOOP
            IF my.id_group = 'ADMINF1' THEN
                sRet := sRet || 'ADMINF1,';
            ELSIF my.id_group = 'ADMINF23' THEN
                sRet := sRet || 'ADMINF23,';
            ELSIF my.id_group = 'ADMINF456' THEN
                sRet := sRet || 'ADMINF456,';
            ELSIF my.id_group = 'ADMINPPJ' THEN
                sRet := sRet || 'ADMINPPJ,';
            ELSIF my.id_group = 'ADMIN_KAWASAN' THEN
                sRet := sRet || 'ADMIN_KAWASAN,';
            ELSIF my.id_group = 'ADMIN_NEDYSIS' THEN
                sRet := sRet || 'ADMIN_NEDYSIS,';
            ELSIF my.id_group = 'ADMIN_TAMPER' THEN
                sRet := sRet || 'ADMIN_TAMPER,';
            ELSIF my.id_group = 'ADMIN_TMP' THEN
                sRet := sRet || 'ADMIN_TMP,';
            ELSIF my.id_group = 'ADMIN_VALIDASI_UJL' THEN
                sRet := sRet || 'ADMIN_VALIDASI_UJL,';
            ELSIF my.id_group = 'BPANGSUR' THEN
                sRet := sRet || 'BPANGSUR,';
            ELSIF my.id_group = 'CATERF23' THEN
                sRet := sRet || 'CATERF23,';
            ELSIF my.id_group = 'DIVAGA' THEN
                sRet := sRet || 'DIVAGA,';
            ELSIF my.id_group = 'DMAN' THEN
                sRet := sRet || 'DMAN,';
            ELSIF my.id_group = 'DMPEMASARAN_ROLE' THEN
                sRet := sRet || 'DMPEMASARAN_ROLE,';
            ELSIF my.id_group = 'GERAI' THEN
                sRet := sRet || 'GERAI,';
            ELSIF my.id_group = 'INFOLAP' THEN
                sRet := sRet || 'INFOLAP,';
            ELSIF my.id_group = 'LOKETF1' THEN
                sRet := sRet || 'LOKETF1,';
            ELSIF my.id_group = 'MANAGER' THEN
                sRet := sRet || 'MANAGER,';
            ELSIF my.id_group = 'P2TL' THEN
                sRet := sRet || 'P2TL,';
            ELSIF my.id_group = 'PENAGIHAN' THEN
                sRet := sRet || 'PENAGIHAN,';
            ELSIF my.id_group = 'SAP' THEN
                sRet := sRet || 'SAP,';
            ELSIF my.id_group = 'SATKER' THEN
                sRet := sRet || 'SATKER,';
            ELSIF my.id_group = 'SECMAN' THEN
                sRet := sRet || 'SECMAN,';
            ELSIF my.id_group = 'TEKNIKF1' THEN
                sRet := sRet || 'TEKNIKF1,';
            ELSIF my.id_group = 'WASKIT' THEN
                sRet := sRet || 'WASKIT,';
            ELSIF my.id_group = 'ADMIN_FSO' THEN
                sRet := sRet || 'ADMIN_FSO,';
            ELSIF my.id_group = 'ADMIN_SAR' THEN
                sRet := sRet || 'ADMIN_SAR,';
            ELSIF my.id_group = 'ASMAN' THEN
                sRet := sRet || 'ASMAN_PA,';
            ELSIF my.id_group = 'ADMIN_CMT' THEN
                sRet := sRet || 'ADMIN_CMT,';
            ELSIF my.id_group = 'ADMIN_IMEI_CMT' THEN
                sRet := sRet || 'ADMIN_IMEI_CMT,';
            ELSIF my.id_group = 'ADMIN_MON_CMT' THEN
                sRet := sRet || 'ADMIN_MON_CMT,';
            ELSIF my.id_group = 'EDISON' THEN
                sRet := sRet || 'EDISON,';
            ELSIF my.id_group = 'MANAGER_ROLE' THEN
                sRet := sRet || 'MANAGER_ROLE,';
            END IF;
        END LOOP;
        RETURN sRet;
    END f$getuserroleaktif;

    PROCEDURE proc_get_info_user (
        in_id_user    IN  VARCHAR2,
        in_unitup     IN  VARCHAR2,
        out_data      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        out_data := f$get_info_user(in_id_user, in_unitup);
    END proc_get_info_user;

    FUNCTION f$get_info_user (
        in_id_user   IN  VARCHAR2,
        in_unitup    IN  VARCHAR2
    ) RETURN SYS_REFCURSOR IS
        crut SYS_REFCURSOR;
    BEGIN
        OPEN crut FOR
            SELECT unitup kodeunit,
                   a.id_user,
                   nama_user,
                   jabatan,
                   alamat_user,
                   leveluser,
                   RTRIM(f$getuserroleaktif(a.id_user), ',') role,
                   email1,
                   no_telp1,
                   disable_user,
                   salahpassword,
                   passwd,
                   tglakhirijin
            FROM DTKS.usertab a, DTKS.usrgroup b
            WHERE a.id_user = b.id_user(+)     
              AND (
                  (in_id_user IS NOT NULL AND a.id_user = in_id_user)
                  OR
                  (in_id_user IS NULL AND in_unitup IS NOT NULL AND a.unitup = in_unitup)
              )
            GROUP BY unitup,
                     a.id_user,
                     nama_user,
                     leveluser,
                     jabatan,
                     alamat_user,
                     email1,
                     no_telp1,
                     disable_user,
                     salahpassword,
                     passwd,
                     tglakhirijin
            ORDER BY unitup;

        RETURN crut;
    END f$get_info_user;

    PROCEDURE proc_set_kode_unit (
        in_id_user       IN  VARCHAR2,
        in_kode_unit     IN  VARCHAR2,
        in_leveluser     IN  VARCHAR2,
        in_user_login    IN  VARCHAR2,
        in_namafile      IN  VARCHAR2,
        out_message      OUT VARCHAR2
    ) IS
        v_hasil INT;
    BEGIN
        v_hasil := f$set_kode_unit(
            in_id_user,
            in_kode_unit,
            in_leveluser,
            in_user_login,
            in_namafile,
            out_message
        );

        IF v_hasil = 1 THEN
            COMMIT;
        ELSE
            ROLLBACK;
        END IF;
    END proc_set_kode_unit;

    FUNCTION f$set_kode_unit (
        in_id_user       IN  VARCHAR2,
        in_kode_unit     IN  VARCHAR2,
        in_leveluser     IN  VARCHAR2,
        in_user_login    IN  VARCHAR2,
        in_namafile      IN  VARCHAR2,
        out_message      OUT VARCHAR2
    ) RETURN INT IS
        v_hasil       INT;
        p_unitup      VARCHAR2(6 BYTE);
        p_leveluser   VARCHAR2(5 BYTE);
    BEGIN
        SELECT COUNT(*)
        INTO v_hasil
        FROM DTKS.usertab
        WHERE id_user = in_id_user;

        IF v_hasil = 0 THEN
            out_message := 'User tidak ditemukan';
            RETURN 0;
        END IF;

        INSERT INTO DTKS.usertab_log (
            tgllog, id_user, kdpp, unitup, pk__unitup, nama_user, alamat_user, 
            no_telp1, no_telp2, no_telp3, email1, email2, disable_user, is_builtin, 
            passwd, tglawalijin, tglakhirijin, jamawalijin, jamakhirijin, nip, 
            jenispp, leveluser, tglinsert, userinsert, tglupdate, userupdate, 
            tglubahpassword, masapassword, tglkadaluarsapasswd, flageula, 
            tglflageula, salahpassword, jabatan
        )
        SELECT 
            SYSDATE, id_user, kdpp, unitup, unitup, nama_user, alamat_user, 
            no_telp1, no_telp2, no_telp3, email1, email2, disable_user, is_builtin, 
            passwd, tglawalijin, tglakhirijin, jamawalijin, jamakhirijin, nip, 
            jenispp, leveluser, tglinsert, userinsert, tglupdate, userupdate, 
            tglubahpassword, masapassword, tglkadaluarsapasswd, flageula, 
            tglflageula, salahpassword, jabatan
        FROM DTKS.usertab
        WHERE id_user = in_id_user;

        SELECT unitup, leveluser
        INTO p_unitup, p_leveluser
        FROM DTKS.usertab
        WHERE id_user = in_id_user;

        UPDATE DTKS.usertab
        SET unitup = in_kode_unit,
            leveluser = in_leveluser,
            tglupdate = SYSDATE,
            userupdate = in_user_login
        WHERE id_user = in_id_user;

        INSERT INTO DTKS.log_update_user (
            tanggal, upi, id_user, nama_user, unitup_lama, unitup_baru, 
            leveluser_lama, leveluser_baru, role_lama, role_baru, nama_file, petugas
        )
        SELECT 
            SYSDATE tanggal,
            SUBSTR(unitup, 1, 2) upi,
            id_user,
            nama_user,
            p_unitup unitup_lama,
            in_kode_unit unitup_baru,
            p_leveluser leveluser_lama,
            in_leveluser leveluser_baru,
            f$getuserroleaktif(id_user) role_lama,
            f$getuserroleaktif(id_user) role_baru,
            in_namafile nama_file,
            in_user_login petugas
        FROM DTKS.usertab
        WHERE id_user = in_id_user;

        out_message := 'SUKSES';
        RETURN 1;
    EXCEPTION
        WHEN OTHERS THEN
            out_message := SQLERRM;
            RETURN -1;
    END f$set_kode_unit;

END pkg_manajemen_user;
/
