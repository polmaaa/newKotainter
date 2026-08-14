<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------
| DATABASE CONNECTIVITY SETTINGS
| -------------------------------------------------------------------
| This file will contain the settings needed to access your database.
|
| For complete instructions please consult the 'Database Connection'
| page of the User Guide.
|
| -------------------------------------------------------------------
| EXPLANATION OF VARIABLES
| -------------------------------------------------------------------
|
|	['dsn']      The full DSN string describe a connection to the database.
|	['hostname'] The hostname of your database server.
|	['username'] The username used to connect to the database
|	['password'] The password used to connect to the database
|	['database'] The name of the database you want to connect to
|	['dbdriver'] The database driver. e.g.: mysqli.
|			Currently supported:
|				 cubrid, ibase, mssql, mysql, mysqli, oci8,
|				 odbc, pdo, postgre, sqlite, sqlite3, sqlsrv
|	['dbprefix'] You can add an optional prefix, which will be added
|				 to the table name when using the  Query Builder class
|	['pconnect'] TRUE/FALSE - Whether to use a persistent connection
|	['db_debug'] TRUE/FALSE - Whether database errors should be displayed.
|	['cache_on'] TRUE/FALSE - Enables/disables query caching
|	['cachedir'] The path to the folder where cache files should be stored
|	['char_set'] The character set used in communicating with the database
|	['dbcollat'] The character collation used in communicating with the database
|				 NOTE: For MySQL and MySQLi databases, this setting is only used
| 				 as a backup if your server is running PHP < 5.2.3 or MySQL < 5.0.7
|				 (and in table creation queries made with DB Forge).
| 				 There is an incompatibility in PHP with mysql_real_escape_string() which
| 				 can make your site vulnerable to SQL injection if you are using a
| 				 multi-byte character set and are running versions lower than these.
| 				 Sites using Latin-1 or UTF-8 database character set and collation are unaffected.
|	['swap_pre'] A default table prefix that should be swapped with the dbprefix
|	['encrypt']  Whether or not to use an encrypted connection.
|	['compress'] Whether or not to use client compression (MySQL only)
|	['stricton'] TRUE/FALSE - forces 'Strict Mode' connections
|							- good for ensuring strict SQL while developing
|	['failover'] array - A array with 0 or more data for connections if the main should fail.
|	['save_queries'] TRUE/FALSE - Whether to "save" all executed queries.
| 				NOTE: Disabling this will also effectively disable both
| 				$this->db->last_query() and profiling of DB queries.
| 				When you run a query, with this setting set to TRUE (default),
| 				CodeIgniter will store the SQL statement for debugging purposes.
| 				However, this may cause high memory usage, especially if you run
| 				a lot of SQL queries ... disable this to avoid that problem.
|
| The $active_group variable lets you choose which connection group to
| make active.  By default there is only one group (the 'default' group).
|
| The $query_builder variables lets you determine whether or not to load
| the query builder class.
*/

$active_group = "pblmig";
$active_record = TRUE;

//$tnsname = '(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST =10.14.158.10)(PORT = 1521))(CONNECT_DATA =(SERVER = DEDICATED)(SERVICE_NAME = AP2T)))';  jangan dipake 

// $tnsname = '(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST =192.168.10.24)(PORT = 1521))(CONNECT_DATA =(SERVER = DEDICATED)(SERVICE_NAME = cisqa)))';
//$tnsname = '(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST =10.68.35.15)(PORT = 1597))(CONNECT_DATA =(SERVER = DEDICATED)(SERVICE_NAME = AP2T)))';

//$tnsname = '(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST =10.68.35.15)(PORT = 1581))(CONNECT_DATA =(SERVER = DEDICATED)(SERVICE_NAME = AP2T)))';
//$tnsname = '(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST =192.168.72.27)(PORT = 1521))(CONNECT_DATA =(SERVER = DEDICATED)(SERVICE_NAME = AP2TDR)))';

$tnsname_gandul = 
  '(DESCRIPTION=
    (LOAD_BALANCE=yes)
    (ADDRESS_LIST=
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.10)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.11)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.12)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.13)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.14)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.15)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.16)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.17)
        (PORT=1521)
      )
    )
    (CONNECT_DATA=
      (SERVER=dedicated)
      (SERVICE_NAME=ap2t)
    )
  )';
  
$tnsname_truno = 
  '(DESCRIPTION=
    (LOAD_BALANCE=yes)
    (ADDRESS_LIST=
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.10)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.11)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.12)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.13)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.14)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.15)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.16)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.17)
        (PORT=1521)
      )
    )
    (CONNECT_DATA=
      (SERVER=dedicated)
      (SERVICE_NAME=ap2tdr)
    )
  )';
  
$db['pblmig']['hostname'] = $tnsname_gandul;
//$db['pblmig']['hostname'] = $tnsname_truno;
$db['pblmig']['username'] = 'OPHARAPP';
//$db['pblmig']['password'] = 'Or4n4n4k';
$db['pblmig']['password'] = 'MyH3arW1llG00n';
//$db['pblmig']['password'] = '300km/jam';
// $db['pblmig']['username'] = 'MONAP2T';
// $db['pblmig']['password'] = 'icon+123';
$db['pblmig']['database'] = '';
$db['pblmig']['dbdriver'] = 'oci8';
$db['pblmig']['dbprefix'] = '';
$db['pblmig']['pconnect'] = FALSE;
$db['pblmig']['db_debug'] = TRUE;
$db['pblmig']['cache_on'] = FALSE;
$db['pblmig']['cachedir'] = '';
$db['pblmig']['char_set'] = 'utf8';
$db['pblmig']['dbcollat'] = 'utf8_general_ci';
$db['pblmig']['swap_pre'] = '';
$db['pblmig']['encrypt'] = FALSE;
$db['pblmig']['compress'] = FALSE;
$db['pblmig']['failover'] = array();
$db['pblmig']['autoinit'] = TRUE;
$db['pblmig']['save_queries'] = TRUE;
$db['pblmig']['stricton'] = FALSE;

