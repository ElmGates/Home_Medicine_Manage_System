<!--此文件已废弃，请使用python的版本或者自行修改使用-->

<?php
require_once '../api/db.php';
require_once '../api/medicine.php';

$api = new MedicineAPI();
$api->checkExpiry(); 