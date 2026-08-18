CREATE OR REPLACE PACKAGE BODY DTKS.pkg_manajemen_user
IS
PROCEDURE proc_get_info_user (in_id_user       VARCHAR2,
                                 in_unitup        VARCHAR2,
                                 --                                 in_role          VARCHAR2,
                                 out_data     OUT SYS_REFCURSOR)
   IS
   BEGIN
      out_data := f$get_info_user (in_id_user, in_unitup);       --, in_role);
   END;

FUNCTION f$get_info_user (in_id_user VARCHAR2, in_unitup VARCHAR2) --, in_role VARCHAR2)
      RETURN SYS_REFCURSOR
   IS
      crut   SYS_REFCURSOR;
   BEGIN
      OPEN crut FOR
           SELECT unitup kodeunit,
                  a.id_user,
                  nama_user,
                  jabatan,
                  alamat_user,
                  leveluser,
                  RTRIM ( (f$getuserroleaktif (a.id_user)), ',') role,
                  email1,
                  no_telp1,
                  disable_user,
                  salahpassword,
                  passwd,
                  tglakhirijin
             FROM DTKS.usertab a, DTKS.usrgroup b
            WHERE a.id_user = b.id_user(+)     
                      --AND (   a.disable_user = 0
                       --OR (a.disable_user = 1 AND a.salahpassword = 1)
                      -- OR (a.disable_user = 1 AND a.passwd LIKE 'NON%'))
                  AND (a.id_user = in_id_user OR a.unitup = in_unitup) -- OR b.id_group = in_role)
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
   END;

PROCEDURE proc_set_kode_unit (in_id_user          VARCHAR2,
                                 in_kode_unit        VARCHAR2,
                                 in_leveluser        VARCHAR2,
                                 in_user_login       VARCHAR2,
                                 in_namafile         VARCHAR2,
                                 out_message     OUT VARCHAR2)
   IS
      v_hasil   INT;
   BEGIN
      v_hasil :=
         f$set_kode_unit (in_id_user,
                          in_kode_unit,
                          in_leveluser,
                          in_user_login,
                          in_namafile,
                          out_message);

      IF v_hasil = 1
      THEN
         COMMIT;
      ELSE
         ROLLBACK;
      END IF;
   END;

FUNCTION f$set_kode_unit (in_id_user          VARCHAR2,
                             in_kode_unit        VARCHAR2,
                             in_leveluser        VARCHAR2,
                             in_user_login       VARCHAR2,
                             in_namafile         VARCHAR2,
                             out_message     OUT VARCHAR2)
      RETURN INT
   IS
      v_hasil       INT;
      p_unitup      VARCHAR2 (6 BYTE);
      p_leveluser   VARCHAR2 (5 BYTE);
   BEGIN
      SELECT COUNT (*)
        INTO v_hasil
        FROM DTKS.usertab
       WHERE id_user = in_id_user;

      IF v_hasil = 0
      THEN
         out_message := 'User tidak ditemukan';
         RETURN v_hasil;
      END IF;

      INSERT INTO DTKS.usertab_log (tgllog,
                               id_user,
                               kdpp,
                               unitup,
                               pk__unitup,
                               nama_user,
                               alamat_user,
                               no_telp1,
                               no_telp2,
                               no_telp3,
                               email1,
                               email2,
                               disable_user,
                               is_builtin,
                               passwd,
                               tglawalijin,
                               tglakhirijin,
                               jamawalijin,
                               jamakhirijin,
                               nip,
                               jenispp,
                               leveluser,
                               tglinsert,
                               userinsert,
                               tglupdate,
                               userupdate,
                               tglubahpassword,
                               masapassword,
                               tglkadaluarsapasswd,
                               flageula,
                               tglflageula,
                               salahpassword,
                               jabatan)
         SELECT SYSDATE,
                id_user,
                kdpp,
                unitup,
                unitup,
                nama_user,
                alamat_user,
                no_telp1,
                no_telp2,
                no_telp3,
                email1,
                email2,
                disable_user,
                is_builtin,
                passwd,
                tglawalijin,
                tglakhirijin,
                jamawalijin,
                jamakhirijin,
                nip,
                jenispp,
                leveluser,
                tglinsert,
                userinsert,
                tglupdate,
                userupdate,
                tglubahpassword,
                masapassword,
                tglkadaluarsapasswd,
                flageula,
                tglflageula,
                salahpassword,
                jabatan
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

      INSERT INTO DTKS.log_update_user (tanggal,
                                   upi,
                                   id_user,
                                   nama_user,
                                   unitup_lama,
                                   unitup_baru,
                                   leveluser_lama,
                                   leveluser_baru,
                                   role_lama,
                                   role_baru,
                                   nama_file,
                                   petugas)
         SELECT SYSDATE tanggal,
                SUBSTR (unitup, 1, 2) upi,
                id_user,
                nama_user,
                p_unitup unitup_lama,
                in_kode_unit unitup_baru,
                p_leveluser leveluser_lama,
                in_leveluser leveluser_baru,
                f$getuserroleaktif (id_user) role_lama,
                f$getuserroleaktif (id_user) role_baru,
                in_namafile nama_file,
                in_user_login petugas
           FROM DTKS.usertab
          WHERE id_user = in_id_user;

      --      COMMIT;
      out_message := 'SUKSES';
      RETURN 1;
   EXCEPTION
      WHEN OTHERS
      THEN
         out_message := SQLERRM;
         RETURN -1;
   END;


END;
/