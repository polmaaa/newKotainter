CREATE OR REPLACE PACKAGE OPHARAPP.DTKS_MANAJEMEN_USER AUTHID CURRENT_USER AS
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
END DTKS_MANAJEMEN_USER;
/

CREATE OR REPLACE PACKAGE BODY OPHARAPP.DTKS_MANAJEMEN_USER IS

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
                    FROM SECMAN.usrgroup 
                    WHERE id_user = a.id_user) role,
                   a.email1,
                   a.no_telp1,
                   a.disable_user,
                   a.salahpassword,
                   a.passwd,
                   a.tglakhirijin
            FROM SECMAN.usertab a
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
        v_nama_user   VARCHAR2(100);
    BEGIN
        SELECT COUNT(*)
        INTO v_hasil
        FROM SECMAN.usertab
        WHERE id_user = in_id_user;

        IF v_hasil = 0 THEN
            out_message := 'User tidak ditemukan';
            RETURN 0;
        END IF;

        -- Fetch user details beforehand
        SELECT unitup, leveluser, nama_user
        INTO p_unitup, p_leveluser, v_nama_user
        FROM SECMAN.usertab
        WHERE id_user = in_id_user;

        -- Get aggregated roles inline
        SELECT LISTAGG(id_group, ',') WITHIN GROUP (ORDER BY id_group)
        INTO v_roles
        FROM SECMAN.usrgroup
        WHERE id_user = in_id_user;

        -- 1. Insert backup into SECMAN.usertab_log using EXECUTE IMMEDIATE to bypass compile-time privileges
        EXECUTE IMMEDIATE '
            INSERT INTO SECMAN.usertab_log (
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
            FROM SECMAN.usertab
            WHERE id_user = :1
        ' USING in_id_user;

        -- 2. Update active user table
        EXECUTE IMMEDIATE '
            UPDATE SECMAN.usertab
            SET unitup = :1,
                leveluser = :2,
                tglupdate = SYSDATE,
                userupdate = :3
            WHERE id_user = :4
        ' USING in_kode_unit, in_leveluser, in_user_login, in_id_user;

        -- 3. Insert into SECMAN.log_update_user
        EXECUTE IMMEDIATE '
            INSERT INTO SECMAN.log_update_user (
                tanggal, upi, id_user, nama_user, unitup_lama, unitup_baru, 
                leveluser_lama, leveluser_baru, role_lama, role_baru, nama_file
            ) VALUES (
                SYSDATE, SUBSTR(:1, 1, 2), :2, :3, :4, :5, :6, :7, :8, :9, :10
            )
        ' USING p_unitup, in_id_user, v_nama_user, p_unitup, in_kode_unit, p_leveluser, in_leveluser, v_roles, v_roles, in_namafile;

        -- 4. Insert log into OPHARAPP.DTKS_LOG_PROSES
        EXECUTE IMMEDIATE '
            INSERT INTO OPHARAPP.DTKS_LOG_PROSES (
                NO_TIKET, JENIS_TRANSAKSI, NO_PELANGGAN, TGLPROSES, UNITUPI, LOGIN
            ) VALUES (
                :1, :2, :3, SYSDATE, :4, :5
            )
        ' USING TO_NUMBER(NVL(REGEXP_REPLACE(in_namafile, '[^0-9]'), TO_CHAR(SYSDATE, 'YYMMDDHH24MISS'))),
                'Ubah Kode Unit',
                'id_user: ' || in_id_user,
                TO_NUMBER(SUBSTR(in_kode_unit, 1, 2)),
                in_user_login;

        out_message := 'SUKSES';
        RETURN 1;
    EXCEPTION
        WHEN OTHERS THEN
            out_message := SQLERRM;
            RETURN -1;
    END f$set_kode_unit;

END DTKS_MANAJEMEN_USER;
/
