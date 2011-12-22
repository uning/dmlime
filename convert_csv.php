<?php
/**
 * convert_csv.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2011 Playcrab Corp.
 * All rights reserved.
 *
 * Changelog:
 * 2011-12-16 - created
 *
 */

$files= array('first_property.csv'=> 'FP', 'second_property.csv'=>'SP');
$conf_dir = __DIR__.'/dmdata/';
$conf_js_dir = __DIR__.'/conf/';

foreach( $files  as $f=>$v){
	$outf = $conf_js_dir.$v.'.js';
	$out = "goog.provide('dm.conf.$v');
	dm.conf.$v = ";
	$inf = $conf_dir.$f;
	$gbk = file_get_contents($inf);
	$inf = $conf_dir.$f.'.utf8';
	file_put_contents($inf,iconv('gbk','utf-8',$gbk));




	read_csv($inf,$columns,$rows);
	//$out .= json_encode($rows,JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
	$out .= json_encode($rows);
	file_put_contents($outf,$out);
}


return;
print_r($rows);
print_r($columns);
print_r($rows);
function read_csv($csv_path,&$columns,&$rows,$with_pos_info=false){
	if(!file_exists($csv_path)){
		return;
	}
	$handle=fopen($csv_path,"r");
	$unique_key='id';
	//TODO
	$row = 1;
	$dataDesc = fgetcsv($handle,',');
	$row++;
	$dataKey = fgetcsv($handle,',');
	$row++;
	for($i=0;$i<count($dataDesc);$i++){
		$desc = $dataDesc[$i];
		$desc = str_replace(array('，','；','（','）'),array(',',';','(',')'),$desc);
		$key = $dataKey[$i];
		$key = str_replace('(unique)','',$key,$replace_count);
		if($replace_count){
			$unique_key = $key;
		}
		if($key){
			$columns[$i] = array('desc'=>$desc,'key'=>$key);
			if($with_pos_info){
				$columns[$i]['__sheet'] = $sheet_name;
				$columns[$i]['__column'] = $i+1;
			}
		}else{
		}
	}
	while(!feof($handle)){
		$data = fgetcsv($handle,',');
		$item = array();
		foreach($columns as $i=>&$v){
			$key = $v['key'];
			$value = $data[$i];
			if($value!==''){
				$item[$key]=$value;
			}
		}
		if(isset($item[$unique_key])){
			if($with_pos_info){
				$item['__sheet'] = $sheet_name;
				$item['__row'] = $row;
			}
			$rows[$item[$unique_key]] = $item;
		}else{
		}
		$row++;
	}
	// 处理列描述里面出现 (array, ... ) 信息的列,将数据转换为array
	foreach($columns as $c){
		if(strpos($c['desc'],'(array')!==false){
			foreach($rows as &$r){
				if($r[$c['key']]){
					try{
						$origin_cell_value = $r[$c['key']];
						$description = $c['desc'];
						$r[$c['key']] = read_cell($description,$origin_cell_value);
					}catch(Exception $ex){
						$r[$c['key']] = '';
					}
				}
			}
		}
	}

}


function read_cell($description,$origin_cell_value){
	if($origin_cell_value==''){
		return '';
	}
	//*by tingkun
	if(strpos($description,'(arrayMap')!==false){
		$cell_value = array();
		$origin_cell_value = str_replace(array('，','；'),array(',',';'),$origin_cell_value);
		$arr1 = explode(";",trim($origin_cell_value,';'));
		foreach($arr1 as $i){
			$arr2 = explode(',',$i);
			if(count($arr2)==2){
				$key = $arr2[0];
				$value = $arr2[1];
				$cell_value[$key] = $value;
			}else{
				throw new Exception("[$description] 对应异常的值[$origin_cell_value]");
			}
		}
		return $cell_value;
	}

	preg_match("/.*\(arrayHash(.*?)\)/",$description,$matches);
	// 对于 column_name(array)
	// matches[1] 应该为 null
	// 对于 column_name(array,tag,num)
	// matches[1] 应该为 ,tag,num
	if(isset($matches[1])){
		if($matches[1]){
			$keys = explode(',',trim($matches[1],','));
			// 二维的array
			$origin_cell_value = str_replace(array('，','；'),array(',',';'),$origin_cell_value);
			$istr = trim($origin_cell_value,';');
			$arr2 = explode(',',$istr);
			if(count($arr2)==count($keys)){
				$cell_value = array_combine($keys,$arr2);
			}else{
				throw new Exception("[$description] 对应异常的值[$origin_cell_value]");
			}
			return $cell_value;
		}else{
			// 简单的array
			$cell_value = explode(";",trim(str_replace(array('，','；',','),array(';',';',';'),$origin_cell_value),';'));
			return $cell_value;
		}
	}
	// */

	preg_match("/.*\(array(.*?)\)/",$description,$matches);
	// 对于 column_name(array)
	// matches[1] 应该为 null
	// 对于 column_name(array,tag,num)
	// matches[1] 应该为 ,tag,num
	if(isset($matches[1])){
		if($matches[1]){
			$keys = explode(',',trim($matches[1],','));
			// 二维的array
			$origin_cell_value = str_replace(array('，','；'),array(',',';'),$origin_cell_value);
			$arr1 = explode(";",trim($origin_cell_value,';'));
			$cell_value = array();
			foreach($arr1 as $i){
				$arr2 = explode(',',$i);
				if(count($arr2)==count($keys)){
					$cell_value[] = array_combine($keys,$arr2);
				}else{
					throw new Exception("[$description] 对应异常的值[$origin_cell_value]");
				}
			}
			return $cell_value;
		}else{
			// 简单的array
			$cell_value = explode(";",trim(str_replace(array('，','；',','),array(';',';',';'),$origin_cell_value),';'));
			return $cell_value;
		}
	}
	return $origin_cell_value;
}


