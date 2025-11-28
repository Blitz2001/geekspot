import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (order) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Header ---
            // Logo (Text for now)
            doc.fillColor('#a3e635') // Lime green
                .fontSize(24)
                .font('Helvetica-Bold')
                .text('Geekspot', 50, 45)
                .fontSize(10)
                .text('Your Tech Paradise', 50, 70);

            // Invoice Title
            doc.fillColor('#0a1628') // Navy
                .fontSize(36)
                .font('Helvetica-Bold')
                .text('Invoice', 400, 45, { align: 'right' });

            // Divider
            doc.rect(50, 90, 500, 20).fill('#a3e635'); // Lime strip

            // --- Invoice Info ---
            const customerTop = 130;

            // Invoice From
            doc.fillColor('#0a1628')
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('Invoice from', 50, customerTop);

            doc.font('Helvetica')
                .fontSize(10)
                .text('Geekspot (Pvt) Ltd', 50, customerTop + 20)
                .text('No. 189/1, Janatha Mawatha,', 50, customerTop + 35)
                .text('Pannipitiya.', 50, customerTop + 50)
                .text('Mob: 0766 303 131', 50, customerTop + 65)
                .text('Email: geekspot.tec@gmail.com', 50, customerTop + 80)
                .text('Web: www.geekspot.com', 50, customerTop + 95);

            // Invoice To
            doc.font('Helvetica-Bold')
                .fontSize(12)
                .text('Invoice to', 300, customerTop);

            doc.font('Helvetica')
                .fontSize(10)
                .text(order.customerDetails?.name || 'Customer', 300, customerTop + 20)
                .text(order.customerDetails?.address || '', 300, customerTop + 35)
                .text(`${order.customerDetails?.city || ''}, ${order.customerDetails?.province || ''}`, 300, customerTop + 50)
                .text(`Email: ${order.customerDetails?.email || ''}`, 300, customerTop + 65)
                .text(`Mob: ${order.customerDetails?.mobile || ''}`, 300, customerTop + 80);

            // Date
            doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 300, customerTop + 100);
            doc.text(`Order #: ${order.orderNumber}`, 300, customerTop + 115);

            // --- Items Table ---
            const tableTop = 300;

            // Table Header
            doc.rect(50, tableTop, 500, 25).fill('#a3e635'); // Lime header
            doc.fillColor('#0a1628')
                .font('Helvetica-Bold')
                .fontSize(10);

            doc.text('No', 60, tableTop + 7)
                .text('Description', 100, tableTop + 7)
                .text('Qty', 350, tableTop + 7, { width: 40, align: 'center' })
                .text('U.Price', 400, tableTop + 7, { width: 70, align: 'right' })
                .text('Amount', 480, tableTop + 7, { width: 60, align: 'right' });

            // Table Rows
            let y = tableTop + 35;
            doc.font('Helvetica').fontSize(10);

            order.items.forEach((item, index) => {
                const amount = item.price * item.quantity;

                // Background strip for alternate rows (optional, skipping for simplicity)
                if (index % 2 === 0) {
                    doc.rect(50, y - 5, 500, 20).fill('#f9fafb');
                    doc.fillColor('#0a1628');
                }

                doc.text(index + 1, 60, y)
                    .text(item.name, 100, y, { width: 240 })
                    .text(item.quantity, 350, y, { width: 40, align: 'center' })
                    .text(item.price.toLocaleString('en-US', { minimumFractionDigits: 2 }), 400, y, { width: 70, align: 'right' })
                    .text(amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), 480, y, { width: 60, align: 'right' });

                y += 25;
            });

            // --- Totals ---
            const totalTop = y + 20;

            // Total Bar
            doc.rect(50, totalTop, 500, 30).fill('#0a1628'); // Navy bar
            doc.fillColor('#ffffff')
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('Total', 60, totalTop + 8);

            doc.text(order.total.toLocaleString('en-US', { minimumFractionDigits: 2 }), 400, totalTop + 8, { width: 140, align: 'right' });

            // --- Footer Info ---
            const footerTop = totalTop + 50;

            // Payment Method
            doc.fillColor('#a3e635').rect(50, footerTop, 150, 20).fill();
            doc.fillColor('#0a1628')
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('Payment method', 60, footerTop + 5);

            doc.font('Helvetica')
                .fontSize(9)
                .text('Bank Account Number - 173013557498084', 50, footerTop + 30)
                .text('Account Holder Name - D.M.P.K Thanayamwatta', 50, footerTop + 45)
                .text('Bank Name - Seylan Bank PLC', 50, footerTop + 60)
                .text('Branch Name - Eheliyagoda Branch', 50, footerTop + 75)
                .text('Country - Sri Lanka', 50, footerTop + 90);

            // Terms & Conditions
            const termsTop = footerTop + 120;
            doc.fillColor('#a3e635').rect(50, termsTop, 150, 20).fill();
            doc.fillColor('#0a1628')
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('Terms & Conditions', 60, termsTop + 5);

            doc.font('Helvetica')
                .fontSize(8)
                .text('All payments must be settled in full before goods are released. All products carry a manufacturer\'s warranty covering defects only; damages due to misuse, electrical issues, physical damage, unauthorized repairs, or improper handling are not covered. Returns or exchanges must be requested within 3 working days and only for unused items in original packaging.', 50, termsTop + 30, { width: 500, align: 'justify' });

            // Thank you message
            doc.rect(50, termsTop + 80, 500, 30).fill('#f0fccb'); // Light lime
            doc.fillColor('#0a1628')
                .fontSize(9)
                .font('Helvetica-Bold')
                .text('Thank you for your purchase from GEEKSPOT!', 50, termsTop + 88, { width: 500, align: 'center' });
            doc.font('Helvetica')
                .text('Complimentary Free Laptop Bag included with the purchase.', 50, termsTop + 100, { width: 500, align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
