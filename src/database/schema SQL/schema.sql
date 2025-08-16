-- Cria o banco de dados
CREATE DATABASE monitor_eqp;

-- Seleciona o banco de dados
USE monitor_eqp;

-- Cria a tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ID único do usuário
    nome VARCHAR(255) NOT NULL, -- Nome do usuário
    sobrenome VARCHAR(255) NOT NULL, -- Sobrenome do usuário
    email VARCHAR(255) NOT NULL UNIQUE, -- Email único, será o login do usuário
    senha VARCHAR(255) NOT NULL, -- Senha do usuário (deve ser armazenada com hash)
    foto_perfil TEXT, -- URL ou caminho da foto de perfil
    perfil ENUM('usuario_monitor', 'usuario_administrador', 'usuario_root') NOT NULL, -- Tipo de perfil do usuário
    ativo BOOLEAN DEFAULT FALSE, -- Indica se o usuário está ativo ou inativo
    aprovado_por INT DEFAULT NULL, -- ID do usuário que aprovou este usuário (FK para a própria tabela)
    ultima_modificacao_por INT DEFAULT NULL, -- ID do usuário que fez a última alteração (FK para a própria tabela)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data e hora de criação do registro
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Data e hora da última modificação do registro
    FOREIGN KEY (aprovado_por) REFERENCES usuarios(id) ON DELETE SET NULL, -- Relacionamento com o aprovador
    FOREIGN KEY (ultima_modificacao_por) REFERENCES usuarios(id) ON DELETE SET NULL -- Relacionamento com quem modificou
);

-- Insere o usuário root (administrador principal - senha 1234)
INSERT INTO usuarios (nome, sobrenome, email, senha, perfil, ativo) 
VALUES ('Root', 'User', 'root@system.com', '$2b$10$3FowljDj5svg4rPvLxikkOO0gSABQHCv28XzyrS4izSfL.O.0mc9K', 'usuario_root', TRUE);

-- Cria a tabela de equipamentos
CREATE TABLE equipamentos (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ID único do equipamento
    nome VARCHAR(50) NOT NULL, -- Nome do equipamento
    descricao TEXT, -- Descrição detalhada do equipamento
    mac VARCHAR(17), -- Endereço MAC do equipamento
    ip VARCHAR(15), -- Endereço IP do equipamento
    porta INT, -- Porta para conexão com o equipamento
    ativo BOOLEAN DEFAULT true, -- Indica se o equipamento está ativo ou não
    criado_por INT NOT NULL, -- ID do usuário que criou o registro (FK para usuários)
    atualizado_por INT, -- ID do usuário que atualizou o registro (FK para usuários)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data de criação do registro
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Data da última atualização
    FOREIGN KEY (criado_por) REFERENCES usuarios(id), -- Relacionamento com o criador
    FOREIGN KEY (atualizado_por) REFERENCES usuarios(id) -- Relacionamento com o atualizador
);

-- Cria a tabela de solicitações de acesso
CREATE TABLE solicitacoes_acesso (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ID único da solicitação
    nome VARCHAR(255) NOT NULL, -- Nome do solicitante
    sobrenome VARCHAR(255) NOT NULL, -- Sobrenome do solicitante
    email VARCHAR(255) NOT NULL UNIQUE, -- Email do solicitante
    senha VARCHAR(255) NOT NULL, -- Senha fornecida (armazenada com hash)
    motivo TEXT, -- Motivo ou justificativa da solicitação
    status ENUM('pendente', 'aprovado', 'rejeitado') DEFAULT 'pendente', -- Status da solicitação
    perfil_solicitado ENUM('usuario_monitor', 'usuario_administrador', 'usuario_root') DEFAULT 'usuario_monitor', -- Perfil solicitado
    aprovado_por INT DEFAULT NULL, -- ID do usuário aprovador (FK para usuários)
    rejeitado_por INT DEFAULT NULL, -- ID do usuário que rejeitou (FK para usuários)
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data da solicitação
    data_aprovacao TIMESTAMP NULL, -- Data da aprovação
    data_rejeicao TIMESTAMP NULL, -- Data da rejeição
    FOREIGN KEY (aprovado_por) REFERENCES usuarios(id) ON DELETE SET NULL, -- Relacionamento com o aprovador
    FOREIGN KEY (rejeitado_por) REFERENCES usuarios(id) ON DELETE SET NULL -- Relacionamento com quem rejeitou
);

-- Tabela de sessões de usuários
CREATE TABLE sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ID único da sessão
    usuario_id INT NOT NULL, -- ID do usuário associado (FK para usuários)
    token TEXT NOT NULL, -- Token JWT da sessão
    expiracao TIMESTAMP NOT NULL, -- Data e hora de expiração do token
    ip VARCHAR(45), -- Endereço IP do cliente
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data e hora de criação da sessão
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE -- Relacionamento com o usuário
);

-- Tabela para armazenar status de equipamentos com ping
CREATE TABLE pingtest (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ID único do pingtest
    equipamento_id INT NOT NULL UNIQUE, -- ID do equipamento monitorado
    status VARCHAR(20) NOT NULL, -- Status do equipamento ("ativo", "inativo", "falha")
    tempo_resposta FLOAT, -- Tempo de resposta do ping em milissegundos
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Data e hora da última atualização
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE -- Relacionamento com o equipamento
);

-- Tabela de logs de monitoramento
CREATE TABLE logs_monitoramento (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ID único do log
    equipamento_id INT NOT NULL, -- ID do equipamento relacionado
    ip VARCHAR(15) NOT NULL, -- IP do equipamento durante o teste
    porta INT, -- Porta configurada no equipamento
    status_ping VARCHAR(20) NOT NULL, -- Status do ping ("ativo", "inativo", "falha")
    tempo_resposta_ping FLOAT, -- Tempo de resposta do ping
    status_telnet VARCHAR(20) NOT NULL, -- Status do telnet ("ativo", "inativo", "falha")
    mensagem_telnet TEXT, -- Detalhes do telnet (sucesso, timeout, etc.)
    detalhes JSON, -- Informações adicionais do teste em formato JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data e hora do log
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE -- Relacionamento com o equipamento
);

-- Tabela de status de conexões telnet
CREATE TABLE telnet (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ID único do telnet
    equipamento_id INT NOT NULL UNIQUE, -- ID do equipamento monitorado
    status VARCHAR(20) NOT NULL, -- Status do telnet ("ativo", "inativo", "falha")
    mensagem TEXT, -- Detalhes do resultado do telnet
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Data e hora da última atualização
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE -- Relacionamento com o equipamento
);

-- Tabela de rotas (tracert)
CREATE TABLE tracert (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ID único do tracert
    equipamento_id INT NOT NULL UNIQUE, -- ID do equipamento monitorado
    protocolo VARCHAR(10) DEFAULT 'ICMP', -- Protocolo utilizado no tracert
    porta_tipo VARCHAR(10) DEFAULT 'UDP', -- Tipo de porta utilizada
    porta INT DEFAULT NULL, -- Porta configurada para o tracert
    rota JSON, -- Rota completa armazenada em JSON
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Data e hora da última atualização
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE -- Relacionamento com o equipamento
);
