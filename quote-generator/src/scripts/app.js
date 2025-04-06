document.getElementById('quote-form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Récupération du dernier numéro de devis depuis le stockage local
    let lastQuoteNumber = parseInt(localStorage.getItem('lastQuoteNumber')) || 100;
    const quoteNumber = lastQuoteNumber + 1; // Incrémentation du numéro de devis
    localStorage.setItem('lastQuoteNumber', quoteNumber); // Mise à jour du stockage local

    // Date du devis
    const creationDate = new Date().toLocaleDateString();

    // Récupération des données du vendeur
    const sellerName = document.getElementById('seller-name').value;
    const sellerAddress = document.getElementById('seller-address').value;
    const sellerPhone = document.getElementById('seller-phone').value;
    const sellerEmail = document.getElementById('seller-email').value;
    const sellerSIRET = document.getElementById('seller-siret').value;
    const sellerVAT = document.getElementById('seller-vat').value;

    // Récupération des données du client
    const clientName = document.getElementById('client-name').value;
    const clientAddress = document.getElementById('client-address').value;
    const clientPhone = document.getElementById('client-phone').value;
    const clientEmail = document.getElementById('client-email').value;
    const clientSIRET = document.getElementById('client-siret').value;
    const clientVAT = document.getElementById('client-vat').value;

    // Récupération des produits ou services
    const items = Array.from(document.querySelectorAll('.item')).map(item => ({
        name: item.querySelector('.item-name').value,
        quantity: parseInt(item.querySelector('.item-quantity').value, 10),
        price: parseFloat(item.querySelector('.item-price').value)
    }));

    // Options
    const includeVAT = document.getElementById('include-vat').checked;
    const discount = parseFloat(document.getElementById('discount')?.value) || 0;
    const terms = document.getElementById('terms')?.value || '';

    // Calcul du total
    let subTotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const discountAmount = subTotal * (discount / 100);
    let total = subTotal - discountAmount;
    let vatAmount = 0;

    if (includeVAT) {
        vatAmount = total * 0.2; // TVA à 20%
        total += vatAmount;
    }

    // Génération du devis
    const output = `
        <h2>Devis : ${quoteNumber}</h2>
        <p><strong>Date de création :</strong> ${creationDate}</p>
        <p><strong>Vendeur :</strong> ${sellerName}, ${sellerAddress}, ${sellerPhone}, ${sellerEmail}, SIRET : ${sellerSIRET}, TVA : ${sellerVAT}</p>
        <p><strong>Client :</strong> ${clientName}, ${clientAddress}, ${clientPhone}, ${clientEmail}, SIRET : ${clientSIRET}, TVA : ${clientVAT}</p>
        <table>
            <thead>
                <tr>
                    <th>Produit/Service</th>
                    <th>Quantité</th>
                    <th>Prix Unitaire (€)</th>
                    <th>Total (€)</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <p><strong>Sous-total :</strong> ${subTotal.toFixed(2)} €</p>
        <p><strong>Réduction (${discount}%):</strong> -${discountAmount.toFixed(2)} €</p>
        <p><strong>TVA (20%) :</strong> ${vatAmount.toFixed(2)} €</p>
        <p><strong>Total :</strong> ${total.toFixed(2)} €</p>
        <h3>Conditions Générales de Vente</h3>
        <p>${terms}</p>
    `;

    // Ajout du devis et du bouton PDF à la page
    document.getElementById('quote-output').innerHTML = output;

    // Gestion du clic sur le bouton PDF
    const pdfButton = document.createElement('button');
    pdfButton.id = 'download-pdf';
    pdfButton.textContent = 'Télécharger en PDF';
    document.getElementById('quote-output').appendChild(pdfButton);
    pdfButton.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        // En-tête du devis : Numéro et date
        doc.setFontSize(18);
        doc.text("Devis", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Numéro : ${quoteNumber}    Date : ${creationDate}`, 105, 30, { align: "center" });
    
        // Informations du vendeur et du client côte à côte
        doc.setFontSize(12);
        doc.text("Informations du Vendeur :", 10, 40);
        doc.text("Informations du Client :", 110, 40);
    
        doc.setFontSize(10);
        // Vendeur
        doc.text(`Nom : ${sellerName}`, 10, 45);
        doc.text(`Adresse : ${sellerAddress}`, 10, 50);
        doc.text(`Téléphone : ${sellerPhone}`, 10, 55);
        doc.text(`Email : ${sellerEmail}`, 10, 60);
        doc.text(`SIRET : ${sellerSIRET}`, 10, 65);
        doc.text(`TVA : ${sellerVAT}`, 10, 70);
    
        // Client
        doc.text(`Nom : ${clientName}`, 110, 45);
        doc.text(`Adresse : ${clientAddress}`, 110, 50);
        doc.text(`Téléphone : ${clientPhone}`, 110, 55);
        doc.text(`Email : ${clientEmail}`, 110, 60);
        doc.text(`SIRET : ${clientSIRET}`, 110, 65);
        doc.text(`TVA : ${clientVAT}`, 110, 70);
    
        // Produits ou services avec TVA par ligne
        doc.setFontSize(12);
        doc.text("Produits ou Services :", 10, 80);
        let yPosition = 85;
    
        // Table header
        doc.setFontSize(10);
        doc.text("Nom", 10, yPosition);
        doc.text("Quantité", 60, yPosition);
        doc.text("Prix Unitaire (€)", 90, yPosition);
        doc.text("TVA (%)", 130, yPosition);
        doc.text("Total (€)", 160, yPosition);
        yPosition += 5;
    
        // Table rows
        items.forEach((item, index) => {
            const itemTotal = item.quantity * item.price;
            const itemVAT = item.vat || 20; // Par défaut, TVA à 20% si non spécifiée
            const itemVATAmount = (itemTotal * itemVAT) / 100;
            const itemTotalWithVAT = itemTotal + itemVATAmount;
    
            doc.text(`${index + 1}. ${item.name}`, 10, yPosition);
            doc.text(`${item.quantity}`, 60, yPosition);
            doc.text(`${item.price.toFixed(2)}`, 90, yPosition);
            doc.text(`${itemVAT}%`, 130, yPosition);
            doc.text(`${itemTotalWithVAT.toFixed(2)}`, 160, yPosition);
            yPosition += 10;
        });
    
        // Totaux
        yPosition += 10;
        doc.setFontSize(12);
        doc.text("Résumé :", 10, yPosition);
        doc.setFontSize(10);
        doc.text(`Sous-total : ${subTotal.toFixed(2)} €`, 10, yPosition + 5);
        doc.text(`Réduction (${discount}%): -${discountAmount.toFixed(2)} €`, 10, yPosition + 10);
        doc.text(`TVA totale : ${vatAmount.toFixed(2)} €`, 10, yPosition + 15);
        doc.text(`Total : ${total.toFixed(2)} €`, 10, yPosition + 20);
    
        // Conditions générales de vente
        yPosition += 30;
        doc.setFontSize(12);
        doc.text("Conditions Générales de Vente :", 10, yPosition);
        doc.setFontSize(10);
        const termsLines = doc.splitTextToSize(terms, 180); // Divise le texte en lignes adaptées à la largeur
        doc.text(termsLines, 10, yPosition + 5);
    
        // Téléchargement direct du PDF
        doc.save(`Devis-${quoteNumber}.pdf`);
    });

   
});