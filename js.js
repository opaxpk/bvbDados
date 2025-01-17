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
            const urlAtual = window.location.href;
            if (!urlAtual.endsWith('/backend')) {
                const novaURL = urlAtual.endsWith('/') ? urlAtual + 'backend' : urlAtual + '/backend';
                window.location.href = novaURL;
            }
        }

        function fecharPainelAdmin() {
            const urlSemAdmin = window.location.href.split('?')[0];
            window.location.href = urlSemAdmin;
        }

        window.onload = function () {
            const isAdmin = window.location.search.includes('admin=true');
            if (isAdmin) {
                document.querySelectorAll('.acoes').forEach(coluna => coluna.style.display = 'table-cell');
                document.getElementById('adminActions').style.display = 'flex';
            } else {
                document.querySelectorAll('.acoes').forEach(coluna => coluna.style.display = 'none');
                document.getElementById('adminActions').style.display = 'none';
            }

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
                    showPopup('Item adicionado com sucesso!', 'success');
                }).catch(error => {
                    showPopup('Erro ao adicionar item.', 'error');
                    console.error('Erro ao adicionar item: ', error);
                });
                document.getElementById('itemName').value = '';
                document.getElementById('itemQuantity').value = '';
            } else {
                showPopup('Por favor, preencha todos os campos.', 'warning');
            }
        }

        function removeItem(id, categoria) {
            const itemRef = database.ref(`${categoria}/${id}`);
            itemRef.remove()
                .then(() => {
                    const row = document.querySelector(`tr[data-id="${id}"]`);
                    if (row) row.remove();
                    showPopup('Item removido com sucesso!', 'success');
                })
                .catch((error) => {
                    showPopup('Erro ao remover item.', 'error');
                    console.error('Erro ao remover item do Firebase: ', error);
                });
        }

        function showPopup(message, type) {
            const popup = document.createElement('div');
            popup.classList.add('popup', type);
            popup.textContent = message;

            Object.assign(popup.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '15px 20px',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: '1000',
                opacity: '0',
                transition: 'opacity 0.5s ease'
            });

            if (type === 'success') popup.style.backgroundColor = '#4CAF50';
            if (type === 'error') popup.style.backgroundColor = '#F44336';
            if (type === 'warning') popup.style.backgroundColor = '#FFC107';

            document.body.appendChild(popup);
            setTimeout(() => popup.style.opacity = '1', 100);
            setTimeout(() => {
                popup.style.opacity = '0';
                setTimeout(() => popup.remove(), 500);
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