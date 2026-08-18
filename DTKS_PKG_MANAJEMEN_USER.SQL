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
            SELECT a.unitup kodeunit,
                   a.id_user,
                   a.nama_user,
                   a.jabatan,
                   a.alamat_user,
                   a.leveluser,
                   (SELECT LISTAGG(id_group, ',') WITHIN GROUP (ORDER BY id_group) 
                    FROM DTKS.usrgroup 
                    WHERE id_user = a.id_user) role,
                   a.email1,
                   a.no_telp1,
                   a.disable_user,
                   a.salahpassword,
                   a.passwd,
                   a.tglakhirijin
            FROM DTKS.usertab a
            WHERE (
                  (in_id_user IS NOT NULL AND a.id_user = in_id_user)
                  OR
                  (in_id_user IS NULL AND in_unitup IS NOT NULL AND a.unitup = in_unitup)
              )
            ORDER BY a.unitup;

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
        v_roles       VARCHAR2(1000);
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

        -- Get aggregated roles inline
        SELECT LISTAGG(id_group, ',') WITHIN GROUP (ORDER BY id_group)
        INTO v_roles
        FROM DTKS.usrgroup
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
            v_roles role_lama,
            v_roles role_baru,
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
