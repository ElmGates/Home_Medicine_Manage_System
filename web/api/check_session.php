<?php
header('Content-Type: application/json');

session_start();

if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    require_once 'db.php';
    $db = new Database();
    $pdo = $db->getConnection();
    
    try {
        $stmt = $pdo->prepare('SELECT id, username, is_admin FROM users WHERE id = ? AND username = ?');
        $stmt->execute([$_SESSION['user_id'], $_SESSION['username']]);
        $user = $stmt->fetch();
        
        if (!$user) {
            // 会话信息与数据库不匹配
            session_destroy();
            throw new Exception('会话验证失败');
        }
        
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'is_admin' => (bool)$user['is_admin']
            ]
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => '未登录'
    ]);
}