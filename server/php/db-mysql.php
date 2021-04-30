<?php

class DB 
{
  
  static $dataCache = array();
  static $link = false;
  static $lastQuery = '';
  static $keyDef = array();
  static $affectedRows = 0;
  static $writeOps = 0;
  static $readOps = 0;
  static $track_changes_in_tables = array();
    
  static function isConnected()
  {
    return(is_resource(self::$link));
  }

  static function connect()
  {
    if(self::$link) return;
    self::$link = mysqli_connect(cfg('db/host'), cfg('db/user'), cfg('db/password'), cfg('db/database'), ini_get("mysqli.default_port"), cfg('db/socket')) or
      critical('The database connection to server '.cfg('db/user').'@'.cfg('db/host').
        ' could not be established (code: '.@mysqli_connect_errno(self::$link).': '.@mysqli_connect_error(self::$link).')');
    #if(mysqli_character_set_name(self::$link) != 'utf8') 
    mysqli_set_charset(self::$link, 'utf8mb4');
    self::$track_changes_in_tables = cfg('track-changes');
    Profiler::Log('DB::Connect() done');
  }
  
  static function Update($table, $searchCriteria, $updateFields)
  {
    self::$writeOps++;
    DB::Query('UPDATE #'.DB::Safe($table).'
      SET '.DB::MakeSetList($updateFields).'
      WHERE '.DB::MakeSetList($searchCriteria, ' AND '));
  }
    
  static function GetCached($query, $parameters = null)
  {
    $cacheKey = 'dbq-'.md5($query.json_encode($parameters));
    $result = Cache::Get($cacheKey);
    if(!$result)
    {
      $result = self::Get($query, $parameters);
      Cache::Set($cacheKey, $result);
    }
    return($result);
  }

  # get a list of datasets matching the $query
  static function Get($query, $parameters = null)
  {
    self::$readOps++;
    $result = array();
  
    $query = self::ParseQueryParams($query, $parameters);
  
    $lines = mysqli_query(self::$link, $query) or critical(mysqli_error(self::$link).' {query: '.$query.' }');
  
    while ($line = mysqli_fetch_array($lines, MYSQLI_ASSOC))
    {
      if (isset($keyByField))
        $result[$line[$keyByField]] = $line;
      else
        $result[] = $line;
    }
    mysqli_free_result($lines);

    return $result;
  }
  
  # gets a list of keys for the table
  static function Keys($otablename)
  {
    $tablename = self::CheckTableName($otablename);
    
    if(isset(self::$keyDef[$otablename]))
      return(self::$keyDef[$otablename]);
      
    self::$readOps++;
    $result = array();
    $sql = 'SHOW KEYS FROM `'.$tablename.'`';
    $res = mysqli_query(self::$link, $sql) or critical('Cannot get keys // '.mysqli_error(self::$link));
      
    while ($row = @mysqli_fetch_assoc($res))
    {
      if ($row['Key_name']=='PRIMARY')
        array_push($result, $row['Column_name']);
    }
    
    self::$keyDef[$otablename] = $result;
    return($result);
  }
  
  # get column info for $table
  static function Info($table)
  {
    self::$readOps++;
    $result = array();
    foreach(self::Get('SHOW FULL COLUMNS FROM #'.$table) as $fld)
    {
      $ds = array();
      foreach($fld as $k => $v)
      {
        $k = strtolower($k);
        if($k == 'comment')
        {
          $p = explode(',', $v);
          $v = false;
          if(sizeof($p) > 0) foreach($p as $pi)
          {
            $pk = trim(nibble('=', $pi));
            $ds['_'.$pk] = trim($pi);
          }
        }
        if($v) 
          $ds[$k] = $v;
      }
      $ds['caption'] = first($ds['_title'], $ds['field']);
      $result['fields'][$ds['field']] = $ds;
    }
    $result['info'] = $extInfo;
    return($result);  
  }
  
  # updates/creates the $dataset in the $tablename
  static function Insert($otablename, $dataset)
  {
    self::$writeOps++;
    $tablename = self::CheckTableName($otablename);
    $cache_entry = $tablename.':'.$keyname.':'.$keyvalue;

    $query='INSERT INTO '.$tablename.' ('.DB::MakeNamesList($dataset).
        ') VALUES('.DB::MakeValuesList($dataset).')';
        
    mysqli_query(self::$link, $query) or critical(mysqli_error(self::$link).'{ '.$query.' }');
    self::$affectedRows += mysqli_affected_rows(self::$link);
    return(mysqli_insert_id(self::$link));
  }
  
  # updates/creates the $dataset in the $tablename
  static function InsertQuery($otablename, $dataset)
  {
    self::$writeOps++;
    $tablename = self::CheckTableName($otablename);
    $cache_entry = $tablename.':'.$keyname.':'.$keyvalue;

    $query='INSERT INTO '.$tablename.' ('.DB::MakeNamesList($dataset).
        ') VALUES('.DB::MakeValuesList($dataset).')';
        
    return($query);
  }
  
  # updates/creates the $dataset in the $tablename
  static function Commit($otablename, &$dataset)
  {
    self::$writeOps++;
    $tablename = self::CheckTableName($otablename);
    $keynames = self::Keys($tablename);
    $keyname = $keynames[0]; 
    $keyvalue = $dataset[$keyname];
    
    $cache_entry = $tablename.':'.$keyname.':'.$keyvalue;
    $oldData = self::$dataCache[$cache_entry];
    unset(self::$dataCache[$cache_entry]);
    
    $query='REPLACE INTO '.$tablename.' ('.DB::MakeNamesList($dataset).
        ') VALUES('.DB::MakeValuesList($dataset).');';

    # keeping this around just in case, but performance seems the same:
    # $query='INSERT INTO '.$tablename.' ('.DB::MakeNamesList($dataset).
    #    ') VALUES('.DB::MakeValuesList($dataset).') 
    #    ON DUPLICATE KEY UPDATE '.DB::MakeSetList($dataset).';';
        
    mysqli_query(self::$link, $query) or critical(mysqli_error(self::$link).' { '.$query.' }');
    $dataset[$keyname] = first($dataset[$keyname], mysqli_insert_id(self::$link));
    self::$dataCache[$cache_entry] = $dataset;
    
    return($dataset[$keyname]);
  }  
  
  static function GetDSMatch($table, $matchOptions, $fillIfEmpty = true)
  {
    self::$writeOps++;
    $where = array('1');
    foreach($matchOptions as $k => $v)
      $where[] = '('.$k.'="'.DB::Safe($v).'")';
    $iwhere = implode(' AND ', $where);
  	$query = 'SELECT * FROM '.self::CheckTableName($table).
      ' WHERE '.$iwhere;
    $resultDS = self::GetDSWithQuery($query);
    if ($fillIfEmpty && sizeof($resultDS) == 0)
      foreach($matchOptions as $k => $v)
        $resultDS[$k] = $v;
    
    return($resultDS);
  }
    
  # from table $tablename, get dataset with key $keyvalue
  static function GetDS($tablename, $keyvalue, $keyname = '', $options = array())
  {
    if($keyvalue == '0') return(array());
    $fields = @$options['fields'];
    $fields = first($fields, '*'); 
    if (!self::$link) return(array());
  
    self::CheckTableName($tablename);
    if ($keyname == '')
    {
      $keynames = self::Keys($tablename);
      $keyname = $keynames[0];
    }
    
    $cache_entry = $tablename.':'.$keyname.':'.$keyvalue;
    if(isset(self::$dataCache[$cache_entry])) return(self::$dataCache[$cache_entry]);
  
    $query = 'SELECT '.$fields.' FROM '.$tablename.' '.$options['join'].' WHERE '.$keyname.'="'.DB::Safe($keyvalue).'";';
    $queryResult = mysqli_query(self::$link, $query) or critical(mysqli_error(self::$link).' { Query: "'.$query.'" }');
  
    if ($line = @mysqli_fetch_array($queryResult, MYSQLI_ASSOC))
    {
      mysqli_free_result($queryResult);
      self::$dataCache[$cache_entry] = $line;
      return($line);    
    }
    else
      $result = array();
  
    self::$readOps++;
    return($result);
  }  

  static function RemoveDS($tablename, $keyvalue, $keyname = null)
  {
    self::CheckTableName($tablename);
    if ($keyname == null)
    {
      $keynames = self::Keys($tablename);
      $keyname = $keynames[0];
    }
    $res = (mysqli_query(self::$link, 'DELETE FROM '.$tablename.' WHERE '.$keyname.'="'.
      DB::Safe($keyvalue).'";')
        or critical(' Cannot remove dataset // '.mysqli_error(self::$link)));
    
    self::$affectedRows += mysqli_affected_rows(self::$link);
    self::$writeOps++;
    return($res);
  }  

  // retrieve dataset identified by SQL $query
  static function GetDSWithQuery($query, $parameters = null)
  {
    $query = self::ParseQueryParams($query, $parameters);
  
    $queryResult = mysqli_query(self::$link, $query);
    
    if(!$queryResult) 
      return(critical('Error getting data // '.mysqli_error(self::$link).'{ '.$query.' }'));
  
  	if ($line = mysqli_fetch_array($queryResult, MYSQLI_ASSOC))
    {
      $result = $line;
      mysqli_free_result($queryResult);
    }
    else
      $result = array();

    self::$readOps++;
    return($result);
  }
  
  # execute a simple update $query
  static function Query($query, $parameters = null)
  {
    $query = self::parseQueryParams($query, $parameters);
    if (substr($query, -1, 1) == ';')
      $query = substr($query, 0, -1);
    $result = (mysqli_query(self::$link, $query)
      or critical(' Query error // '.mysqli_error(self::$link)));

    self::$affectedRows += mysqli_affected_rows(self::$link);
    self::$writeOps++;
    return($result);
  }  

  # create a comma-separated list of keys in $dataset
  static function MakeNamesList(&$dataset)
  {
    $result = '';
    if (sizeof($dataset) > 0)
      foreach (array_keys($dataset) as $k)
      {
        if ($k!='')
          $result = $result.','.$k;
      }
    return(substr($result, 1));
  }
  
  # make a name-value list for UPDATE-queries
  static function MakeValuesList(&$dataset)
  {
    $result = '';
    if (sizeof($dataset) > 0)
      foreach ($dataset as $k => $v)
      {
        if ($k!='')
          $result = $result.',"'.DB::safe($v).'"';
      }
    return(substr($result, 1));
  }  
    
  static function MakeSetList(&$dataset, $concat = ', ')
  {
    $result = array();
    if (sizeof($dataset) > 0) foreach ($dataset as $k => $v)
    {
      if(substr($k, -1) == '+' || substr($k, -1) == '-')
      {
        $op = substr($k, -1);
        $k = substr($k, 0, -1);
        $result[] = $k.' = '.$k.' '.$op.' "'.DB::safe($v).'"';
      }
      else
      {
        $result[] = $k.' = "'.DB::safe($v).'"';
      }
    }
    return(implode($concat, $result));
  }  
    
  static function ParseQueryParams($query, $parameters = null)
  {
    if ($parameters != null)
    {
      $pctr = 0;
      $result = '';
      for($a = 0; $a < strlen($query); $a++)
      {
        $chr = substr($query, $a, 1);
        if ($chr == '?')
        {
          $result .= '"'.DB::Safe($parameters[$pctr]).'"';
          $pctr++;
        }
        else if ($chr == '&')
        {
          $result .= ''.intval($parameters[$pctr]).'';
          $pctr++;
        }
        else if ($chr == ':')
        {
          $paramName = '';
          $a += 1;
          $pFormat = 'string';
          if($query[$a] == ':') 
          {
            $pFormat = 'number';
            $a += 1;
          }
          while(!ctype_space($chr = substr($query, $a, 1)) && $a < strlen($query))
          {
            $paramName .= $chr;
            $a += 1;
          }
          if($pFormat == 'number')
            $result .= ' '.($parameters[$paramName]+0).' ';
          else
            $result .= ' "'.DB::Safe($parameters[$paramName]).'" ';
        }
        else
          $result .= $chr;
      }
    }
    else
      $result = $query;      
    $q = str_replace('#', cfg('db/prefix'), $result);
    self::$lastQuery = $q;
    return($q);
  }
 
  static function Safe($raw)
  {
    if(!isset(self::$link))
      return(addslashes($raw));
    else
      return(mysqli_real_escape_string(self::$link, $raw));
  }

  static function CheckTableName(&$table, $makeSafe = true)
  {
  	$prefix = cfg('db/prefix');
    $len = strlen($prefix);
    if (substr($table, 0, $len) != $prefix)
      $table = $prefix.$table;
    if($makeSafe)
      $table = mysqli_real_escape_string(self::$link, $table);
    return($table);
  }


}

