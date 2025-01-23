let html5QrcodeScanner = null;
let currentInputField = null;

function startScan(inputFieldName) {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
    }

    // 创建扫码对话框
    const modalHtml = `
        <div class="modal fade" id="scannerModal" tabindex="-1" aria-labelledby="scannerModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="scannerModalLabel">扫描条码</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div id="reader"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 如果modal不存在，则添加到body
    if (!document.getElementById('scannerModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // 保存当前输入框名称
    currentInputField = inputFieldName;

    // 初始化扫码器
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { 
            fps: 10,
            qrbox: 250,
            aspectRatio: 1.0
        }
    );

    // 处理扫码结果
    html5QrcodeScanner.render((decodedText) => {
        // 将扫描结果填入对应的输入框
        const input = document.querySelector(`input[name="${currentInputField}"]`);
        if (input) {
            input.value = decodedText;
        }

        // 关闭扫码器和对话框
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
        }
        const modal = bootstrap.Modal.getInstance(document.getElementById('scannerModal'));
        modal.hide();
    });

    // 显示扫码对话框
    const scannerModal = new bootstrap.Modal(document.getElementById('scannerModal'));
    scannerModal.show();

    // 监听对话框关闭事件
    document.getElementById('scannerModal').addEventListener('hidden.bs.modal', function () {
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
        }
    });
}