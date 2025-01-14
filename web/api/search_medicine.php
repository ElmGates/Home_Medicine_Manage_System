<?php
require_once 'database.php'; // 引入数据库连接

class MedicineAPI {
    private $db;

    public function __construct() {
        $this->db = new Database(); // 假设你有一个数据库连接类
    }

    public function searchMedicines($query) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM medicines WHERE name LIKE ? OR batch_number LIKE ? OR unique_code LIKE ? OR location LIKE ?");
            $likeQuery = "%$query%";
            $stmt->execute([$likeQuery, $likeQuery, $likeQuery, $likeQuery]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}

$api = new MedicineAPI();
$query = isset($_GET['query']) ? $_GET['query'] : '';
$results = $api->searchMedicines($query);
echo json_encode($results);
?>