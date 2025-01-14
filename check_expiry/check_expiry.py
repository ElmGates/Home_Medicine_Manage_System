import json
import requests
import pymysql
from datetime import datetime, timedelta

# 从配置文件读取配置
def load_config():
    with open('config.json', 'r', encoding='utf-8') as f:
        return json.load(f)

# 获取即将过期的药品
def get_expiring_medicines(db_config):
    # 连接到数据库
    connection = pymysql.connect(
        host=db_config['host'],
        user=db_config['username'],
        password=db_config['password'],
        database=db_config['dbname']
    )
    try:
        with connection.cursor() as cursor:
            # 查询即将过期的药品（30天内）
            query = """
            SELECT name, batch_number, unique_code, expiry_date, location, notes
            FROM medicines
            WHERE expiry_date <= NOW() + INTERVAL 30 DAY
            """
            cursor.execute(query)
            return cursor.fetchall()
    finally:
        connection.close()

# 发送钉钉提醒
def send_alert(webhook_url, medicines):
    if not medicines:
        return

    message = "### 药品过期提醒\n\n"
    for medicine in medicines:
        name, batch_number, unique_code, expiry_date, location, notes = medicine
        message += f"- **{name}** (批号: {batch_number}, 唯一编码: {unique_code}) 将在 {expiry_date} 过期，存放位置: {location}，备注: {notes}\n"

    data = {
        "msgtype": "markdown",
        "markdown": {
            "title": "药品过期提醒",
            "text": message
        }
    }

    response = requests.post(webhook_url, data=json.dumps(data), headers={'Content-Type': 'application/json'})
    if response.status_code == 200:
        print("提醒发送成功")
    else:
        print("提醒发送失败:", response.text)

def main():
    config = load_config()
    db_config = config['database']
    webhook_url = config['webhook']['dingtalk']

    expiring_medicines = get_expiring_medicines(db_config)
    send_alert(webhook_url, expiring_medicines)

if __name__ == "__main__":
    main()
