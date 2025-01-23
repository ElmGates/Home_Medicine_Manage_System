<?php
header('Content-Type: application/json');

session_start();

// 清除所有会话数据
session_unset();
session_destroy();

echo json_encode([
    'success' => true,
    'message' => '注销成功'
]);