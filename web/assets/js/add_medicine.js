document.addEventListener('DOMContentLoaded', function() {
    // 先检查会话
    fetch('/api/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                window.location.href = 'login.html';
                return;
            }
        })
        .catch(error => {
            console.error('会话检查失败:', error);
            window.location.href = 'login.html';
        });

    const addForm = document.getElementById('addMedicineForm');

    addForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(addForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // 如果唯一码为空，自动生成一个
        if (!data.unique_code) {
            generateUniqueCode();
            data.unique_code = document.querySelector('input[name="unique_code"]').value;
        }
        
        fetch('/api/medicine.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('添加成功');
                addForm.reset();
            } else {
                alert('添加失败: ' + result.message);
            }
        })
        .catch(error => {
            console.error('错误:', error);
            alert('提交失败，请检查控制台获取详细信息');
        });
    });
});

function generateUniqueCode() {
    const uniqueCodeInput = document.querySelector('input[name="unique_code"]');
    const code = Array.from({length: 20}, () => Math.floor(Math.random() * 10)).join('');
    uniqueCodeInput.value = code;
}