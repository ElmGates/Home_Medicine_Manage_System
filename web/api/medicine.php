<?php
require_once 'db.php';
require_once 'webhook.php';

header('Content-Type: application/json');

class MedicineAPI {
    private $db;
    private $webhook;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->webhook = new Webhook();
    }
    
    // 获取药品列表
    public function getMedicines($search = '') {
        try {
            $sql = "SELECT * FROM medicines";
            
            if ($search) {
                $sql .= " WHERE name LIKE ? OR batch_number LIKE ? OR location LIKE ? OR notes LIKE ?";
                $searchParam = "%$search%";
                $params = [$searchParam, $searchParam, $searchParam, $searchParam];
                $stmt = $this->db->prepare($sql);
                $stmt->execute($params);
            } else {
                $stmt = $this->db->prepare($sql);
                $stmt->execute();
            }
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    // 获取单个药品详情
 public function getMedicine($id) {
     try {
         $stmt = $this->db->prepare("SELECT m.* 
                                       FROM medicines m 
                                       WHERE m.id = ?");
         $stmt->execute([$id]);
         return $stmt->fetch(PDO::FETCH_ASSOC);
     } catch(PDOException $e) {
         return ['success' => false, 'message' => $e->getMessage()];
     }
 }
    
    // 更新药品信息
    public function updateMedicine($id, $data) {
        try {
            $updates = [];
            $params = [];
            
            foreach ($data as $key => $value) {
                if ($key !== 'id') {
                    $updates[] = "$key = ?";
                    $params[] = $value;
                }
            }
            
            $params[] = $id;
            
            $sql = "UPDATE medicines SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            //if (isset($data['tags'])) {
                // 更新标签
                //$stmt = $this->db->prepare("DELETE FROM tags WHERE medicine_id = ?");
                //$stmt->execute([$id]);
                
                //$tags = explode(',', $data['tags']);
                //foreach ($tags as $tag) {
                //    $stmt = $this->db->prepare("INSERT INTO tags (medicine_id, tag_name) VALUES (?, ?)");
                //    $stmt->execute([$id, trim($tag)]);
                //}
            //}
            
            return ['success' => true, 'message' => '更新成功'];
        } catch(PDOException $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    // 删除药品
    public function deleteMedicine($id) {
        try {
                       
            $stmt = $this->db->prepare("DELETE FROM medicines WHERE id = ?");
            $stmt->execute([$id]);
            
            return ['success' => true, 'message' => '删除成功'];
        } catch(PDOException $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    // 出库操作
    public function outbound($id, $quantity) {
        try {
            $stmt = $this->db->prepare("SELECT quantity FROM medicines WHERE id = ?");
            $stmt->execute([$id]);
            $medicine = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($medicine['quantity'] < $quantity) {
                return ['success' => false, 'message' => '库存不足'];
            }
            
            $newQuantity = $medicine['quantity'] - $quantity;
            $stmt = $this->db->prepare("UPDATE medicines SET quantity = ? WHERE id = ?");
            $stmt->execute([$newQuantity, $id]);
            
            return ['success' => true, 'message' => '出库成功'];
        } catch(PDOException $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    // 添加药品
    public function addMedicine($data) {
        try {
            $required_fields = ['name', 'batch_number', 'quantity', 'expiry_date', 'location'];
            foreach ($required_fields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return ['success' => false, 'message' => "缺少必要字段: {$field}"];
                }
            }
            
            // 检查唯一码是否已存在
            if (isset($data['unique_code']) && !empty($data['unique_code'])) {
                $stmt = $this->db->prepare("SELECT COUNT(*) FROM medicines WHERE unique_code = ?");
                $stmt->execute([$data['unique_code']]);
                if ($stmt->fetchColumn() > 0) {
                    return ['success' => false, 'message' => '该唯一码已存在'];
                }
            }
            
            $stmt = $this->db->prepare(
                "INSERT INTO medicines (name, batch_number, unique_code, quantity, expiry_date, location, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            
            $result = $stmt->execute([
                $data['name'],
                $data['batch_number'],
                $data['unique_code'],
                $data['quantity'],
                $data['expiry_date'],
                $data['location'],
                $data['notes'] ?? ''
            ]);
            
            if (!$result) {
                return ['success' => false, 'message' => '数据库插入失败'];
            }
            
            return ['success' => true, 'message' => '添加成功', 'id' => $this->db->lastInsertId()];
        } catch(PDOException $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    
    // 获取即将过期药品
    public function getExpiringMedicines() {
        try {
            $stmt = $this->db->prepare(
                "SELECT *, 
                        DATEDIFF(expiry_date, CURDATE()) as days_left
                 FROM medicines 
                 WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                 ORDER BY expiry_date ASC"
            );
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}

// API路由处理
$api = new MedicineAPI();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'expiring':
                    echo json_encode($api->getExpiringMedicines());
                    break;
            }
        } else if (isset($_GET['id'])) {
            echo json_encode($api->getMedicine($_GET['id']));
        } else {
            $search = $_GET['search'] ?? '';
            echo json_encode($api->getMedicines($search));
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($_GET['action']) && $_GET['action'] === 'outbound') {
            echo json_encode($api->outbound($_GET['id'], $data['quantity']));
        } else {
            echo json_encode($api->addMedicine($data));
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($api->updateMedicine($_GET['id'], $data));
        break;
        
    case 'DELETE':
        echo json_encode($api->deleteMedicine($_GET['id']));
        break;
}