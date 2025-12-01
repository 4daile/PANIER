// Récupère les items du localStorage
        const basketItems = JSON.parse(localStorage.getItem("basketItems")) || [];

        // Trie par date (du plus récent au plus ancien)
        basketItems.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });

        const container = document.getElementById("leporello-container");

        // Page de couverture
        const coverPage = document.createElement("div");
        coverPage.className = "page cover-page";
        coverPage.innerHTML = `
            <div class="cover-content">
                <h1>PANIER</h1>
                <p class="subtitle">Collection de fragments</p>
                <p class="date">${new Date().toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
            </div>
        `;
        container.appendChild(coverPage);

        // Crée une page pour chaque item
        basketItems.forEach((item, index) => {
            const page = document.createElement("div");
            page.className = "page content-page";
            page.innerHTML = `
                <div class="page-number">${index + 1}</div>
                <div class="item-content">
                    <div class="selection">${item.selection}</div>
                    <div class="metadata">
                        <p class="date">${item.date}</p>
                        <p class="url">${item.url}</p>
                    </div>
                </div>
            `;
            container.appendChild(page);
        });

        // Page de fin
        const endPage = document.createElement("div");
        endPage.className = "page end-page";
        endPage.innerHTML = `
            <div class="end-content">
                <p>✦</p>
                <p class="total">${basketItems.length} fragments collectés</p>
            </div>
        `;
        container.appendChild(endPage);

        // Lance l'impression automatiquement
        window.onload = () => {
            setTimeout(() => {
                window.print();
            }, 500);
        };