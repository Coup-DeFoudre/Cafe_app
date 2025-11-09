import { OrderResponse } from '@/lib/mappers/order'

export function printOrderReceipt(order: OrderResponse): void {
  const receiptHTML = generateReceiptHTML(order)
  
  // Open new window with receipt
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    alert('Please allow popups to print receipts')
    return
  }

  printWindow.document.write(receiptHTML)
  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print()
    // Close window after printing (with slight delay)
    setTimeout(() => {
      printWindow.close()
    }, 500)
  }
}

export function generateReceiptHTML(order: OrderResponse): string {
  const formattedDate = new Date(order.createdAt).toLocaleString()
  const subtotal = order.subtotal ?? (order.total * 0.9) // Estimate if not provided
  const tax = order.tax ?? (order.total * 0.1) // Estimate if not provided
  const deliveryCharge = order.deliveryCharge ?? 0

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - Order ${order.orderNumber}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 20px;
          background: white;
          color: black;
        }
        .receipt {
          max-width: 300px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .cafe-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .order-info {
          margin-bottom: 15px;
        }
        .order-info div {
          margin-bottom: 3px;
        }
        .items-section {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 10px 0;
          margin: 15px 0;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .item-name {
          flex: 1;
        }
        .item-qty {
          margin: 0 10px;
        }
        .item-price {
          text-align: right;
          min-width: 50px;
        }
        .customizations {
          font-size: 10px;
          color: #666;
          margin-left: 10px;
        }
        .totals {
          margin-top: 15px;
        }
        .total-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .total-final {
          border-top: 2px solid #000;
          padding-top: 5px;
          font-weight: bold;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          border-top: 1px dashed #000;
          padding-top: 10px;
          font-size: 11px;
        }
        @media print {
          body { margin: 0; padding: 10px; }
          .receipt { max-width: none; }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="cafe-name">${order.cafe?.name || 'CAFE MANAGEMENT'}</div>
          <div>Order Receipt</div>
        </div>

        <div class="order-info">
          <div><strong>Order #:</strong> ${order.orderNumber}</div>
          <div><strong>Date:</strong> ${formattedDate}</div>
          <div><strong>Customer:</strong> ${order.customerName}</div>
          <div><strong>Phone:</strong> ${order.customerPhone}</div>
          <div><strong>Type:</strong> ${order.orderType}</div>
          ${order.tableNumber ? `<div><strong>Table:</strong> ${order.tableNumber}</div>` : ''}
          ${order.deliveryAddress ? `<div><strong>Address:</strong> ${order.deliveryAddress}</div>` : ''}
          <div><strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})</div>
        </div>

        <div class="items-section">
          <div style="font-weight: bold; margin-bottom: 10px;">ITEMS ORDERED:</div>
          ${(order.orderItems || []).map(item => `
            <div class="item">
              <div class="item-name">${item.menuItem.name}</div>
              <div class="item-qty">x${item.quantity}</div>
              <div class="item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            ${item.customizations ? `<div class="customizations">${item.customizations}</div>` : ''}
          `).join('')}
        </div>

        <div class="totals">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Tax:</span>
            <span>₹${tax.toFixed(2)}</span>
          </div>
          ${deliveryCharge > 0 ? `
            <div class="total-line">
              <span>Delivery:</span>
              <span>₹${deliveryCharge.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total-line total-final">
            <span>TOTAL:</span>
            <span>₹${order.total.toFixed(2)}</span>
          </div>
        </div>

        ${order.specialInstructions ? `
          <div style="margin-top: 15px; border-top: 1px dashed #000; padding-top: 10px;">
            <div><strong>Special Instructions:</strong></div>
            <div style="font-size: 11px; margin-top: 5px;">${order.specialInstructions}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div>Thank you for your order!</div>
          <div>Please visit again</div>
        </div>
      </div>
    </body>
    </html>
  `
}