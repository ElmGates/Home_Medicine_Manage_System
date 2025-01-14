document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = document.getElementById('searchQuery').value;

        fetch(`/api/medicine.php?search=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                const resultsTable = document.getElementById('medicineResults').getElementsByTagName('tbody')[0];
                resultsTable.innerHTML = ''; // 清空现有内容

                data.forEach(medicine => {
                    const row = resultsTable.insertRow();
                    row.innerHTML = `
                        <td>${medicine.name}</td>
                        <td>${medicine.batch_number}</td>
                        <td>${medicine.unique_code}</td>
                        <td>${medicine.quantity}</td>
                        <td>${medicine.expiry_date}</td>
                        <td>${medicine.location}</td>
                        <td>${medicine.notes}</td>
                    `;
                });
            })
            .catch(error => {
                console.error('查询失败:', error);
            });
    });
});