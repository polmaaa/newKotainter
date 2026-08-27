CREATE OR REPLACE PACKAGE OPHARAPP.DTKS_OPHAR_TRANS AS
    FUNCTION get_transaksi_pdl (
        p_idpel       IN  bill52.trans_pdl.idpel%type,
        plogin        IN  VARCHAR2,
        out_rowcount  OUT NUMBER,
        out_data      OUT SYS_REFCURSOR,
        out_message   OUT VARCHAR2
    ) RETURN INT;

    FUNCTION get_detiltransaksi_pdl (
        p_noagenda    IN  bill52.trans_pdl.nomorpdl%type,
        p_idpel       IN  bill52.trans_pdl.idpel%type,
        out_data      OUT SYS_REFCURSOR,
        out_rowcount  OUT NUMBER,
        out_message   OUT VARCHAR2
    ) RETURN INT;

    PROCEDURE get_simpantrans_pdl (
        P_IDPEL       IN  bill52.trans_pdl.IDPEL%type,
        p_noagenda    IN  bill52.trans_pdl.noagenda%type,
        p_postingpdl  IN  bill52.trans_pdl.postingpdl%type,
        p_thblangs1a  IN  bill52.trans_pdl.thblangs1a%type,
        p_PNJ         IN  bill52.trans_pdl.PNJ%type,
        p_NAMAPNJ     IN  bill52.trans_pdl.NAMAPNJ%type,
        p_KDPROV      IN  bill52.trans_pdl.KD_PROV%type,
        p_KDKAB       IN  bill52.trans_pdl.KD_KAB%type,
        p_KDKEC       IN  bill52.trans_pdl.KD_KEC%type,
        p_KDKEL       IN  bill52.trans_pdl.KD_KEL%type,
        p_PEMDA       IN  bill52.trans_pdl.PEMDA%type,
        p_NOBANG      IN  bill52.trans_pdl.NOBANG%type,
        p_KETNOBANG   IN  bill52.trans_pdl.KETNOBANG%type,
        p_thblmut     IN  bill52.trans_pdl.THBLMUT%type,
        p_unitupi     IN  bill52.unitupi.unitupi%type,
        p_unitap      IN  bill52.unitap.unitap%type,
        p_unitup      IN  bill52.unitup.unitup%type,
        p_nopdl       IN  bill52.trans_pdl.nomorpdl%type,
        plogin        IN  VARCHAR2,
        pno_tiket     IN  NUMBER,
        pjns_trans    IN  VARCHAR2,
        out_rowcount  OUT NUMBER,
        msgerror      OUT VARCHAR2
    );
END DTKS_OPHAR_TRANS;
/

CREATE OR REPLACE PACKAGE BODY OPHARAPP.DTKS_OPHAR_TRANS
IS

FUNCTION get_transaksi_pdl (
     p_idpel   bill52.trans_pdl.idpel%type
    ,plogin in varchar2
    ,out_rowcount out number
    ,out_data out sys_refcursor
    ,out_message out varchar2) RETURN INT
is
v_jml number;
begin

  select count(*) into v_jml from bill52.trans_pdl where idpel=p_idpel;

  if v_jml < 1 then
      out_message := 'Maaf idpel tidak ditemukan';
      return 0;
  else
      open out_data for
          select
              unitupi,
              unitap,
              unitup,
              noagenda,
              idpel,
              thblmut,
              a.nomorpdl,
              POSTINGPDL
          from bill52.trans_pdl a where idpel=p_idpel;
      out_rowcount  := sql%rowcount;
      if out_rowcount >= 1 then
          out_message := 'SUKSES';   
          return 1;
      else
          out_message := 'Maaf data tidak ditemukan';
          return -1;
      end if;
  end if;  
      
exception when others then
    out_message := sqlerrm;
    return -1;
END;

FUNCTION get_detiltransaksi_pdl (
     p_noagenda   bill52.trans_pdl.nomorpdl%type
    ,p_idpel   bill52.trans_pdl.idpel%type
    ,out_data out sys_refcursor
    ,out_rowcount out number
    ,out_message out varchar2) RETURN INT
