document.addEventListener('DOMContentLoaded', function() {
    fetchMedicines();
});

function checkSession() {
    fetch('api/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                window.location.href = 'login.html';
                return;
            }
            fetchMedicines();
        })
        .catch(error => {
            console.error('会话检查失败:', error);
            window.location.href = 'login.html';
        });
}

function fetchMedicines() {
    fetch('api/medicine.php')
        .then(response => response.json())
        .then(data => {
            const medicineList = document.getElementById('medicineList');
            medicineList.innerHTML = ''; // 清空现有内容

            if (data.length === 0) {
                // 添加空数据提示
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `
                    <td colspan="8" class="text-center text-muted" style="padding: 50px 0; font-size: 1.2em;">
                        暂无数据
                    </td>
                `;
                medicineList.appendChild(emptyRow);
                return;
            }

            data.forEach(medicine => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${medicine.name}</td>
                    <td>${medicine.batch_number}</td>
                    <td>${medicine.unique_code}</td>
                    <td>${medicine.quantity}</td>
                    <td>${medicine.unit || '件'}</td>
                    <td>${medicine.expiry_date}</td>
                    <td>${medicine.location}</td>
                    <td>${medicine.notes}</td>
                `;
                medicineList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('获取药品数据失败:', error);
        });
}