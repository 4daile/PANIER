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

        // Remplissage naturel des pages selon la hauteur du contenu
        let currentPage = document.createElement("div");
        currentPage.className = "page content-page";
        let itemsGrid = document.createElement("div");
        itemsGrid.className = "items-grid";
        let pageNumber = 1;

        currentPage.innerHTML = `<div class="page-number">${pageNumber}</div>`;
        currentPage.appendChild(itemsGrid);
        container.appendChild(currentPage);
        
        // Hauteur max approximative en pixels (210mm A5 - 30mm padding = 180mm ≈ 680px)
        const maxGridHeight = 680;
        
        basketItems.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "item-box";
            itemDiv.innerHTML = `
                <div class="selection">${item.selection}</div>
                <div class="metadata">
                    <p class="date">${item.date}</p>
                    <p class="url">${item.url}</p>
                </div>
            `;
            
            // Ajoute l'item temporairement pour mesurer
            itemsGrid.appendChild(itemDiv);
            
            // Mesure la hauteur après ajout
            const currentHeight = itemsGrid.scrollHeight;
            
            // Si ça déborde ET qu'il y a déjà au moins un item, on crée une nouvelle page
            if (currentHeight > maxGridHeight && itemsGrid.children.length > 1) {
                // Retire l'item qui fait déborder
                itemsGrid.removeChild(itemDiv);
                
                // Crée une nouvelle page
                currentPage = document.createElement("div");
                currentPage.className = "page content-page";
                pageNumber++;
                currentPage.innerHTML = `<div class="page-number">${pageNumber}</div>`;
                
                itemsGrid = document.createElement("div");
                itemsGrid.className = "items-grid";
                itemsGrid.appendChild(itemDiv);
                
                currentPage.appendChild(itemsGrid);
                container.appendChild(currentPage);
            }
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