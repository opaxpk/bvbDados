// Configuração do Firebase
        var firebaseConfig = {
            apiKey: "AIzaSyCONI5jggdZmpWU6XyExDUILRwb6PZ3ww8",
            authDomain: "bvbdados.firebaseapp.com",
            databaseURL: "https://bvbdados-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "bvbdados",
            storageBucket: "bvbdados.firebasestorage.app",
            messagingSenderId: "1023617367181",
            appId: "1:1023617367181:web:1278c64ceefb14e2ff76c4",
            measurementId: "G-TYSGD43C72"
        };

        // Inicializa o Firebase
        firebase.initializeApp(firebaseConfig);
        var database = firebase.database();

        function irParaBackend() {
    // Obtém a URL atual
    const urlAtual = window.location.href;

    // Verifica se a URL já termina com "/backend" para evitar duplicação
    if (!urlAtual.endsWith('/backend')) {
        // Adiciona "/backend" ao final da URL
        const novaURL = urlAtual.endsWith('/') ? urlAtual + 'backend' : urlAtual + '/backend';
        window.location.href = novaURL; // Redireciona para a nova URL
    }
}

        // Função para fechar o painel de administração
        function fecharPainelAdmin() {
            const urlSemAdmin = window.location.href.split('?')[0];
            window.location.href = urlSemAdmin;
        }

        window.onload = function() {
            const isAdmin = window.location.search.includes('admin=true');
            
            if (isAdmin) {
                document.querySelectorAll('.acoes').forEach(coluna => coluna.style.display = 'table-cell');
                document.getElementById('adminActions').style.display = 'flex';
            } else {
                document.querySelectorAll('.acoes').forEach(coluna => coluna.style.display = 'none');
                document.getElementById('adminActions').style.display = 'none';
            }

            // Carregar os dados do Firebase e adicionar à tabela
            const categorias = ['cabine-conducao-body', 'saco-abordagem-body', 'saco-trauma-body', 'saco-pediatrico-body'];
            categorias.forEach(categoria => {
                const tbody = document.getElementById(categoria);
                const ref = database.ref(categoria);
                ref.on('child_added', (snapshot) => {
                    const data = snapshot.val();
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', snapshot.key);
                    row.innerHTML = `<td contenteditable='true' onfocus='selecionarCelula(this)' onblur='updateName("${snapshot.key}", "${categoria}", this.textContent)'>${data.nome}</td>
                                     <td contenteditable='true' onblur='updateItem("${snapshot.key}", "${categoria}", "quantidade", this.textContent)'>${data.quantidade}</td>
                                     <td><input type='checkbox' ${data.verificado ? 'checked' : ''} onclick='updateItem("${snapshot.key}", "${categoria}", "verificado", this.checked)'></td>
                                     <td><input type='checkbox' ${data.repor ? 'checked' : ''} onclick='updateItem("${snapshot.key}", "${categoria}", "repor", this.checked)'></td>
                                     ${isAdmin ? "<td><button class='btn-remover' onclick='removeItem(\"" + snapshot.key + "\", \"" + categoria + "\")'>Remover</button></td>" : ""}`;
                    tbody.appendChild(row);
                });
            });
        };

        // Função para adicionar item no Firebase
        function addItem() {
            const categoria = document.getElementById('categoria').value;
            const itemName = document.getElementById('itemName').value;
            const itemQuantity = document.getElementById('itemQuantity').value;

            if (itemName && itemQuantity) {
                const newItemRef = database.ref(categoria).push();
                newItemRef.set({
                    nome: itemName,
                    quantidade: itemQuantity,
                    verificado: false,
                    repor: false
                }).then(() => {
                    showPopup('Item adicionado com sucesso!', 'green');
                }).catch(error => {
                    showPopup('Erro ao adicionar item.', 'red');
                    console.error('Erro ao adicionar item: ', error);
                });
                document.getElementById('itemName').value = '';
                document.getElementById('itemQuantity').value = '';
            } else {
                showPopup('Por favor, preencha todos os campos.', 'yellow');
            }
        }

        // Função para mostrar o popup de sucesso ou erro
        function showPopup(message, color) {
            const popup = document.createElement('div');
            popup.textContent = message;
            popup.style.backgroundColor = color;
            popup.style.color = 'black';
            popup.style.padding = '10px';
            popup.style.textAlign = 'center';
            popup.style.position = 'fixed';
            popup.style.top = '10px';
            popup.style.width = '100%';
            popup.style.zIndex = '1000';
            document.body.appendChild(popup);
            setTimeout(() => {
                popup.remove();
            }, 3000);
        }

        let celulaSelecionada = null;

        // Função para selecionar a célula
        function selecionarCelula(celula) {
            celulaSelecionada = celula;
        }

        // Função para adicionar etiqueta ao nome do item selecionado
        function adicionarEtiqueta(etiqueta) {
            if (celulaSelecionada) {
                const nomeItem = celulaSelecionada.textContent;
                // Verificar se a etiqueta já não foi adicionada
                if (!nomeItem.includes(etiqueta)) {
                    celulaSelecionada.textContent += etiqueta;
                }
            }
        }

        // Função para atualizar o nome no Firebase
        function updateName(id, categoria, novoNome) {
            if (novoNome.trim() !== "") {
                const itemRef = database.ref(`${categoria}/${id}`);
                itemRef.update({ nome: novoNome })
                    .then(() => {
                        console.log('Nome atualizado com sucesso!');
                    })
                    .catch((error) => {
                        console.error('Erro ao atualizar nome: ', error);
                    });
            }
        }

        // Função para atualizar outros campos
        function updateItem(id, categoria, campo, valor) {
            const itemRef = database.ref(`${categoria}/${id}`);
            const updates = {};
            updates[campo] = valor;
            itemRef.update(updates)
                .then(() => {
                    console.log(`${campo} atualizado com sucesso!`);
                })
                .catch((error) => {
                    console.error(`Erro ao atualizar ${campo}: `, error);
                });
        }

        // Função para remover item do Firebase
        function removeItem(id, categoria) {
            const itemRef = database.ref(`${categoria}/${id}`);
            itemRef.remove()
                .then(() => {
                    console.log('Item removido com sucesso do Firebase!');
                    // Remover a linha da tabela
                    const row = document.querySelector(`tr[data-id="${id}"]`);
                    if (row) {
                        row.remove();
                    }
                })
                .catch((error) => {
                    console.error('Erro ao remover item do Firebase: ', error);
                });
        }