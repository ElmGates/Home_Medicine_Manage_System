<?php
header('Content-Type: application/json');

require_once 'db.php';

try {
    // 获取POST数据
    $data = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data');
    }

    if (!isset($data['username']) || !isset($data['password'])) {
        throw new Exception('用户名和密码不能为空');
    }

    $username = $data['username'];
    $password = $data['password'];

    $db = new Database();
    $pdo = $db->getConnection();

    $stmt = $pdo->prepare('SELECT id, username, password_hash, is_admin FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        session_start();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        
        echo json_encode([
            'success' => true,
            'message' => '登录成功',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'is_admin' => $user['is_admin']
            ]
        ]);
    } else {
        throw new Exception('用户名或密码错误');
    }
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => '数据库连接失败，请稍后重试'
    ]);
} catch (Exception $e) {
    error_log('Login error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}