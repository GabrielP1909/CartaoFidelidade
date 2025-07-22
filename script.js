// Lógica JavaScript para interatividade da página

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML
    const homePage = document.getElementById('homePage');
    const loginPage = document.getElementById('loginPage');
    const registerPage = document.getElementById('registerPage');
    const clientPanel = document.getElementById('clientPanel');

    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const goToRegisterBtn = document.getElementById('goToRegisterBtn');
    const goToLoginBtn = document.getElementById('goToLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileMenuButton = document.getElementById('mobileMenuButton'); // Mantido para o event listener
    const mobileMenu = document.getElementById('mobileMenu');
    const header = document.querySelector('header'); // Referência ao cabeçalho
    const valkiriasLogo = document.getElementById('valkiriasLogo'); // Adicionado: Referência ao logo Valkirias

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    const clientName = document.getElementById('clientName');
    const clientEmail = document.getElementById('clientEmail');
    const qrcodeDiv = document.getElementById('qrcode');
    const currentPoints = document.getElementById('currentPoints');
    const pointsToNextReward = document.getElementById('pointsToNextReward');
    const rewardsRedeemed = document.getElementById('rewardsRedeemed');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const addPointsBtn = document.getElementById('addPointsBtn');
    const transactionHistory = document.getElementById('transactionHistory');
    const rewardsList = document.getElementById('rewardsList');

    // Elementos do modal de resgate
    const redeemModal = document.getElementById('redeemModal');
    const modalRewardName = document.getElementById('modalRewardName');
    const modalRewardDescription = document.getElementById('modalRewardDescription');
    const modalRewardCost = document.getElementById('modalRewardCost');
    const modalCurrentPoints = document.getElementById('modalCurrentPoints');
    const confirmRedeemBtn = document.getElementById('confirmRedeemBtn');
    const cancelRedeemBtn = document.getElementById('cancelRedeemBtn');

    // Elementos do painel do cliente (abas)
    const dashboardNavItems = document.querySelectorAll('.dashboard-nav-item');
    const dashboardContents = document.querySelectorAll('.dashboard-content');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone'); // Adicionado para o perfil

    let currentLoggedInUserData = null; // Variável para armazenar os dados do usuário logado

    // --- Funções de Controle de Visibilidade de Seções ---
    const showSection = (sectionToShow) => {
        // Esconde todas as seções principais com transição
        [homePage, loginPage, registerPage, clientPanel].forEach(section => {
            section.classList.remove('active'); // Remove a classe 'active' para iniciar a transição de saída
            section.classList.add('hidden');
        });

        // Mostra a seção desejada com transição
        sectionToShow.classList.remove('hidden');
        // Força o reflow para garantir que a transição ocorra
        void sectionToShow.offsetWidth; 
        sectionToShow.classList.add('active');

        // Fecha o menu mobile se estiver aberto
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
        }
        // Garante que o scroll do body seja reativado ao mudar de seção
        document.body.classList.remove('no-scroll');
    };

    // --- Funções de Atualização do Painel do Cliente (Simuladas) ---
    const updateClientPanel = (userData) => {
        currentLoggedInUserData = userData; // Armazena os dados do usuário

        if (clientName) clientName.textContent = userData.name;
        if (clientEmail) clientEmail.textContent = userData.email;
        if (profileName) profileName.textContent = userData.name;
        if (profileEmail) profileEmail.textContent = userData.email;
        if (profilePhone) profilePhone.textContent = userData.phone || 'Não informado'; // Adiciona telefone ao perfil

        // Gerar QR Code
        if (qrcodeDiv && typeof QRCode !== 'undefined') {
            qrcodeDiv.innerHTML = '';
            new QRCode(qrcodeDiv, {
                text: `valkirias-client-id-${userData.id}`,
                width: 100,
                height: 100,
                colorDark : "#D32F2F",
                colorLight : "#1A1A1A",
                correctLevel : QRCode.CorrectLevel.H
            });
        }

        // Atualizar Pontos
        if (currentPoints && pointsToNextReward && progressBar && progressText) {
            const totalPointsNeeded = 100;
            const remainingPoints = totalPointsNeeded - userData.points;

            currentPoints.textContent = userData.points;
            pointsToNextReward.textContent = remainingPoints > 0 ? remainingPoints : 0;
            
            const progressPercentage = (userData.points / totalPointsNeeded) * 100;
            progressBar.style.width = `${Math.min(progressPercentage, 100)}%`;
            progressText.textContent = `${userData.points} de ${totalPointsNeeded} pontos`;
        }

        // Atualizar Recompensas Resgatadas
        if (rewardsRedeemed) {
            rewardsRedeemed.textContent = userData.rewardsRedeemedCount;
        }

        // Atualizar Histórico de Transações
        if (transactionHistory) {
            transactionHistory.innerHTML = '';
            if (userData.transactions && userData.transactions.length > 0) {
                userData.transactions.forEach(transaction => {
                    const transactionDiv = document.createElement('div');
                    transactionDiv.classList.add('bg-grayDark', 'p-4', 'rounded-lg', 'border-accent-gradient');
                    transactionDiv.innerHTML = `
                        <div class="flex justify-between items-center mb-1">
                            <p class="text-primary font-semibold">${transaction.description}</p>
                            <span class="${transaction.pointsChange > 0 ? 'text-accent' : 'text-red-500'} font-bold">${transaction.pointsChange > 0 ? '+' : ''}${transaction.pointsChange} Pontos</span>
                        </div>
                        <p class="text-grayLight text-sm">Data: ${transaction.date}</p>
                    `;
                    transactionHistory.appendChild(transactionDiv);
                });
            } else {
                transactionHistory.innerHTML = '<p class="text-grayLight text-center mt-4">Nenhuma transação recente.</p>';
            }
        }

        // Atualizar Recompensas Disponíveis
        if (rewardsList) {
            rewardsList.innerHTML = '';
            const availableRewards = [
                { id: 'pizza', name: 'Pizza Média Grátis', cost: 100, icon: 'fas fa-pizza-slice', description: 'Resgate 1 pizza média de qualquer sabor.' },
                { id: 'soda', name: 'Refrigerante Grátis', cost: 30, icon: 'fas fa-wine-bottle', description: 'Resgate 1 refrigerante de 2L.' },
                { id: 'dessert', name: 'Sobremesa Especial', cost: 50, icon: 'fas fa-ice-cream', description: 'Resgate uma sobremesa especial do dia.' },
            ];

            if (availableRewards.length > 0) {
                availableRewards.forEach(reward => {
                    const rewardDiv = document.createElement('div');
                    rewardDiv.classList.add('bg-grayDark', 'p-5', 'rounded-lg', 'border', 'border-grayMedium', 'text-center');
                    rewardDiv.innerHTML = `
                        <i class="${reward.icon} text-5xl text-accent mb-3"></i>
                        <h4 class="font-bold text-xl text-primary mb-2">${reward.name}</h4>
                        <p class="text-grayLight mb-4">${reward.description}</p>
                        <p class="text-accent font-bold text-lg mb-4">${reward.cost} Pontos</p>
                        <button class="bg-accent hover:bg-accentDark text-secondary font-bold py-2 px-5 rounded-full transition duration-300 btn-shine redeem-reward-btn" data-reward-id="${reward.id}" data-reward-name="${reward.name}" data-reward-cost="${reward.cost}" data-reward-description="${reward.description}">
                            Resgatar
                        </button>
                    `;
                    rewardsList.appendChild(rewardDiv);
                });
                // Adiciona event listeners aos novos botões de resgate
                document.querySelectorAll('.redeem-reward-btn').forEach(button => {
                    button.addEventListener('click', openRedeemModal);
                });
            } else {
                rewardsList.innerHTML = '<p class="text-grayLight text-center col-span-full mt-4">Nenhuma recompensa disponível no momento.</p>';
            }
        }
    };

    // --- Funções do Modal de Resgate ---
    let selectedReward = null;

    const openRedeemModal = (e) => {
        const button = e.currentTarget;
        selectedReward = {
            id: button.dataset.rewardId,
            name: button.dataset.rewardName,
            cost: parseInt(button.dataset.rewardCost),
            description: button.dataset.rewardDescription
        };

        modalRewardName.textContent = selectedReward.name;
        modalRewardDescription.textContent = selectedReward.description;
        modalRewardCost.textContent = selectedReward.cost;
        modalCurrentPoints.textContent = currentLoggedInUserData.points;

        redeemModal.classList.remove('hidden');
    };

    const closeRedeemModal = () => {
        redeemModal.classList.add('hidden');
        selectedReward = null;
    };

    const confirmRedeem = () => {
        if (!selectedReward || !currentLoggedInUserData) return;

        if (currentLoggedInUserData.points >= selectedReward.cost) {
            currentLoggedInUserData.points -= selectedReward.cost;
            currentLoggedInUserData.rewardsRedeemedCount = (currentLoggedInUserData.rewardsRedeemedCount || 0) + 1;
            
            // Adiciona a transação de resgate
            currentLoggedInUserData.transactions.unshift({
                description: `Resgate de Recompensa (${selectedReward.name})`,
                pointsChange: -selectedReward.cost,
                date: new Date().toLocaleString()
            });

            updateClientPanel(currentLoggedInUserData);
            alert(`Recompensa "${selectedReward.name}" resgatada com sucesso!`);
            closeRedeemModal();
        } else {
            alert('Pontos insuficientes para resgatar esta recompensa.');
        }
    };

    // --- Event Listeners ---

    // Navegação principal
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showSection(loginPage));
    }
    if (registerBtn) {
        registerBtn.addEventListener('click', () => showSection(registerPage));
    }

    // Navegação dentro dos formulários
    if (goToRegisterBtn) {
        goToRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(registerPage);
        });
    }
    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(loginPage);
        });
    }

    // Menu Mobile
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('active'); // Alterna a classe 'active' para mostrar/esconder
            // Adiciona/remove a classe 'no-scroll' ao body
            document.body.classList.toggle('no-scroll');
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentLoggedInUserData = null; // Limpa os dados do usuário
            alert('Você foi desconectado.');
            showSection(homePage);
        });
    }

    // Adicionado: Voltar para a página inicial ao clicar no logo Valkirias
    if (valkiriasLogo) {
        valkiriasLogo.addEventListener('click', () => {
            showSection(homePage);
            window.scrollTo(0, 0); // Rola para o topo da página
        });
    }

    // Simulação de Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const loginEmail = document.getElementById('loginEmail').value;
            const loginPassword = document.getElementById('loginPassword').value;

            if (loginEmail === 'teste@valkirias.com' && loginPassword === '123') {
                const userData = {
                    id: '12345',
                    name: 'João Silva',
                    email: 'joao.silva@example.com',
                    phone: '(11) 98765-4321', // Adicionado telefone para o perfil
                    points: 75,
                    rewardsRedeemedCount: 2,
                    transactions: [
                        { description: 'Compra na Pizzaria Valkirias', pointsChange: 10, date: '2023-10-26 19:30' },
                        { description: 'Resgate de Recompensa (Pizza Grátis)', pointsChange: -100, date: '2023-10-20 18:00' },
                        { description: 'Compra na Pizzaria Valkirias', pointsChange: 15, date: '2023-10-15 20:00' }
                    ]
                };
                updateClientPanel(userData);
                showSection(clientPanel);
                // Ativa a primeira aba do dashboard por padrão
                dashboardNavItems[0].click(); 
            } else {
                alert('E-mail/Telefone ou senha incorretos. Tente: teste@valkirias.com / 123');
            }
        });
    }

    // Simulação de Registro
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const registerName = document.getElementById('registerName').value;
            const registerPhone = document.getElementById('registerPhone').value;
            const registerEmail = document.getElementById('registerEmail').value;
            const registerPassword = document.getElementById('registerPassword').value;
            const registerConfirmPassword = document.getElementById('registerConfirmPassword').value;

            if (registerPassword !== registerConfirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }
            alert(`Cadastro de ${registerName} realizado com sucesso! Faça login para acessar sua conta.`);
            showSection(loginPage);
        });
    }

    // Simulação de Adicionar Pontos (Botão Admin)
    if (addPointsBtn) {
        addPointsBtn.addEventListener('click', () => {
            if (!currentLoggedInUserData) {
                alert('Nenhum usuário logado para adicionar pontos.');
                return;
            }
            let current = currentLoggedInUserData.points;
            current += 10;
            currentLoggedInUserData.points = current;
            currentLoggedInUserData.transactions.unshift({
                description: 'Pontos adicionados (Admin)',
                pointsChange: 10,
                date: new Date().toLocaleString()
            });
            updateClientPanel(currentLoggedInUserData);
            alert(`10 pontos adicionados! Total: ${current}`);
        });
    }

    // Event Listeners para o modal de resgate
    if (cancelRedeemBtn) {
        cancelRedeemBtn.addEventListener('click', closeRedeemModal);
    }
    if (confirmRedeemBtn) {
        confirmRedeemBtn.addEventListener('click', confirmRedeem);
    }

    // Ativar o item do menu do dashboard e mostrar o conteúdo correspondente
    if (dashboardNavItems.length > 0) {
        dashboardNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove 'active' de todos os itens de navegação e esconde todos os conteúdos
                dashboardNavItems.forEach(navItem => navItem.classList.remove('active', 'text-accent', 'font-semibold'));
                dashboardContents.forEach(content => content.classList.add('hidden'));

                // Adiciona 'active' ao item clicado
                e.currentTarget.classList.add('active', 'text-accent', 'font-semibold');

                // Mostra o conteúdo correspondente
                const targetSectionId = e.currentTarget.dataset.section + 'Content';
                const targetContent = document.getElementById(targetSectionId);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                }
            });
        });
    }

    // Adiciona event listeners para os links do menu mobile para fechar o menu ao clicar
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active'); // Fecha o menu ao clicar em um link
            document.body.classList.remove('no-scroll'); // Remove a classe no-scroll ao fechar o menu
        });
    });

    // Função para ajustar a posição e altura do menu mobile dinamicamente
    const adjustMobileMenuPosition = () => {
        if (header && mobileMenu) {
            const headerHeight = header.offsetHeight; // Obtém a altura renderizada do cabeçalho
            const overlapPixels = 1; // Quantos pixels a barra lateral deve sobrepor o cabeçalho

            mobileMenu.style.top = `${headerHeight - overlapPixels}px`; // Move 1px para cima para sobrepor
            mobileMenu.style.height = `calc(100% - ${headerHeight - overlapPixels}px)`; // Ajusta a altura para compensar
        }
    };

    // Chama a função ao carregar a página
    adjustMobileMenuPosition();

    // Chama a função ao redimensionar a janela (para lidar com rotação de tela, etc.)
    window.addEventListener('resize', adjustMobileMenuPosition);


    // Inicialmente, mostra a página inicial
    showSection(homePage);
});
