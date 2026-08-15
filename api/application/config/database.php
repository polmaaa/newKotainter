<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$active_group = "oracle";
$query_builder = TRUE;

$tnsname_oracle = '(DESCRIPTION=
    (LOAD_BALANCE=yes)
    (ADDRESS_LIST=
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.10)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.11)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.12)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.13)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.14)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.15)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.16)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.17)
        (PORT=1521)
      )
    )
    (CONNECT_DATA=
      (SERVER=dedicated)
      (SERVICE_NAME=ap2tdr)
    )
  )';
$tnsname_fso_oracle = '(DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = 10.14.212.11)(PORT = 1521))
    (ADDRESS = (PROTOCOL = TCP)(HOST = 10.14.212.12)(PORT = 1521))
    (LOAD_BALANCE = yes)
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = FSODR)
    )
  )';

$db['oracle'] = array(
	'dsn'      => '',
	'hostname' => $tnsname_oracle,
	'username' => 'POLMASIHOTANG',
	'password' => 'P@ssw0rd666',
	'database' => '',
	'dbdriver' => 'oci8',
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

$db['postgres'] = array(
	'dsn'      => '',
	'hostname' => '10.1.50.167',
	'username' => 'dev_ap2t',
	'password' => 'd3v_4p2t2024',
	'database' => 'ap2t_db',
	'dbdriver' => 'postgre',
	'port'     => 5432,
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

$db['fso_oracle'] = array(
	'dsn'      => '',
	'hostname' => $tnsname_fso_oracle,
	'username' => 'OPHARAPPFSO',
	'password' => 'Opharapp@FSO',
	'database' => '',
	'dbdriver' => 'oci8',
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);

$db['fso_postgres'] = array(
	'dsn'      => '',
	'hostname' => '10.99.20.11',
	'username' => 'fsm',
	'password' => 'fsm@2026',
	'database' => 'fsm',
	'dbdriver' => 'postgre',
	'port'     => 5488,
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE,
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);
