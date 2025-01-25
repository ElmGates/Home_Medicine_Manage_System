<?php
class Database {
    private $conn;
    
    public function __construct() {
        $config = json_decode(file_get_contents("../config.json"), true);
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $config['database']['host'] . 
                ";dbname=" . $config['database']['dbname'],
                $config['database']['username'],
                $config['database']['password']
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            error_log('Database connection successful');
        } catch(PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            throw $e;
        }
    }
    
    public function getConnection() {
        return $this->conn;
    }
} 