is
v_jml number;
begin

    select count(*) into v_jml from bill52.trans_pdl where (noagenda=p_noagenda or noagenda is null) and postingpdl<>3;

    if v_jml <1 then
        out_message := 'Maaf NoAgenda tidak ditemukan';
        return -1;
    else
        open out_data for
            select
                UNITUPI,
                UNITAP,
                UNITUP ,
                NOAGENDA,
                NOMORPDL,
                IDPEL ,
                JENIS_MK ,
                THBLMUT,
                POSTINGPDL ,
                TGLRUBAH_MK,
                TGLPEREMAJAAN,
                PNJ,
                NAMAPNJ,
                --START
                KD_PROV, KD_KAB, KD_KEC, KD_KEL, PEMDA,
                --END
                NOBANG,
                KETNOBANG,
                KDJENIS_SL,
                THBLANGS1A
            from bill52.trans_pdl where nomorpdl=p_noagenda and idpel=p_idpel;

        out_rowcount  := sql%rowcount;
        if out_rowcount =1 then
            out_message := 'SUKSES';
        else
            out_message := 'Maaf data tidak ditemukan';
        end if;

        return 1;
    end if;
exception when others then
    out_message := sqlerrm;
    return -1;
END;


procedure get_simpantrans_pdl (
      P_IDPEL in  bill52.trans_pdl.IDPEL%type
     ,p_noagenda in  bill52.trans_pdl.noagenda%type
     ,p_postingpdl in  bill52.trans_pdl.postingpdl%type
     ,p_thblangs1a in  bill52.trans_pdl.thblangs1a%type
     ,p_PNJ        in  bill52.trans_pdl.PNJ%type
     ,p_NAMAPNJ    in  bill52.trans_pdl.NAMAPNJ%type
     --START
     ,p_KDPROV    in  bill52.trans_pdl.KD_PROV%type
     ,p_KDKAB    in  bill52.trans_pdl.KD_KAB%type
     ,p_KDKEC    in  bill52.trans_pdl.KD_KEC%type
     ,p_KDKEL    in  bill52.trans_pdl.KD_KEL%type
     ,p_PEMDA    in  bill52.trans_pdl.PEMDA%type
     --END
     ,p_NOBANG     in  bill52.trans_pdl.NOBANG%type
     ,p_KETNOBANG  in  bill52.trans_pdl.KETNOBANG%type
     ,p_thblmut    in  bill52.trans_pdl.THBLMUT%type
     ,p_unitupi    in  bill52.unitupi.unitupi%type
     ,p_unitap     in  bill52.unitap.unitap%type
     ,p_unitup     in  bill52.unitup.unitup%type
     ,p_nopdl     in  bill52.trans_pdl.nomorpdl%type
     ,plogin in varchar2
     ,pno_tiket  in number
     ,pjns_trans in varchar2
     ,out_rowcount out number, msgerror out varchar2)
as
    vcount number:=0;
    Vnopdl  bill52.trans_pdl.nomorpdl%type;
    Vjnsmk  bill52.trans_pdl.JENIS_MK%type;
    vtglentripdl  bill52.trans_pdl.tglentripdl%type;   
    vtglcatat  bill52.trans_pdl.tglcatat%type;
    vcatatby  bill52.trans_pdl.catatby%type;
