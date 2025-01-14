<!--此文件已废弃，请使用python的版本或者自行修改使用-->

<?php
class Webhook {
    private $webhook_url;
    
    public function __construct() {
        $config = json_decode(file_get_contents("../config.json"), true);
        $this->webhook_url = $config['webhook']['dingtalk'];
    }
    
    public function sendExpiryAlert($medicines) {
        $message = "### 药品过期提醒\n\n";
        foreach ($medicines as $medicine) {
            $message .= "- {$medicine['name']} (批号: {$medicine['batch_number']}) 将在 {$medicine['expiry_date']} 过期\n";
        }
        
        $data = [
            'msgtype' => 'markdown',
            'markdown' => [
                'title' => '药品过期提醒',
                'text' => $message
            ]
        ];
        
        $this->sendRequest($data);
    }
    
    private function sendRequest($data) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->webhook_url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return $response;
    }
} 