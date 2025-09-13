// Lógica JavaScript para interatividade da página

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML
    const homePage = document.getElementById('homePage');
    const loginPage = document.getElementById('loginPage');
    const registerPage = document.getElementById('registerPage');
    const clientPanel = document.getElementById('clientPanel');

    const loginBtn = document.getElementById('loginBtn'); // Botão de login na home
    const registerBtn = document.getElementById('registerBtn'); // Botão de registro na home
    const goToRegisterBtn = document.getElementById('goToRegisterBtn');
    const goToLoginBtn = document.getElementById('goToLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Novos elementos para o menu lateral (sidebar)
    const openSidebarBtn = document.getElementById('openSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const header = document.querySelector('header'); // Mantido para ajuste de posição da sidebar
    const valkiriasLogo = document.getElementById('valkiriasLogo');

    // Novos botões de login/registro no menu lateral
    const loginBtnSidebar = document.getElementById('loginBtnSidebar');
    const registerBtnSidebar = document.getElementById('registerBtnSidebar');

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

    // Elementos do painel do cliente (abas)
    const dashboardNavItems = document.querySelectorAll('.dashboard-nav-item');
    const dashboardContents = document.querySelectorAll('.dashboard-content');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');

    // Elementos do novo modal de links (botão de "settings")
    const showAllLinksBtn = document.getElementById('showAllLinksBtn');
    const allLinksModal = document.getElementById('allLinksModal');
    const closeAllLinksModalBtn = document.getElementById('closeAllLinksModalBtn');
    const allLinksList = document.getElementById('allLinksList');

    // Elementos dos modais dos cards "Compre", "Acumule", "Resgate"
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal-btn');

    // Novos elementos para o efeito de foco nos cards (valCardsGrid é mantido)
    const valCardsGrid = document.querySelector('.val-cards-grid');

    // Variável para rastrear o card atualmente ativo para o efeito de foco
    let currentActiveCard = null;
    let isScrolling = false; // Flag para controlar o requestAnimationFrame

    // Variável para salvar a posição do scroll
    let lastScrollPosition = 0;
    // Variável para salvar a largura da barra de rolagem
    let scrollBarWidth = 0;

    // --- Funções de Controle de Visibilidade de Seções ---
    const showSection = (sectionToShow) => {
        // Oculta todas as seções com transição
        [homePage, loginPage, registerPage, clientPanel].forEach(section => {
            if (section !== sectionToShow) {
                section.classList.remove('active');
                // Adiciona a classe 'hidden' após um pequeno delay para permitir a transição de saída
                setTimeout(() => {
                    section.classList.add('hidden');
                }, 500); // Deve ser igual ou maior que a duração da transição CSS
            }
        });

        // Remove 'hidden' imediatamente para que a transição de entrada possa começar
        sectionToShow.classList.remove('hidden');
        // Força o reflow para garantir que a transição ocorra
        void sectionToShow.offsetWidth;
        // Adiciona 'active' para iniciar a transição de entrada
        sectionToShow.classList.add('active');

        // Fecha o menu lateral se estiver aberto
        if (sidebarMenu.classList.contains('active')) {
            sidebarMenu.classList.remove('active');
        }
        // Garante que o scroll do body seja reativado ao mudar de seção,
        // mas apenas se não houver um modal aberto.
        if (!document.querySelector('.modal-overlay:not(.hidden)')) {
            enableBodyScroll(); // Usa a função para reabilitar o scroll
        }

        // Ao mudar de seção, remove o efeito 'is-in-view' de todos os cards
        // para garantir um estado limpo ao retornar à homePage
        if (valCardsGrid) {
            valCardsGrid.querySelectorAll('.container-card').forEach(cardContainer => {
                cardContainer.classList.remove('is-in-view');
            });
            currentActiveCard = null; // Reseta o card ativo
        }

        // Se a página inicial for mostrada, re-avalia o foco dos cards
        if (sectionToShow === homePage) {
            updateCardFocus();
        }
    };

    // --- Funções de Atualização do Painel do Cliente (Simuladas) ---
    const updateClientPanel = (userData) => {
        // Variável para armazenar os dados do usuário logado (mantida localmente na função)
        let currentLoggedInUserData = userData;

        if (clientName) clientName.textContent = userData.name;
        if (clientEmail) clientEmail.textContent = userData.email;
        if (profileName) profileName.textContent = userData.name;
        if (profileEmail) profileEmail.textContent = userData.email;
        if (profilePhone) profilePhone.textContent = userData.phone || 'Não informado';

        // Gerar QR Code
        if (qrcodeDiv && typeof QRCode !== 'undefined') {
            qrcodeDiv.innerHTML = '';
            new QRCode(qrcodeDiv, {
                text: `valkirias-client-id-${userData.id}`,
                width: 100,
                height: 100,
                colorDark: "#D32F2F",
                colorLight: "#1A1A1A",
                correctLevel: QRCode.CorrectLevel.H
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
                    transactionDiv.classList.add('transaction-item'); // Usando a nova classe CSS
                    transactionDiv.innerHTML = `
                        <div class="transaction-header">
                            <p class="transaction-description">${transaction.description}</p>
                            <span class="transaction-points ${transaction.pointsChange > 0 ? 'positive' : 'negative'}">${transaction.pointsChange > 0 ? '+' : ''}${transaction.pointsChange} Pontos</span>
                        </div>
                        <p class="transaction-date">Data: ${transaction.date}</p>
                    `;
                    transactionHistory.appendChild(transactionDiv);
                });
            } else {
                transactionHistory.innerHTML = '<p class="text-gray-light text-center mt-4">Nenhuma transação recente.</p>';
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
                    rewardDiv.classList.add('reward-item'); // Usando a nova classe CSS
                    rewardDiv.innerHTML = `
                        <i class="${reward.icon} reward-icon mb-3"></i>
                        <h4 class="reward-name">${reward.name}</h4>
                        <p class="reward-description">${reward.description}</p>
                        <p class="reward-cost">${reward.cost} Pontos</p>
                        <button class="redeem-reward-btn btn-shine" data-reward-id="${reward.id}" data-reward-name="${reward.name}" data-reward-cost="${reward.cost}" data-reward-description="${reward.description}">
                            Resgatar
                        </button>
                    `;
                    rewardsList.appendChild(rewardDiv);
                });
            } else {
                rewardsList.innerHTML = '<p class="text-gray-light text-center col-span-full mt-4">Nenhuma recompensa disponível no momento.</p>';
            }
        }
    };

    // --- Funções para o Modal de Links (Botão de "Settings") ---
    const populateAllLinksModal = () => {
        allLinksList.innerHTML = ''; // Limpa a lista antes de preencher

        // Coleta todos os links <a> visíveis no documento
        // Filtra links que não são apenas '#' e que têm texto ou aria-label
        const allLinks = document.querySelectorAll('a[href]:not([class*="hidden"])');
        const uniqueLinks = new Map(); // Usar Map para garantir links únicos e manter a ordem de inserção

        // Adiciona o link "Início" manualmente no topo
        uniqueLinks.set('home', { href: '#homePage', text: 'Início' });

        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            let text = link.textContent.trim();

            // Ignorar links vazios ou âncoras internas sem texto significativo
            if (!href || href === '#' || text === '') {
                // Tenta pegar texto de aria-label se o textContent estiver vazio
                if (link.getAttribute('aria-label')) {
                    text = link.getAttribute('aria-label');
                } else if (link.querySelector('img')) {
                    text = link.querySelector('img').alt || 'Imagem Link';
                } else {
                    return; // Se ainda não tiver texto, ignora
                }
            }

            // Tentar obter texto mais significativo para botões ou elementos com ícones
            if (link.tagName === 'BUTTON' && link.querySelector('i')) {
                text = link.textContent.trim() || link.querySelector('i').className.replace('fas fa-', '').replace('-', ' ').toUpperCase();
            } else if (text === '' && link.getAttribute('aria-label')) {
                text = link.getAttribute('aria-label');
            } else if (text === '' && link.querySelector('img')) {
                text = link.querySelector('img').alt || 'Imagem Link';
            }

            // Se o texto ainda estiver vazio, usar o href como fallback
            if (text === '') {
                text = href;
            }

            // Normalizar o texto para evitar duplicatas como "Início" e "início"
            const normalizedText = text.toLowerCase();

            // Adiciona ao mapa se ainda não existir
            if (!uniqueLinks.has(normalizedText)) {
                uniqueLinks.set(normalizedText, { href, text });
            }
        });

        // Adicionar links de formulários que não são <a> mas levam a seções
        uniqueLinks.set('login', { href: '#loginPage', text: 'Página de Login' });
        uniqueLinks.set('register', { href: '#registerPage', text: 'Página de Cadastro' });
        uniqueLinks.set('clientpanel', { href: '#clientPanel', text: 'Painel do Cliente (Apenas para Teste)' });


        // Adiciona os links ao modal
        uniqueLinks.forEach(linkData => {
            const listItem = document.createElement('li');
            const anchor = document.createElement('a');
            anchor.href = linkData.href;
            anchor.textContent = linkData.text;
            // Adiciona um event listener para fechar o modal ao clicar no link
            anchor.addEventListener('click', (e) => {
                e.preventDefault(); // Previne o comportamento padrão do link
                // Se for um link de seção, mostra a seção
                if (linkData.href.startsWith('#')) {
                    const targetId = linkData.href.substring(1);
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        showSection(targetSection);
                    }
                } else {
                    // Para links externos ou outros, redireciona
                    window.location.href = linkData.href;
                }
                hideModal(allLinksModal); // Usa a nova função para fechar o modal
            });
            listItem.appendChild(anchor);
            allLinksList.appendChild(listItem);
        });
    };

    // --- Lógica de Foco de Cards (Substituindo IntersectionObserver) ---
    const updateCardFocus = () => {
        // Apenas aplica a lógica em telas mobile
        if (window.innerWidth < 768 && valCardsGrid) {
            let bestCardElement = null;
            let minDistanceToCenter = Infinity;
            const viewportCenterY = window.innerHeight / 2;

            valCardsGrid.querySelectorAll('.card').forEach(card => {
                const cardContainer = card.querySelector('.container-card');
                if (!cardContainer) return;

                const cardRect = card.getBoundingClientRect();
                const cardCenterY = cardRect.top + cardRect.height / 2;
                const distanceToCenter = Math.abs(cardCenterY - viewportCenterY);

                // Verifica se o card está visível na viewport
                const isVisible = cardRect.bottom > 0 && cardRect.top < window.innerHeight;

                if (isVisible && distanceToCenter < minDistanceToCenter) {
                    minDistanceToCenter = distanceToCenter;
                    bestCardElement = cardContainer;
                }
            });

            // Ativa o melhor card e desativa os outros
            if (bestCardElement && bestCardElement !== currentActiveCard) {
                if (currentActiveCard) {
                    currentActiveCard.classList.remove('is-in-view');
                }
                bestCardElement.classList.add('is-in-view');
                currentActiveCard = bestCardElement;
            } else if (!bestCardElement && currentActiveCard) {
                // Se nenhum card está visível o suficiente, desativa o último ativo
                currentActiveCard.classList.remove('is-in-view');
                currentActiveCard = null;
            }
        } else {
            // Em desktop, garante que a classe 'is-in-view' seja removida de todos os cards
            if (valCardsGrid) {
                valCardsGrid.querySelectorAll('.container-card').forEach(cardContainer => {
                    cardContainer.classList.remove('is-in-view');
                });
            }
            currentActiveCard = null; // Reseta o card ativo em desktop
        }
    };

    // Função para otimizar a execução de updateCardFocus no scroll
    const handleScroll = () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                updateCardFocus();
                isScrolling = false;
            });
            isScrolling = true;
        }
    };

    // --- Funções para controlar o scroll do body e evitar o "pulo" ---
    const disableBodyScroll = () => {
        lastScrollPosition = window.scrollY; // Salva a posição atual do scroll
        document.body.style.overflow = 'hidden'; // Trava o scroll no body
        document.documentElement.style.overflow = 'hidden'; // Trava o scroll no html também

        // Calcula a largura da barra de rolagem para evitar o "salto" horizontal
        const documentWidth = document.documentElement.clientWidth;
        const windowWidth = window.innerWidth;
        scrollBarWidth = windowWidth - documentWidth;
        if (scrollBarWidth > 0) {
            document.body.style.paddingRight = `${scrollBarWidth}px`;
            // Ajusta o header fixo para não "saltar"
            if (header) {
                header.style.paddingRight = `${scrollBarWidth}px`;
            }
        }
    };

    const enableBodyScroll = () => {
        document.body.style.overflow = ''; // Remove o overflow do body
        document.documentElement.style.overflow = ''; // Remove o overflow do html

        document.body.style.paddingRight = ''; // Remove o padding da barra de rolagem
        if (header) {
            header.style.paddingRight = ''; // Remove o padding do header
        }
        window.scrollTo(0, lastScrollPosition); // RESTAURADO: Restaura a posição do scroll
    };

    // --- Funções para mostrar e esconder modais ---
    const showModal = (modalElement, cardElement = null) => {
        // Identifica se é um modal de "Saiba Mais"
        const isSaibaMaisModal = modalElement.id === 'compreModal' || 
                                 modalElement.id === 'acumuleModal' || 
                                 modalElement.id === 'resgateModal';

        // Desabilita o scroll apenas se for mobile OU se não for um modal de "Saiba Mais"
        if (window.innerWidth < 768 || !isSaibaMaisModal) {
            disableBodyScroll(); // Impede a rolagem do body e mantém a posição
        } else {
            // Se for um modal de "Saiba Mais" e for desktop, não desabilita o scroll do body.
            // Apenas garante que o modal-overlay seja exibido e fixo.
            modalElement.style.position = 'fixed';
            modalElement.style.top = '0';
            modalElement.style.left = '0';
            modalElement.style.width = '100vw';
            modalElement.style.height = '100vh';
        }
        
        modalElement.classList.remove('hidden'); // Mostra o overlay

        const modalContent = modalElement.querySelector('.modal-content');

        if (cardElement && modalContent) {
            // Temporariamente mostra o modal-content para calcular a altura
            modalContent.style.visibility = 'hidden';
            modalContent.style.display = 'block'; // Garante que o conteúdo esteja visível para cálculo

            const cardRect = cardElement.getBoundingClientRect();
            const modalContentHeight = modalContent.offsetHeight;

            // Calcula a posição vertical do card na viewport
            const cardCenterYInViewport = cardRect.top + (cardRect.height / 2);

            // Calcula a posição ideal para o topo do modal-content para que ele apareça centralizado com o card
            let targetTop = cardCenterYInViewport - (modalContentHeight / 2);

            // Ajusta para garantir que o modal não saia da tela na parte superior ou inferior
            targetTop = Math.max(0, targetTop); // Não deixa o modal ir acima do topo da viewport
            targetTop = Math.min(targetTop, window.innerHeight - modalContentHeight); // Não deixa o modal ir abaixo do final da viewport

            // Aplica a posição usando transform para melhor performance e evitar reflows
            // O modal-overlay já tem display: flex, align-items: center, justify-content: center
            // Então, o transform translateY ajustará a posição vertical a partir do centro
            // A centralização padrão do flexbox é (window.innerHeight - modalContentHeight) / 2
            // Precisamos compensar essa centralização para mover o modal para o targetTop
            const currentCenterOffset = (window.innerHeight - modalContentHeight) / 2;
            const translateYValue = targetTop - currentCenterOffset;

            modalContent.style.transform = `translateY(${translateYValue}px)`;
            modalContent.style.marginTop = 'auto'; // Mantém a centralização horizontal via flexbox
            modalContent.style.marginBottom = 'auto'; // Mantém a centralização horizontal via flexbox

            // Restaura a visibilidade
            modalContent.style.visibility = '';
            modalContent.style.display = ''; // Volta ao display padrão do CSS
        } else if (modalContent) {
            // Se não houver card, centraliza o modal-content na viewport (comportamento padrão)
            modalContent.style.transform = 'translateY(0)'; // Reseta qualquer transformação
            modalContent.style.marginTop = 'auto'; // Centraliza via flexbox
            modalContent.style.marginBottom = 'auto'; // Centraliza via flexbox
        }

        // Ao abrir um modal, remove o efeito 'is-in-view' de todos os cards
        if (valCardsGrid) {
            valCardsGrid.querySelectorAll('.container-card').forEach(cardContainer => {
                cardContainer.classList.remove('is-in-view');
            });
        }
        currentActiveCard = null; // Garante que nenhum card esteja ativo enquanto o modal está aberto
    };

    const hideModal = (modalElement) => {
        modalElement.classList.add('hidden');
        
        // Identifica se é um modal de "Saiba Mais"
        const isSaibaMaisModal = modalElement.id === 'compreModal' || 
                                 modalElement.id === 'acumuleModal' || 
                                 modalElement.id === 'resgateModal';

        // Reabilita o scroll apenas se ele foi desabilitado por showModal
        // Ou seja, se a largura da janela for menor que 768px OU se não for um modal de "Saiba Mais"
        if (window.innerWidth < 768 || !isSaibaMaisModal) {
            enableBodyScroll(); // Reabilita o scroll do body e restaura a posição
        } else {
            // Se for um modal de "Saiba Mais" e for desktop, apenas esconde o overlay
            // e reseta as propriedades de estilo que foram definidas para fixar o overlay.
            modalElement.style.position = '';
            modalElement.style.top = '';
            modalElement.style.left = '';
            modalElement.style.width = '';
            modalElement.style.height = '';
        }

        // Reseta o posicionamento do modal-content para o padrão CSS
        const modalContent = modalElement.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = '';
            modalContent.style.marginTop = '';
            modalContent.style.marginBottom = '';
        }

        // Ao fechar um modal, re-avalia o foco dos cards se estiver na homePage
        if (!homePage.classList.contains('hidden')) {
            updateCardFocus();
        }
    };


    // --- Event Listeners ---

    // Navegação principal (botões da home page)
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showSection(loginPage));
    }
    if (registerBtn) {
        registerBtn.addEventListener('click', () => showSection(registerPage));
    }

    // Botões de login/registro no menu lateral (sidebar)
    if (loginBtnSidebar) {
        loginBtnSidebar.addEventListener('click', () => showSection(loginPage));
    }
    if (registerBtnSidebar) {
        registerBtnSidebar.addEventListener('click', () => showSection(registerPage));
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

    // Abrir e Fechar Sidebar
    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', () => {
            sidebarMenu.classList.add('active');
            disableBodyScroll(); // Desabilita o scroll do body
        });
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebarMenu.classList.remove('active');
            enableBodyScroll(); // Reabilita o scroll do body
        });
    }

    // Fechar sidebar ao clicar em um link dentro dela
    const sidebarLinks = sidebarMenu.querySelectorAll('a, button');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Apenas fechar se não for um botão de login/registro que já muda de seção
            if (!link.classList.contains('btn')) {
                sidebarMenu.classList.remove('active');
                enableBodyScroll();
            }
        });
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Você foi desconectado.');
            showSection(homePage);
        });
    }

    // Voltar para a página inicial ao clicar no logo Valkirias
    if (valkiriasLogo) {
        valkiriasLogo.addEventListener('click', () => {
            showSection(homePage);
            window.scrollTo(0, 0);
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
                    phone: '(11) 98765-4321',
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
                if (dashboardNavItems.length > 0) {
                    dashboardNavItems[0].click();
                }
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
            const currentPointsElement = document.getElementById('currentPoints');
            if (!currentPointsElement) {
                alert('Nenhum usuário logado ou painel não carregado para adicionar pontos.');
                return;
            }
            let currentPointsValue = parseInt(currentPointsElement.textContent);
            currentPointsValue += 10;
            currentPointsElement.textContent = currentPointsValue;
            alert(`10 pontos adicionados! Total: ${currentPointsValue}`);
        });
    }

    // Ativar o item do menu do dashboard e mostrar o conteúdo correspondente
    if (dashboardNavItems.length > 0) {
        dashboardNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove 'active' de todos os itens de navegação e esconde todos os conteúdos
                dashboardNavItems.forEach(navItem => {
                    navItem.classList.remove('active');
                });
                dashboardContents.forEach(content => content.classList.add('hidden'));

                // Adiciona 'active' ao item clicado
                e.currentTarget.classList.add('active');

                // Mostra o conteúdo correspondente
                const targetSectionId = e.currentTarget.dataset.section + 'Content';
                const targetContent = document.getElementById(targetSectionId);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                }
            });
        });
    }

    // Event Listeners para o modal de "Todos os Links" (botão de "settings")
    if (showAllLinksBtn) {
        showAllLinksBtn.addEventListener('click', () => {
            populateAllLinksModal(); // Popula o modal com os links
            showModal(allLinksModal); // Usa a nova função para mostrar o modal
        });
    }

    if (closeAllLinksModalBtn) {
        closeAllLinksModalBtn.addEventListener('click', () => {
            hideModal(allLinksModal); // Usa a nova função para fechar o modal
        });
    }

    // Event Listeners para os modais dos cards "Compre", "Acumule", "Resgate"
    openModalBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Impede o comportamento padrão do link
            const modalId = e.currentTarget.dataset.modalTarget;
            const modal = document.getElementById(modalId);
            // Encontra o elemento 'card' pai do botão clicado
            const cardElement = e.currentTarget.closest('.card');
            if (modal) {
                showModal(modal, cardElement); // Passa o cardElement para posicionar o modal
            }
        });
    });

    closeModalBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.currentTarget.closest('.modal-overlay');
            if (modal) {
                hideModal(modal); // Usa a nova função para fechar o modal
            }
        });
    });

    // Função para ajustar a posição e altura do menu lateral dinamicamente
    const adjustSidebarPosition = () => {
        if (header && sidebarMenu) {
            const headerHeight = header.offsetHeight;
            // A sidebar deve começar logo abaixo do header
            sidebarMenu.style.top = `${headerHeight}px`;
            // E ocupar o restante da altura da viewport
            sidebarMenu.style.height = `calc(100vh - ${headerHeight}px)`;
        }
    };

    // Chama a função ao carregar a página e ao redimensionar a janela
    adjustSidebarPosition();
    updateCardFocus(); // Configura o foco dos cards na carga inicial

    window.addEventListener('resize', () => {
        // Não é mais necessário ajustar padding-right ou largura do header aqui
        // Apenas ajusta a posição da sidebar e o foco dos cards
        adjustSidebarPosition();
        updateCardFocus();
    });

    // Adiciona o event listener para o scroll
    window.addEventListener('scroll', handleScroll);
    // Adiciona o event listener para touchmove (para dispositivos touch)
    window.addEventListener('touchmove', handleScroll);

    // Inicialmente, mostra a página inicial
    showSection(homePage);
});