begin
    begin
        INSERT INTO OPHARAPP.DTKS_LOG_PROSES
              (NO_TIKET,
               JENIS_TRANSAKSI,
               NO_PELANGGAN,
               TGLPROSES,
               UNITUPI,
               LOGIN,
               DB_SESSION)
        VALUES (pno_tiket,
               pjns_trans,
               NVL2(p_noagenda, 'noagenda: ' || p_noagenda || ', idpel: ' || P_IDPEL, 'idpel: ' || P_IDPEL),
               sysdate,
               TO_NUMBER(NVL(REGEXP_REPLACE(p_unitupi, '[^0-9]'), '0')),
               plogin,
               'ORACLE');
        out_rowcount  := sql%rowcount;
    end;

    if out_rowcount=1 then
        if p_noagenda is null then
            select jenis_mk,tglentripdl into Vjnsmk,vtglentripdl from bill52.trans_pdl a where idpel=p_idpel and nomorpdl=p_nopdl;
        else
            select jenis_mk,tglentripdl into Vjnsmk,vtglentripdl from bill52.trans_pdl where idpel=p_idpel and nomorpdl=p_nopdl and noagenda=p_noagenda;
        end if;
        
        insert into OPHAR_TRANS_PDL_LOG (
             NOMORPDL,
             thblmut,
             IDPEL,
             noagenda ,
             postingpdl ,
             thblangs1a,
             PNJ,
             NAMAPNJ,
             --START
             KD_PROV, KD_KAB, KD_KEC, KD_KEL, PEMDA,
             --END
             NOBANG,
             KETNOBANG,
             jenis_mk,
             tglentripdl,
             tglcatat,
             catatby,
             unitupi,
             unitap,
             unitup,
             TGL_LOG,
             NO_TIKET
             )
          values(
             p_nopdl,
             p_thblmut,
             P_IDPEL,
             p_noagenda ,
             p_postingpdl ,
             p_thblangs1a,
             P_PNJ,
             p_NAMAPNJ,
             --START
             p_KDPROV, p_KDKAB, p_KDKEC, p_KDKEL, p_PEMDA,
             --END
             p_NOBANG,
             p_KETNOBANG,
             Vjnsmk,
             vtglentripdl,
             sysdate,
             plogin,
             p_unitupi,
             p_unitap,
             p_unitup,
             SYSDATE,
             pno_tiket);

        out_rowcount  := sql%rowcount;
        if out_rowcount=1 then
            if p_noagenda is not null then
                Update bill52.trans_pdl set
                          unitupi=p_unitupi,
                          unitap=p_unitap,
                          unitup= p_unitup,
                          thblangs1a=p_thblangs1a,
                          postingpdl=p_postingpdl,
                          PNJ=p_PNJ,
                          NAMAPNJ=p_NAMAPNJ,
                          --START
                          KD_PROV=p_KDPROV,
                          KD_KAB=p_KDKAB,
                          KD_KEC=p_KDKEC,
                          KD_KEL=p_KDKEL,
                          PEMDA=p_PEMDA,
                          --END
                          NOBANG=p_NOBANG,
                          KETNOBANG= p_KETNOBANG
                 where IDPEL=P_IDPEL and nomorpdl=p_nopdl and idpel=p_idpel;
            else
                Update bill52.trans_pdl set
                          unitupi=p_unitupi,
                          unitap=p_unitap,
                          unitup= p_unitup,
                          thblangs1a=p_thblangs1a,
                          postingpdl=p_postingpdl,
                          PNJ=p_PNJ,
                          NAMAPNJ=p_NAMAPNJ,
                          --START
                          KD_PROV=p_KDPROV,
                          KD_KAB=p_KDKAB,
                          KD_KEC=p_KDKEC,
                          KD_KEL=p_KDKEL,
                          PEMDA=p_PEMDA,
                          --END
                          NOBANG=p_NOBANG,
                          KETNOBANG= p_KETNOBANG
                 where IDPEL=P_IDPEL AND nomorpdl=p_nopdl;
            end if;
            
            out_rowcount  := sql%rowcount;
            if out_rowcount=1 then
                commit;
                msgerror := 'SUKSES';
            ELSE
                rollback;
                msgerror := 'GAGAL Update Trans PDL';
            END IF;
        else
            rollback;
            msgerror := 'GAGAL Insert Detail Log';
        end if;
    else
        rollback;
        msgerror := 'GAGAL Insert Log Proses';
    end if;

exception
when others then
    begin
        out_rowcount := 0;
        msgerror := sqlerrm;
        rollback;
        return;
    end;
END;

end DTKS_OPHAR_TRANS;
/