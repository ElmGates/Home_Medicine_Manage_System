document.addEventListener('DOMContentLoaded', function() {
    fetchMedicines();
});

function fetchMedicines() {
    fetch('/api/medicine.php')
        .then(response => response.json())
        .then(data => {
            const medicineList = document.getElementById('medicineList');
            medicineList.innerHTML = ''; // 清空现有内容

            data.forEach(medicine => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${medicine.name}</td>
                    <td>${medicine.batch_number}</td>
                    <td>${medicine.unique_code}</td>
                    <td>${medicine.quantity}</td>
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